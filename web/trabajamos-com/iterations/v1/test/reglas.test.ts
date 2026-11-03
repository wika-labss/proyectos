import { describe, expect, it } from "vitest";
import { escapar, html } from "../src/lib/html.js";
import {
  contactoDato,
  contactoHref,
  distanciaTexto,
  dominioDe,
  normalizarTag,
  slugBase,
  telefonoValido,
  urlHttpsValida,
  volverSeguro,
} from "../src/lib/reglas.js";

describe("normalizarTag (04 §3.3)", () => {
  it.each([
    ["gasfiter", "#gasfiter"],
    ["Gasfiter", "#gasfiter"],
    ["#gasfiter", "#gasfiter"],
    ["# gasfiter", "#gasfiter"],
    ["##gasfiter", "#gasfiter"],
    ["  #Electricista ", "#electricista"],
    ["Gásfiter", "#gásfiter"],
    ["maestro  chasquilla", "#maestro chasquilla"],
    ["#Maestro Chasquilla ", "#maestro chasquilla"],
    ["PEÑALOLÉN", "#peñalolén"],
  ])("%j → %j", (entrada, esperado) => {
    expect(normalizarTag(entrada)).toBe(esperado);
  });

  it.each(["", "#", "##", "   ", " # # "])("%j queda sin #", (entrada) => {
    expect(normalizarTag(entrada)).toBeNull();
  });

  it("las tildes hacen oficios distintos (Gate 2)", () => {
    expect(normalizarTag("gásfiter")).not.toBe(normalizarTag("gasfiter"));
  });
});

describe("distanciaTexto (D-02)", () => {
  it.each([
    [1.23, "a 1,2 km"],
    [0.36, "a 0,4 km"],
    [12, "a 12,0 km"],
    [0, "a 0,0 km"],
  ])("%d km → %s", (km, esperado) => {
    expect(distanciaTexto(km)).toBe(esperado);
  });
});

describe("contacto (D-01, D-03)", () => {
  it("valida teléfono internacional", () => {
    expect(telefonoValido("+56 9 1234 5678")).toBe(true);
    expect(telefonoValido("9 1234 5678")).toBe(false);
    expect(telefonoValido("+56")).toBe(false);
  });

  it("solo acepta enlaces https completos", () => {
    expect(urlHttpsValida("https://www.dominio.cl/contacto")).toBe(true);
    expect(urlHttpsValida("http://dominio.cl")).toBe(false);
    expect(urlHttpsValida("https://localhost")).toBe(false);
    expect(urlHttpsValida("javascript:alert(1)")).toBe(false);
  });

  it("muestra el dato junto a Contactar", () => {
    expect(contactoDato("telefono", "+56 9 1234 5678")).toBe("Teléfono: +56 9 1234 5678");
    expect(contactoDato("correo", "juan@dominio.cl")).toBe("Correo: juan@dominio.cl");
    expect(contactoDato("url", "https://www.dominio.cl/contacto")).toBe("Sitio: dominio.cl");
    expect(dominioDe("https://www.dominio.cl/x")).toBe("dominio.cl");
  });

  it("arma el destino de Contactar", () => {
    expect(contactoHref("telefono", "+56 9 1234-5678")).toBe("tel:+56912345678");
    expect(contactoHref("correo", "a@b.cl")).toBe("mailto:a@b.cl");
  });
});

describe("slugBase", () => {
  it("quita tildes y símbolos", () => {
    expect(slugBase("Juan Pérez Gasfitería")).toBe("juan-perez-gasfiteria");
    expect(slugBase("Ñandú & Cía.")).toBe("nandu-cia");
    expect(slugBase("¡¡!!")).toBe("perfil");
  });
});

describe("volverSeguro", () => {
  it("solo acepta rutas internas del panel", () => {
    expect(volverSeguro("/panel/ofertas.html")).toBe("/panel/ofertas.html");
    expect(volverSeguro("https://malo.example/panel/")).toBeNull();
    expect(volverSeguro("//malo.example")).toBeNull();
    expect(volverSeguro("/panel/entrar.html")).toBeNull();
    expect(volverSeguro("/index.html")).toBeNull();
  });
});

describe("html", () => {
  it("escapa todo valor interpolado", () => {
    const nombre = '<script>alert("x")</script>';
    expect(html`<p>${nombre}</p>`.valor).toBe(`<p>${escapar(nombre)}</p>`);
    expect(html`<p>${nombre}</p>`.valor).not.toContain("<script>");
  });
});
