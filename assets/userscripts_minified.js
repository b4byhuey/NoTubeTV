/* Start stayActiveTVsafe.js */
(function() {
  // Pasang spoof visibility, ulang tiap 10 detik agar tidak di-override
  function applyVisibilitySpoof() {
    try {
      Object.defineProperty(document, "hidden", { get: function() { return false; }, configurable: true });
      Object.defineProperty(document, "visibilityState", { get: function() { return "visible"; }, configurable: true });
    } catch(e) {}
  }
  applyVisibilitySpoof();
  setInterval(applyVisibilitySpoof, 10000);

  function simulateLightActivity() {
    try {
      var video = document.querySelector("video");
      if (video) {
        // Kirim event focus dan mousemove agar dianggap aktif
        video.dispatchEvent(new Event("focus", { bubbles: true }));
        video.dispatchEvent(new Event("mousemove", { bubbles: true }));
      } else {
        // fallback untuk halaman lain
        document.dispatchEvent(new Event("mousemove", { bubbles: true }));
      }
    } catch(e) {}
    // interval acak 60-90 detik
    var next = 60000 + Math.random() * 30000;
    setTimeout(simulateLightActivity, next);
  }

  simulateLightActivity();
})();
/* End stayActiveTVsafe.js */

/* Start spoofViewport.js */
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
/* End spoofViewport.js */

