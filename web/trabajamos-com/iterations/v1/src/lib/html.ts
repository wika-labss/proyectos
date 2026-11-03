const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export class Html {
  constructor(readonly valor: string) {}
  toString(): string {
    return this.valor;
  }
}

export function escapar(texto: string): string {
  return texto.replace(/[&<>"']/gu, (c) => ESCAPES[c] ?? c);
}

type Parte = Html | string | number | null | undefined | false | readonly Parte[];

function aTexto(parte: Parte): string {
  if (parte === null || parte === undefined || parte === false) return "";
  if (parte instanceof Html) return parte.valor;
  if (Array.isArray(parte)) return parte.map(aTexto).join("");
  return escapar(String(parte));
}

// Plantilla con escape automático: todo valor interpolado se escapa salvo que ya sea Html.
export function html(cadenas: TemplateStringsArray, ...valores: Parte[]): Html {
  let salida = cadenas[0] ?? "";
  valores.forEach((valor, i) => {
    salida += aTexto(valor) + (cadenas[i + 1] ?? "");
  });
  return new Html(salida);
}

export function crudo(texto: string): Html {
  return new Html(texto);
}

export function attrSi(condicion: boolean, atributo: string): Html {
  return new Html(condicion ? ` ${atributo}` : "");
}
