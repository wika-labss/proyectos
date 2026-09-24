(() => {
  const MAX = 250;
  const captured = [];

  function asText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function parseBody(raw) {
    const text = asText(raw);
    if (!text) return "";
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function absoluteUrl(raw) {
    try {
      return new URL(String(raw || ""), location.href).href;
    } catch {
      return String(raw || "");
    }
  }

  function record(url, method, body) {
    captured.push({
      url: absoluteUrl(url),
      method: String(method || "GET").toUpperCase(),
      body: parseBody(body),
    });
    if (captured.length > MAX) captured.shift();
    window.postMessage({ source: "scraping-ta", type: "xhr", count: captured.length }, "*");
  }

  function interestingResponse(contentType, text) {
    if (!text) return false;
    if (text.length > 2_500_000) return false;
    const ct = String(contentType || "").toLowerCase();
    if (!ct) return text.startsWith("{") || text.startsWith("[") || text.startsWith("<");
    return /json|text|javascript|xml|html/i.test(ct);
  }

  const origFetch = window.fetch;
  window.fetch = async function staFetch(...args) {
    const response = await origFetch.apply(this, args);
    try {
      const input = args[0];
      const init = args[1] || {};
      const url = typeof input === "string" ? input : (input && input.url) || "";
      const method = init.method || (input && input.method) || "GET";
      const clone = response.clone();
      const ct = clone.headers.get("content-type") || "";
      const text = await clone.text();
      if (interestingResponse(ct, text)) record(url, method, text);
    } catch {
      /* ignore hook errors */
    }
    return response;
  };

  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function staOpen(method, url, ...rest) {
    this.__staMethod = method;
    this.__staUrl = url;
    return origOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function staSend(...args) {
    this.addEventListener("load", function onLoad() {
      try {
        const ct = this.getResponseHeader && this.getResponseHeader("content-type");
        const text = this.responseText;
        if (interestingResponse(ct, text)) record(this.__staUrl, this.__staMethod, text);
      } catch {
        /* ignore hook errors */
      }
    });
    return origSend.apply(this, args);
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== "scraping-ta-bridge") return;
    if (data.type === "dump") {
      window.postMessage({
        source: "scraping-ta",
        type: "dump",
        requestId: data.requestId,
        xhr: captured.slice(),
        count: captured.length,
      }, "*");
    }
    if (data.type === "count") {
      window.postMessage({
        source: "scraping-ta",
        type: "count",
        requestId: data.requestId,
        count: captured.length,
      }, "*");
    }
  });
})();
