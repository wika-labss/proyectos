let lastCount = 0;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || data.source !== "scraping-ta") return;
  if (data.type === "xhr" && typeof data.count === "number") {
    lastCount = data.count;
  }
});

function askPage(type) {
  return new Promise((resolve) => {
    const requestId = `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const onMessage = (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== "scraping-ta" || data.requestId !== requestId) return;
      window.removeEventListener("message", onMessage);
      resolve(data);
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "scraping-ta-bridge", type, requestId }, "*");
    setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(null);
    }, 1500);
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === "count") {
    askPage("count").then((data) => {
      lastCount = (data && data.count) || lastCount;
      sendResponse({ count: lastCount, url: location.href });
    });
    return true;
  }
  if (msg.type === "collect") {
    askPage("dump").then((data) => {
      const xhr = (data && data.xhr) || [];
      lastCount = xhr.length;
      sendResponse({
        xhr,
        body: document.documentElement.outerHTML,
        url: location.href,
        count: xhr.length,
      });
    });
    return true;
  }
  return false;
});
