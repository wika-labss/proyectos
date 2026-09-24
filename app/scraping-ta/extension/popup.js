const DEFAULT_API = "https://ta.vissiuss.com";

const $ = (id) => document.getElementById(id);

function detectPlatform(url) {
  const value = String(url || "").toLowerCase();
  if (value.includes("pedidosya.")) return { platform: "peya", label: "PedidosYa" };
  if (value.includes("ubereats.") || value.includes("uber.com")) return { platform: "uber", label: "Uber Eats" };
  if (value.includes("rappi.")) return { platform: "rappi", label: "Rappi" };
  return null;
}

function parseJsonish(value) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string" || !value.trim()) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function hasNativeSignal(platform, dump) {
  const xhr = dump.xhr || [];
  if (platform === "peya") {
    return xhr.some((entry) => {
      const url = String((entry && entry.url) || "");
      const body = parseJsonish(entry && entry.body);
      return url.includes("/niles/partners/") && url.includes("/menus")
        && body && Array.isArray(body.sections);
    });
  }
  if (platform === "rappi") {
    return xhr.some((entry) => String((entry && entry.url) || "").includes("restaurants-bus/store/id/"));
  }
  if (platform === "uber") {
    return String(dump.body || "").includes("__REACT_QUERY_STATE__");
  }
  return false;
}

function setStatus(text, kind) {
  $("status").textContent = text;
  $("status").className = "meta" + (kind ? " " + kind : "");
}

function sendMessage(tabId, payload) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function activeTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

async function loadSettings() {
  const stored = await chrome.storage.local.get(["ingestKey", "apiBase", "runId"]);
  $("ingest-key").value = stored.ingestKey || "";
  $("api-base").value = stored.apiBase || DEFAULT_API;
  $("run-id").value = stored.runId || "";
}

async function saveSettings() {
  await chrome.storage.local.set({
    ingestKey: $("ingest-key").value.trim(),
    apiBase: ($("api-base").value.trim() || DEFAULT_API).replace(/\/$/, ""),
    runId: $("run-id").value.trim(),
  });
}

async function autofillRunId(apiBase, ingestKey) {
  if (!ingestKey) return;
  try {
    const res = await fetch(`${apiBase}/api/jobs/active`, {
      headers: { Authorization: `Bearer ${ingestKey}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.run_id && !$("run-id").value.trim()) {
      $("run-id").value = data.run_id;
      await saveSettings();
    }
  } catch {
    /* local uvicorn apagado o CORS */
  }
}

async function refreshPageInfo() {
  const tab = await activeTab();
  const info = detectPlatform(tab && tab.url);
  if (!info) {
    $("page").textContent = "Abrí un menú de PedidosYa, Uber Eats o Rappi.";
    $("xhr").textContent = "XHR capturados: —";
    return { tab, info: null, count: 0 };
  }
  $("page").textContent = `Canal: ${info.label}`;
  try {
    const dump = await sendMessage(tab.id, { type: "count" });
    const count = (dump && dump.count) || 0;
    $("xhr").textContent = `XHR capturados: ${count}`;
    return { tab, info, count };
  } catch {
    $("xhr").textContent = "XHR capturados: 0 (recargá el menú)";
    return { tab, info, count: 0 };
  }
}

$("send").onclick = async () => {
  $("send").disabled = true;
  setStatus("Preparando…");
  try {
    await saveSettings();
    const apiBase = ($("api-base").value.trim() || DEFAULT_API).replace(/\/$/, "");
    const ingestKey = $("ingest-key").value.trim();
    const runId = $("run-id").value.trim();
    if (!ingestKey) {
      setStatus("Pegá INGEST_KEY (la misma del servidor).", "err");
      return;
    }
    const { tab, info } = await refreshPageInfo();
    if (!tab || !info) {
      setStatus("Este sitio no es PedidosYa, Uber Eats ni Rappi.", "err");
      return;
    }
    let dump;
    try {
      dump = await sendMessage(tab.id, { type: "collect" });
    } catch {
      setStatus("No hay captura en esta pestaña. Recargá el menú.", "err");
      return;
    }
    if (!hasNativeSignal(info.platform, dump || {})) {
      setStatus("No está el menú nativo. Recargá el menú y esperá a que cargue.", "err");
      return;
    }
    const payload = {
      platform: info.platform,
      source_url: dump.url || tab.url,
      body: dump.body || "",
      xhr: dump.xhr || [],
    };
    if (runId) payload.job_id = runId;
    const res = await fetch(`${apiBase}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ingestKey}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch { /* html error */ }
    if (!res.ok) {
      const detail = typeof data.detail === "string" ? data.detail : `HTTP ${res.status}`;
      setStatus(detail, "err");
      return;
    }
    const channel = ((data.channels) || []).find((ch) => {
      const map = { peya: "pedidosya", uber: "ubereats", rappi: "rappi" };
      return ch.platform === map[info.platform];
    });
    if (channel && channel.error) {
      setStatus(channel.error, "err");
      return;
    }
    const count = channel ? (channel.item_count || 0) : 0;
    if (data.run_id) {
      $("run-id").value = data.run_id;
      await saveSettings();
    }
    setStatus(`Enviado. ${count} productos · run ${data.run_id || runId || "?"}`, "ok");
  } catch (err) {
    setStatus(String(err.message || err), "err");
  } finally {
    $("send").disabled = false;
  }
};

["ingest-key", "api-base", "run-id"].forEach((id) => {
  $(id).addEventListener("change", saveSettings);
});

(async function boot() {
  await loadSettings();
  const apiBase = ($("api-base").value.trim() || DEFAULT_API).replace(/\/$/, "");
  const ingestKey = $("ingest-key").value.trim();
  await autofillRunId(apiBase, ingestKey);
  await refreshPageInfo();
})();
