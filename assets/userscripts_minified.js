/* ================================
   NotubeTV Bootstrap (Android 6 Safe)
   ================================ */

/* 
  Script akan menunggu sampai YouTube TV siap:
  - window._yttv sudah ada
  - atau video element sudah ada
  baru kemudian menjalankan seluruh patch
*/

(function waitForYouTubeTV() {
  if (typeof window._yttv === "object" || document.querySelector("video")) {
    console.log("NotubeTV: environment ready, injecting...");
    startNotubeTV();
    return;
  }

  // retry setiap 300ms
  setTimeout(waitForYouTubeTV, 300);
})();


// ============================
//  SEMUA SCRIPT MASUK DI SINI
// ============================
function startNotubeTV() {

  console.log("NotubeTV: script running");

  /* ================================
     Start spoofViewport.js
     ================================ */

  (function () {
    var existing = document.querySelector('meta[name="viewport"]');
    if (existing) {
      existing.setAttribute("content", "width=3840, height=2160, initial-scale=1.0");
    } else {
      var meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=3840, height=2160, initial-scale=1.0";
      document.head.appendChild(meta);
    }
  })();

  /* ================================
     End spoofViewport.js
     ================================ */



  /* ================================
     Start TizenTubeScripts.js
     (ISI ASLI KAMU — TIDAK DIUBAH)
     ================================ */

  (function () {
    "use strict";

    /*  ——————————————————————————————————
        PASTE seluruh script TizenTube kamu
        mulai dari var CONFIG_KEY
        sampai akhir Menu Trigger
        ——————————————————————————————————  */

    /* seluruh kode TizenTube panjangmu DI SINI */

  })();

  /* ================================
     End TizenTubeScripts.js
     ================================ */



  /* ================================
     Start antiBannerUnified.js
     ================================ */

  (function() {

    var SELECTORS = [
      "ytd-ad-slot-renderer",
      "ytd-display-ad-renderer",
      "ytd-promoted-sparkles-web-renderer",
      "ytd-rich-section-renderer",
      "ytd-banner-promo-renderer",
      "#masthead-ad"
    ];

    function removeAds() {
      for (var i = 0; i < SELECTORS.length; i++) {
        var els = document.querySelectorAll(SELECTORS[i]);
        for (var j = 0; j < els.length; j++) {
          try { els[j].parentNode.removeChild(els[j]); } catch(e) {}
        }
      }
    }

    function startObserver() {
      try {
        if (window._ytUnifiedAdObserverStarted) return;
        window._ytUnifiedAdObserverStarted = true;
        var observer = new MutationObserver(removeAds);
        observer.observe(document.documentElement || document.body, {
          childList: true,
          subtree: true
        });
      } catch(e) {
        console.warn("antiBannerUnified observer error:", e);
      }
    }

    function initAdRemover() {
      removeAds();
      startObserver();
    }

    initAdRemover();

    var initTries = 0;
    var earlyPoll = setInterval(function() {
      removeAds();
      initTries++;
      if (initTries > 10) clearInterval(earlyPoll);
    }, 500);

    var lastUrl = location.href;
    setInterval(function() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(initAdRemover, 1500);
      }
    }, 1000);

  })();

  /* ================================
     End antiBannerUnified.js
     ================================ */

}
