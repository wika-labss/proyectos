import asyncio
import os
import re

import httpx
from fastapi import FastAPI, HTTPException

CAM = os.getenv("CAM_HOST", "192.168.100.101")
PUERTO = os.getenv("CAM_ONVIF_PORT", "8899")
USUARIO = os.getenv("CAM_USER", "admin")
CLAVE = os.getenv("CAM_PASS", "")

MEDIA = f"http://{CAM}:{PUERTO}/onvif/media_service"
PTZ = f"http://{CAM}:{PUERTO}/onvif/ptz_service"
CABECERA = {"Content-Type": "application/soap+xml; charset=utf-8"}

DIRECCIONES = {
    "izquierda": (-0.5, 0.0),
    "derecha": (0.5, 0.0),
    "arriba": (0.0, 0.5),
    "abajo": (0.0, -0.5),
}

app = FastAPI(title="Control Vissiuss", version="1.0")
_perfil: str | None = None


async def _soap(url: str, cuerpo: str) -> str:
    async with httpx.AsyncClient(timeout=8.0) as cliente:
        r = await cliente.post(
            url,
            headers=CABECERA,
            content=cuerpo,
            auth=httpx.BasicAuth(USUARIO, CLAVE),
        )
        r.raise_for_status()
        return r.text


async def _obtener_perfil() -> str:
    """El perfil solo se pide una vez y se guarda en memoria."""
    global _perfil
    if _perfil:
        return _perfil
    xml = await _soap(
        MEDIA,
        '<?xml version="1.0"?>'
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">'
        '<s:Body><GetProfiles xmlns="http://www.onvif.org/ver10/media/wsdl"/>'
        "</s:Body></s:Envelope>",
    )
    encontrado = re.search(r'token="([^"]+)"', xml)
    if not encontrado:
        raise HTTPException(502, "La cámara no devolvió ningún perfil")
    _perfil = encontrado.group(1)
    return _perfil


async def _detener(perfil: str) -> None:
    await _soap(
        PTZ,
        '<?xml version="1.0"?>'
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body>'
        '<Stop xmlns="http://www.onvif.org/ver20/ptz/wsdl">'
        f"<ProfileToken>{perfil}</ProfileToken>"
        "<PanTilt>true</PanTilt><Zoom>true</Zoom>"
        "</Stop></s:Body></s:Envelope>",
    )


@app.get("/salud")
async def salud():
    return {"estado": "ok", "camara": CAM, "perfil": await _obtener_perfil()}


@app.post("/ptz/parar")
async def parar():
    await _detener(await _obtener_perfil())
    return {"ok": True}


@app.post("/ptz/{direccion}")
async def mover(direccion: str, duracion: float = 0.6):
    if direccion not in DIRECCIONES:
        raise HTTPException(400, f"Dirección no válida: {direccion}")

    # Límite de seguridad: nunca más de 3 segundos por pulsación
    duracion = max(0.1, min(duracion, 3.0))
    x, y = DIRECCIONES[direccion]
    perfil = await _obtener_perfil()

    await _soap(
        PTZ,
        '<?xml version="1.0"?>'
        '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body>'
        '<ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">'
        f"<ProfileToken>{perfil}</ProfileToken><Velocity>"
        f'<PanTilt x="{x}" y="{y}" xmlns="http://www.onvif.org/ver10/schema"/>'
        "</Velocity></ContinuousMove></s:Body></s:Envelope>",
    )
    await asyncio.sleep(duracion)
    await _detener(perfil)
    return {"ok": True, "direccion": direccion, "duracion": duracion}
