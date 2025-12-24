/* sw-register.js - registers Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      // console.log("SW registered");
    } catch (e) {
      // console.warn("SW registration failed", e);
    }
  });
}
