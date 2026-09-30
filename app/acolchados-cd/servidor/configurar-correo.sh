#!/usr/bin/env bash
# Configura el correo de las cotizaciones en el .env del servidor.
#
# Se ejecuta EN EL SERVIDOR:
#     cd ~/srv/apps/tienda && bash configurar-correo.sh
#
# La contraseña se escribe a mano y no se ve en pantalla, así que no queda
# en el historial de bash ni en ningún registro.

set -euo pipefail

ENV=".env"
[ -f "$ENV" ] || { echo "No encuentro $ENV. ¿Estás en ~/srv/apps/tienda?"; exit 1; }

RESPALDO="$ENV.bak.$(date +%Y%m%d-%H%M%S)"
cp "$ENV" "$RESPALDO"
echo "Respaldo del .env en $RESPALDO"
echo

# Escribe clave=valor: reemplaza la línea si existe, la añade si no.
poner() {
  local clave="$1" valor="$2"
  if grep -q "^${clave}=" "$ENV"; then
    # El valor va por variable de entorno para que awk no interprete nada.
    VALOR="$valor" awk -v c="$clave" \
      'BEGIN{v=ENVIRON["VALOR"]} $0 ~ "^"c"=" {print c"="v; hecho=1; next} {print}
       END{if(!hecho) print c"="v}' "$ENV" > "$ENV.tmp"
    mv "$ENV.tmp" "$ENV"
  else
    printf '%s=%s\n' "$clave" "$valor" >> "$ENV"
  fi
}

# Lee un valor con un valor por omisión entre corchetes.
preguntar() {
  local texto="$1" omision="$2" respuesta
  read -r -p "$texto [$omision]: " respuesta
  echo "${respuesta:-$omision}"
}

echo "─── Por dónde salen los correos ─────────────────────────────────"

echo "  Gmail:  usuario = la cuenta completa,     servidor smtp.gmail.com,       puerto 587"
echo "  Brevo:  usuario = el correo de la cuenta, servidor smtp-relay.brevo.com, puerto 587"
echo "  Resend: usuario = resend,                servidor smtp.resend.com,      puerto 587"
echo
echo "  El puerto 465 está bloqueado en este servidor. Usa 587."
echo
USUARIO=$(preguntar "Usuario SMTP"       "")
SERVIDOR=$(preguntar "Servidor de salida" "smtp-relay.brevo.com")
PUERTO=$(preguntar   "Puerto"             "587")
[ -n "$USUARIO" ] || { echo "Sin usuario no hay envío. Cancelado."; exit 1; }

# El remitente que ve quien recibe. No tiene por qué ser el usuario SMTP:
# en los servicios de envío el usuario es una credencial, no una dirección.
REMITENTE=$(preguntar "Dirección que verá el destinatario" "web@vissiuss.lat")

# Gmail solo deja enviar como la cuenta autenticada (o un alias verificado
# dentro de Gmail). Si no coinciden, el envío falla con un 5.7.x que no dice
# claramente cuál es el problema.
case "$SERVIDOR" in
  *gmail*)
    if [ "$REMITENTE" != "$USUARIO" ]; then
      echo
      echo "  ⚠  Estás usando Gmail y el remitente NO es la misma cuenta."
      echo "     Google rechaza enviar en nombre de otra dirección."
      echo "     Lo correcto acá es:  $USUARIO"
      echo
      read -r -p "     ¿Uso $USUARIO como remitente? [S/n]: " USAR
      [ "${USAR,,}" = "n" ] || REMITENTE="$USUARIO"
      echo "     Remitente: $REMITENTE"
    fi
    ;;
esac

echo
printf "Contraseña o clave SMTP (no se ve al escribir): "
read -rs CLAVE
echo
[ -n "$CLAVE" ] || { echo; echo "Sin contraseña no hay envío. Cancelado."; exit 1; }