/* Start TizenTubeScripts.js */
(function () {
  "use strict";

  var CONFIG_KEY = "ytaf-configuration";
  var defaultConfig = {
    enableAdBlock: true,
    enableSponsorBlock: true,
    sponsorBlockManualSkips: [],
    enableSponsorBlockSponsor: true,
    enableSponsorBlockIntro: true,
    enableSponsorBlockOutro: true,
    enableSponsorBlockInteraction: true,
    enableSponsorBlockSelfPromo: true,
    enableSponsorBlockMusicOfftopic: true,
    enableSponsorBlockPreview: true,
    enableSponsorBlockFiller: true,
    enableShorts: true
  };
  var localConfig;
  try {
    localConfig = JSON.parse(window.localStorage[CONFIG_KEY]);
  } catch (err) {
    localConfig = defaultConfig;
  }

  window.localConfig = window.localStorage[CONFIG_KEY] ? JSON.parse(window.localStorage[CONFIG_KEY]) : defaultConfig;

  window.configRead = function (key) {
    if (window.localConfig[key] === undefined) {
      window.localConfig[key] = defaultConfig[key];
    }
    return window.localConfig[key];
  };

  window.configWrite = function (key, value) {
    window.localConfig[key] = value;
    window.localStorage[CONFIG_KEY] = JSON.stringify(window.localConfig);
  };

  function showToast(title, subtitle, thumbnails) {
    var toastCmd = {
      openPopupAction: {
        popupType: "TOAST",
        popup: {
          overlayToastRenderer: {
            title: {
              simpleText: title
            },
            subtitle: {
              simpleText: subtitle
            }
          }
        }
      }
    };
    resolveCommand(toastCmd);
  }

  function showModal(title, content, selectIndex, id, update) {
    if (!update) {
      var closeCmd = {
        signalAction: {
          signal: "POPUP_BACK"
        }
      };
      resolveCommand(closeCmd);
    }

    var modalCmd = {
      openPopupAction: {
        popupType: "MODAL",
        popup: {
          overlaySectionRenderer: {
            overlay: {
              overlayTwoPanelRenderer: {
                actionPanel: {
                  overlayPanelRenderer: {
                    header: {
                      overlayPanelHeaderRenderer: {
                        title: {
                          simpleText: title
                        }
                      }
                    },
                    content: {
                      overlayPanelItemListRenderer: {
                        items: content,
                        selectedIndex: selectIndex
                      }
                    }
                  }
                },
                backButton: {
                  buttonRenderer: {
                    accessibilityData: {
                      accessibilityData: {
                        label: "Back"
                      }
                    },
                    command: {
                      signalAction: {
                        signal: "POPUP_BACK"
                      }
                    }
                  }
                }
              }
            },
            dismissalCommand: {
              signalAction: {
                signal: "POPUP_BACK"
              }
            }
          }
        },
        uniqueId: id
      }
    };

    if (update) {
      modalCmd.openPopupAction.shouldMatchUniqueId = true;
      modalCmd.openPopupAction.updateAction = true;
    }

    resolveCommand(modalCmd);
  }

  function buttonItem(title, icon, commands) {
    var button = {
      compactLinkRenderer: {
        serviceEndpoint: {
          commandExecutorCommand: {
            commands: commands
          }
        }
      }
    };

    if (title) {
      button.compactLinkRenderer.title = {
        simpleText: title.title
      };
    }

    if (title.subtitle) {
      button.compactLinkRenderer.subtitle = {
        simpleText: title.subtitle
      };
    }

    if (icon) {
      button.compactLinkRenderer.icon = {
        iconType: icon.icon
      };
    }

    if (icon && icon.secondaryIcon) {
      button.compactLinkRenderer.secondaryIcon = {
        iconType: icon.secondaryIcon
      };
    }

    return button;
  }

  window.modernUI = function (update, parameters) {
    var settings = [
      { name: "Ad block", icon: "DOLLAR_SIGN", value: "enableAdBlock" },
      { name: "SponsorBlock", icon: "MONEY_HAND", value: "enableSponsorBlock" },
      { name: "Skip Sponsor Segments", icon: "MONEY_HEART", value: "enableSponsorBlockSponsor" },
      { name: "Skip Intro Segments", icon: "PLAY_CIRCLE", value: "enableSponsorBlockIntro" },
      { name: "Skip Outro Segments", value: "enableSponsorBlockOutro" },
      { name: "Skip Interaction Reminder Segments", value: "enableSponsorBlockInteraction" },
      { name: "Skip Self-Promotion Segments", value: "enableSponsorBlockSelfPromo" },
      { name: "Skip Preview Segments", value: "enableSponsorBlockPreview" },
      { name: "Skip Filler Segments", value: "enableSponsorBlockFiller" },
      { name: "Skip Off-Topic Music Segments", value: "enableSponsorBlockMusicOfftopic" },
      { name: "Shorts", icon: "YOUTUBE_SHORTS_FILL_24", value: "enableShorts" }
    ];

    var buttons = [];
    var index = 0;

    for (var i = 0; i < settings.length; i++) {
      var setting = settings[i];
      var currentVal = setting.value ? configRead(setting.value) : null;

      buttons.push(
        buttonItem(
          { title: setting.name, subtitle: setting.subtitle },
          {
            icon: setting.icon ? setting.icon : "CHEVRON_DOWN",
            secondaryIcon: currentVal === null
              ? "CHEVRON_RIGHT"
              : currentVal
              ? "CHECK_BOX"
              : "CHECK_BOX_OUTLINE_BLANK"
          },
          currentVal !== null
            ? [
                {
                  setClientSettingEndpoint: {
                    settingDatas: [
                      {
                        clientSettingEnum: {
                          item: setting.value
                        },
                        boolValue: !configRead(setting.value)
                      }
                    ]
                  }
                },
                {
                  customAction: {
                    action: "SETTINGS_UPDATE",
                    parameters: [index]
                  }
                }
              ]
            : [
                {
                  customAction: {
                    action: "OPTIONS_SHOW",
                    parameters: {
                      options: setting.options,
                      selectedIndex: 0,
                      update: false
                    }
                  }
                }
              ]
        )
      );
      index++;
    }

    showModal(
      "NotubeTv Settings",
      buttons,
      parameters && parameters.length > 0 ? parameters[0] : 0,
      "tt-settings",
      update
    );
  };

  function resolveCommand(cmd, _) {
    for (var key in window._yttv) {
      if (
        window._yttv[key] &&
        window._yttv[key].instance &&
        window._yttv[key].instance.resolveCommand
      ) {
        return window._yttv[key].instance.resolveCommand(cmd, _);
      }
    }
  }

  function patchResolveCommand() {
    for (var key in window._yttv) {
      if (
        window._yttv[key] &&
        window._yttv[key].instance &&
        window._yttv[key].instance.resolveCommand
      ) {
        var ogResolve = window._yttv[key].instance.resolveCommand;
        window._yttv[key].instance.resolveCommand = function (cmd, _) {
          if (cmd.setClientSettingEndpoint) {
            for (var j = 0; j < cmd.setClientSettingEndpoint.settingDatas.length; j++) {
              var setting = cmd.setClientSettingEndpoint.settingDatas[j];
              var valName = Object.keys(setting).filter(function (key) {
                return key.includes("Value");
              })[0];
              var value =
                valName === "intValue"
                  ? Number(setting[valName])
                  : setting[valName];
              if (valName === "arrayValue") {
                var arr = configRead(setting.clientSettingEnum.item);
                if (arr.indexOf(value) !== -1) {
                  arr.splice(arr.indexOf(value), 1);
                } else {
                  arr.push(value);
                }
                configWrite(setting.clientSettingEnum.item, arr);
              } else {
                configWrite(setting.clientSettingEnum.item, value);
              }
            }
          } else if (cmd.customAction) {
            customAction(cmd.customAction.action, cmd.customAction.parameters);
            return true;
          } else if (cmd.showEngagementPanelEndpoint && cmd.showEngagementPanelEndpoint.customAction) {
            customAction(
              cmd.showEngagementPanelEndpoint.customAction.action,
              cmd.showEngagementPanelEndpoint.customAction.parameters
            );
            return true;
          }
          return ogResolve.call(this, cmd, _);
        };
      }
    }
  }

  function customAction(action, parameters) {
    switch (action) {
      case "SETTINGS_UPDATE":
        modernUI(true, parameters);
        break;
      case "SKIP":
        var video = document.querySelector("video");
        if (video) {
          video.currentTime = parameters.time;
        }
        resolveCommand({
          signalAction: {
            signal: "POPUP_BACK"
          }
        });
        break;
    }
  }

  var origParse = JSON.parse;
  JSON.parse = function () {
    var r = origParse.apply(this, arguments);

    if (r.adPlacements && configRead("enableAdBlock")) {
      r.adPlacements = [];
    }

    if (r.playerAds && configRead("enableAdBlock")) {
      r.playerAds = false;
    }

    if (r.adSlots && configRead("enableAdBlock")) {
      r.adSlots = [];
    }

    if (
      r.contents &&
      r.contents.tvBrowseRenderer &&
      r.contents.tvBrowseRenderer.content &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents &&
      configRead("enableAdBlock")
    ) {
      var s =
        r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content
          .sectionListRenderer.contents[0];
      s.shelfRenderer.content.horizontalListRenderer.items =
        s.shelfRenderer.content.horizontalListRenderer.items.filter(function (
          i
        ) {
          return !i.adSlotRenderer;
        });
    }

    if (
      !configRead("enableShorts") &&
      r.contents &&
      r.contents.tvBrowseRenderer &&
      r.contents.tvBrowseRenderer.content &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer &&
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content
    ) {
      r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents =
        r.contents.tvBrowseRenderer.content.tvSurfaceContentRenderer.content.sectionListRenderer.contents.filter(
          function (shelve) {
            return (
              shelve.shelfRenderer.tvhtml5ShelfRendererType !==
              "TVHTML5_SHELF_RENDERER_TYPE_SHORTS"
            );
          }
        );
    }

    return r;
  };

  // SHA-256 implementation (compatible with ES5)
  var sha256 = function (ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var result = "";
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    var hash = (sha256.h = sha256.h || []);
    var k = (sha256.k = sha256.k || []);
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (var i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += "\x80";
    while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
      var j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (var j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (var i = 0; i < 64; i++) {
        var w15 = w[i - 15],
          w2 = w[i - 2];

        var a = hash[0],
          e = hash[4];

        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);

        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (var i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (var i = 0; i < 8; i++) {
      for (var j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? "0" : "") + b.toString(16);
      }
    }

    return result;
  };

  // SponsorBlockHandler emulation (updated)
  function SponsorBlockHandler(videoID) {
    this.videoID = videoID;
    this.segments = null;
    this.skippableCategories = [];
    this.manualSkippableCategories = [];
    this.active = true;
    this.nextSkipTimeout = null;
    this.sliderInterval = null;
    this.observer = null;
    this.segmentsoverlay = null;
    this.video = null;
    this.scheduleSkipHandler = null;
    this.durationChangeHandler = null;
    this.slider = null;
  }

  SponsorBlockHandler.prototype.init = function () {
    var self = this;
    if (!configRead("enableSponsorBlock")) return;

    var videoHash = sha256(this.videoID).substring(0, 4);
    var categories = ["sponsor", "intro", "outro", "interaction", "selfpromo", "preview", "filler", "music_offtopic"];
    var requestUrl = "https://sponsorblock.inf.re/api/skipSegments/" + videoHash + "?categories=" + encodeURIComponent(JSON.stringify(categories));

    fetchPolyfill(requestUrl, function (respText) {
      try {
        var results = JSON.parse(respText);
        var result = null;

        if (Object.prototype.toString.call(results) === "[object Array]") {
          for (var i = 0; i < results.length; i++) {
            if (results[i] && results[i].videoID === self.videoID) {
              result = results[i];
              break;
            }
          }
        } else if (results && results.segments) {
          result = results;
        }

        if (!result || !result.segments || !result.segments.length) {
          // no segments found
          return;
        }

        self.segments = result.segments;
        self.manualSkippableCategories = configRead("sponsorBlockManualSkips");
        self.skippableCategories = self.getSkippableCategories();

        self.scheduleSkipHandler = function () { self.scheduleSkip(); };
        self.durationChangeHandler = function () { self.buildOverlay(); };

        self.attachVideo();
        self.buildOverlay();
      } catch (e) {
        console.warn("SponsorBlock JSON parse error:", e);
      }
    });
  };

  SponsorBlockHandler.prototype.getSkippableCategories = function () {
    var skippable = [];
    if (configRead("enableSponsorBlockSponsor")) skippable.push("sponsor");
    if (configRead("enableSponsorBlockIntro")) skippable.push("intro");
    if (configRead("enableSponsorBlockOutro")) skippable.push("outro");
    if (configRead("enableSponsorBlockInteraction")) skippable.push("interaction");
    if (configRead("enableSponsorBlockSelfPromo")) skippable.push("selfpromo");
    if (configRead("enableSponsorBlockPreview")) skippable.push("preview");
    if (configRead("enableSponsorBlockFiller")) skippable.push("filler");
    if (configRead("enableSponsorBlockMusicOfftopic")) skippable.push("music_offtopic");
    return skippable;
  };

  SponsorBlockHandler.prototype.attachVideo = function () {
    var self = this;
    this.video = document.querySelector("video");
    if (!this.video) {
      this.attachVideoTimeout = setTimeout(function () { self.attachVideo(); }, 100);
      return;
    }

    // Ensure handlers exist
    if (!this.scheduleSkipHandler) {
      var that = this;
      this.scheduleSkipHandler = function () { that.scheduleSkip(); };
    }
    if (!this.durationChangeHandler) {
      var that2 = this;
      this.durationChangeHandler = function () { that2.buildOverlay(); };
    }

    this.video.addEventListener("play", this.scheduleSkipHandler);
    this.video.addEventListener("pause", this.scheduleSkipHandler);
    this.video.addEventListener("timeupdate", this.scheduleSkipHandler);
    this.video.addEventListener("durationchange", this.durationChangeHandler);
  };

  SponsorBlockHandler.prototype.buildOverlay = function () {
    if (this.segmentsoverlay) return;
    if (!this.video || !this.video.duration) return;

    var videoDuration = this.video.duration;
    this.segmentsoverlay = document.createElement("div");
    this.segmentsoverlay.className = "ytLrProgressBarHost ytLrProgressBarFocused ytLrWatchDefaultProgressBar";

    var sliderElement = document.createElement("div");
    sliderElement.style.backgroundColor = "rgba(0,0,0,0)";
    sliderElement.style.bottom = "auto";
    sliderElement.style.height = "4px";
    sliderElement.style.overflow = "hidden";
    sliderElement.style.position = "absolute";
    sliderElement.style.top = "26px";
    sliderElement.style.width = "100%";
    this.segmentsoverlay.appendChild(sliderElement);

    var self = this;
    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var start = segment.segment[0];
      var end = segment.segment[1];
      var barType = (barTypes[segment.category] && barTypes[segment.category]) || { color: "blue", opacity: 0.7 };
      var transform = "translateX(" + ((start / videoDuration) * 100.0) + "%) scaleX(" + ((end - start) / videoDuration) + ")";
      var elm = document.createElement("div");
      elm.className = "ytLrProgressBarPlayed";
      elm.style.background = barType.color;
      elm.style.opacity = barType.opacity;
      elm.style.transform = transform;
      elm.style.webkitTransform = transform;
      elm.style.height = "100%";
      elm.style.pointerEvents = "none";
      elm.style.position = "absolute";
      elm.style.transformOrigin = "left";
      elm.style.width = "100%";
      sliderElement.appendChild(elm);
    }

    var self2 = this;
    this.sliderInterval = setInterval(function () {
      self2.slider = document.querySelector('[idomkey="slider"]') || document.querySelector("ytlr-redux-connect-ytlr-progress-bar") || document.querySelector("ytlr-progress-bar");
      if (self2.slider) {
        clearInterval(self2.sliderInterval);
        self2.sliderInterval = null;
        try {
          self2.slider.appendChild(self2.segmentsoverlay);
        } catch (e) {
          console.warn("Failed to append sponsor overlay:", e);
        }
      }
    }, 500);
  };

  SponsorBlockHandler.prototype.scheduleSkip = function () {
    var self = this;
    if (this.nextSkipTimeout) {
      clearTimeout(this.nextSkipTimeout);
      this.nextSkipTimeout = null;
    }

    if (!this.active) return;
    if (!this.video || this.video.paused) return;
    if (!this.segments || !this.segments.length) return;

    var current = this.video.currentTime;
    var nextSegments = this.segments.filter(function (seg) {
      return seg.segment[0] >= current - 0.3 && seg.segment[1] > current - 0.3;
    }).sort(function (a, b) { return a.segment[0] - b.segment[0]; });

    if (!nextSegments || !nextSegments.length) return;

    var segment = nextSegments[0];
    var start = segment.segment[0];
    var end = segment.segment[1];

    var delay = (start - this.video.currentTime) * 1000;
    if (delay < 0) delay = 0;

    this.nextSkipTimeout = setTimeout(function () {
      if (self.video.paused) return;
      if (self.skippableCategories.indexOf(segment.category) === -1) return;

      var skipName = (barTypes[segment.category] && barTypes[segment.category].name) || segment.category;
      if (self.manualSkippableCategories.indexOf(segment.category) === -1) {
        showToast("SponsorBlock", "Skipping " + skipName);
        try {
          self.video.currentTime = end + 0.1;
        } catch (e) {
          console.warn("Failed to set currentTime:", e);
        }
        self.scheduleSkip();
      }
    }, delay);
  };

  SponsorBlockHandler.prototype.destroy = function () {
    this.active = false;
    if (this.nextSkipTimeout) {
      clearTimeout(this.nextSkipTimeout);
      this.nextSkipTimeout = null;
    }
    if (this.attachVideoTimeout) {
      clearTimeout(this.attachVideoTimeout);
      this.attachVideoTimeout = null;
    }
    if (this.sliderInterval) {
      clearInterval(this.sliderInterval);
      this.sliderInterval = null;
    }
    if (this.observer) {
      try { this.observer.disconnect(); } catch (e) {}
      this.observer = null;
    }
    if (this.segmentsoverlay) {
      try { this.segmentsoverlay.remove(); } catch (e) {}
      this.segmentsoverlay = null;
    }
    if (this.video) {
      try {
        if (this.scheduleSkipHandler) this.video.removeEventListener("play", this.scheduleSkipHandler);
        if (this.scheduleSkipHandler) this.video.removeEventListener("pause", this.scheduleSkipHandler);
        if (this.scheduleSkipHandler) this.video.removeEventListener("timeupdate", this.scheduleSkipHandler);
        if (this.durationChangeHandler) this.video.removeEventListener("durationchange", this.durationChangeHandler);
      } catch (e) {}
    }
  };

  // Polyfill fetch()
  function fetchPolyfill(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(xhr.responseText);
      }
    };
    xhr.send();
  }

  // Handle hash change
  window.sponsorblock = null;
  window.addEventListener("hashchange", function () {
    if (!configRead("enableSponsorBlock")) {
      if (window.sponsorblock) window.sponsorblock.destroy();
      return;
    }
    var match = location.hash.match(/[?&]v=([^&]+)/);
    var videoID = match ? match[1] : null;
    if (!videoID) return;
    if (!window.sponsorblock || window.sponsorblock.videoID != videoID) {
      if (window.sponsorblock) window.sponsorblock.destroy();
      window.sponsorblock = new SponsorBlockHandler(videoID);
      window.sponsorblock.init();
    }
  });

  // DOM Loaded handler
  var interval = setInterval(function () {
    var videoElement = document.querySelector("video");
    if (videoElement) {
      executeOnceDomLoaded();
      patchResolveCommand();
      clearInterval(interval);
    }
  }, 250);

  function executeOnceDomLoaded() {
    // Inject CSS
    var css = ".ytaf-ui-container{position:absolute;top:10%;left:10%;right:10%;bottom:10%;background:rgba(0,0,0,0.8);color:white;border-radius:20px;padding:20px;font-size:1.5rem;z-index:1000}.ytaf-notification-container{position:absolute;right:10px;bottom:10px;font-size:16pt;z-index:1200}.ytaf-notification-container .message{background:rgba(0,0,0,0.7);color:white;padding:1em;margin:0.5em;transition:all .3s ease-in-out;opacity:1;line-height:1;border-right:10px solid rgba(50,255,50,0.3);display:inline-block;float:right}.ytaf-notification-container .message-hidden{opacity:0;margin:0;padding:0;line-height:0}";
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* Exit Bridge */
  (function () {
    var observer = new MutationObserver(function () {
      var exitButton = document.querySelector(".ytVirtualListItemLast ytlr-button.ytLrButtonLargeShape");
      if (exitButton) {
        exitButton.addEventListener("keydown", function (e) {
          if ((e.key === "Enter" || e.keyCode === 13) && typeof ExitBridge !== "undefined" && typeof ExitBridge.onExitCalled === "function") {
            e.preventDefault();
            e.stopPropagation();
            ExitBridge.onExitCalled();
          }
        }, true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();

  /* Menu Trigger */
  (function () {
    function getSearchBar() {
      return document.querySelectorAll('[idomkey="ytLrSearchBarSearchTextBox"]')[0] || null;
    }

    function addMenuButton() {
      var searchBar = getSearchBar();
      if (!searchBar) return;
      var parent = searchBar.parentNode;
      if (parent.querySelector('button[data-notubetv="menu"]')) return;
      parent.style.display = "flex";
      parent.style.flexDirection = "row";
      parent.style.alignItems = "center";
      var menuButton = document.createElement("button");
      menuButton.setAttribute("data-notubetv", "menu");
      menuButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="58px" viewBox="0 -960 960 960" width="58px" fill="#F3F3F3"><path d="M480-480q0-91 64.5-155.5T700-700q91 0 155.5 64.5T920-480H480ZM260-260q-91 0-155.5-64.5T40-480h440q0 91-64.5 155.5T260-260Zm220-220q-91 0-155.5-64.5T260-700q0-91 64.5-155.5T480-920v440Zm0 440v-440q91 0 155.5 64.5T700-260q0 91-64.5 155.5T480-40Z"/></svg>';
      menuButton.style.marginLeft = "54px";
      menuButton.style.padding = "35px";
      menuButton.style.background = "rgba(255,255,255,0.1)";
      menuButton.style.border = "none";
      menuButton.style.borderRadius = "88px";
      parent.insertBefore(menuButton, searchBar.nextSibling);
    }

    addMenuButton();

    document.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        var searchBar = getSearchBar();
        var isFocused = searchBar && searchBar.classList.contains("ytLrSearchTextBoxFocused");
        if (isFocused && typeof modernUI === "function") {
          modernUI();
        }
      }
    });

    var observer = new MutationObserver(function () {
      var searchBar = getSearchBar();
      if (searchBar && !searchBar.parentNode.querySelector('[data-notubetv="menu"]')) {
        addMenuButton();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
/* End TizenTubeScripts.js */

/* Start antiBannerUnified.js */
(function() {
  // Daftar selector iklan yang ingin dihapus
  var SELECTORS = [
    "ytd-ad-slot-renderer",
    "ytd-display-ad-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-rich-section-renderer",
    "ytd-banner-promo-renderer",
    "#masthead-ad"
  ];

  // Fungsi hapus iklan
  function removeAds() {
    for (var i = 0; i < SELECTORS.length; i++) {
      var els = document.querySelectorAll(SELECTORS[i]);
      for (var j = 0; j < els.length; j++) {
        try {
          els[j].parentNode.removeChild(els[j]);
        } catch(e) {}
      }
    }
  }

  // Observer untuk DOM dinamis (navigasi, scroll, rekomendasi baru)
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

  // Jalankan observer dan clean-up awal
  function initAdRemover() {
    removeAds();
    startObserver();
  }

  // Eksekusi awal langsung
  initAdRemover();

  // Polling 5 detik pertama — tangkap iklan awal (termasuk “Selamat Datang Kembali”)
  var initTries = 0;
  var earlyPoll = setInterval(function() {
    removeAds();
    initTries++;
    if (initTries > 10) clearInterval(earlyPoll);
  }, 500);

  // Re-run tiap kali URL berubah (SPA navigation)
  var lastUrl = location.href;
  setInterval(function() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(initAdRemover, 1500);
    }
  }, 1000);
})();
/* End antiBannerUnified.js */