# Docker Compose interpreta $, comillas y barras al leer el .env, así que una
# contraseña con esos caracteres puede llegar mutilada al contenedor y dar un
# "usuario o clave incorrectos" que vuelve loco a cualquiera.
if printf '%s' "$CLAVE" | grep -q '[$"'"'"'\\ ]'; then
  echo
  echo "  ⚠  Esa contraseña lleva \$, comillas, barras o espacios."
  echo "     Docker los interpreta al leer el .env y puede llegar cambiada."
  echo "     Lo más simple es generar otra clave, solo con letras, números"
  echo "     y estos símbolos:  - _ . ! * +"
  echo
  read -r -p "     ¿Seguir igual de todas formas? [s/N]: " IGUAL
  [ "${IGUAL,,}" = "s" ] || { echo "     Cancelado, no se tocó nada."; rm -f "$RESPALDO"; exit 1; }
fi
echo

echo "─── A dónde llega la copia de cada cotización ───────────────────"
echo "Tiene que ser una dirección que RECIBA de verdad. Ojo: el correo de"
echo "@vissiuss.lat está caído, así que en pruebas usa tu Gmail."
echo
INTERNO=$(preguntar "Correo donde quieres recibir las cotizaciones" "")
[ -n "$INTERNO" ] || { echo "Sin destino no hay aviso interno. Cancelado."; exit 1; }

case "$INTERNO" in
  *@vissiuss.lat)
    echo
    echo "  ⚠  Ese dominio ya no recibe correo (PrivateEmail está vencido)."
    echo "     La copia interna rebotaría y no te enterarías de las cotizaciones."
    echo
    read -r -p "     ¿Seguir igual? [s/N]: " IGUAL
    [ "${IGUAL,,}" = "s" ] || { echo "     Cancelado, no se tocó nada."; rm -f "$RESPALDO"; exit 1; }
    ;;
esac
echo

echo "─── Turnstile (la barrera antibots de Cloudflare) ───────────────"
echo "Opcional por ahora: si lo dejas vacío, el formulario funciona igual."
echo "Se saca en el panel de Cloudflare → Turnstile → Add site."
echo
SITIO=$(preguntar "Clave de sitio (pública)" "")
printf "Clave secreta (no se ve al escribir): "
read -rs SECRETO
echo
echo

poner SMTP_HOST         "$SERVIDOR"
poner SMTP_PUERTO       "$PUERTO"
poner SMTP_USUARIO      "$USUARIO"
poner SMTP_CLAVE        "$CLAVE"
poner CORREO_DESDE      "$REMITENTE"
poner CORREO_NOMBRE     "Acolchados CD"
poner CORREO_INTERNO    "$INTERNO"
poner TELEFONO_CONTACTO "+56 9 9919 4045"
poner SITIO             "vissiuss.lat"
poner TURNSTILE_SITIO   "$SITIO"
poner TURNSTILE_SECRETO "$SECRETO"

chmod 600 "$ENV"

echo "Guardado. Así quedó (la contraseña va tapada):"
echo
sed -E 's/^(SMTP_CLAVE|TURNSTILE_SECRETO|ADMIN_CLAVE)=.+/\1=••••••••/' "$ENV" | sed 's/^/    /'
echo

read -r -p "¿Reconstruyo y reinicio el contenedor ahora? [s/N]: " SEGUIR
if [ "${SEGUIR,,}" = "s" ]; then
  docker compose up -d --build
  echo
  echo "Listo. Para probar el envío:"
else
  echo "No se reinició. Cuando quieras:  docker compose up -d --build"
  echo "Y para probar el envío después:"
fi

cat <<'PRUEBA'

    docker compose exec -T tienda python -c "
import correo
correo.confirmacion_al_cliente('Prueba', 'TU-CORREO-AQUI', ['Colcha con fundas'])
print('enviado')"

Cambia TU-CORREO-AQUI por una dirección tuya y revisa que llegue.
Si llega a spam, falta verificar el dominio (DKIM) en el servicio de envío.
PRUEBA
