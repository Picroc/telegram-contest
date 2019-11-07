var RLottie = (function () {
  var rlottie = {}, apiInitStarted = false, apiInited = false, initCallbacks = [];
  var deviceRatio = window.devicePixelRatio || 1;
  var rlottieWorkers = [], curWorkerNum = 0;

  rlottie.Api = {};
  rlottie.players = {};
  rlottie.WORKERS_LIMIT = 4;

  var reqId = 0;

  var webpNativeSupport = null, webpImage = null, webpCallbacks = [];
  function doesSupportWebp(callback) {
    if (webpNativeSupport !== null) {
      callback(webpNativeSupport);
    } else {
      callback && webpCallbacks.push(callback);
      if (!webpImage) {
        webpImage = new Image();
        webpImage.onerror = webpImage.onload = function () {
          if (this.width === 2 && this.height === 1) {
            webpNativeSupport = true;
          } else {
            webpNativeSupport = false;
          }
          for (var i = 0; i < webpCallbacks.length; i++) {
            webpCallbacks[i](webpNativeSupport);
          }
          webpCallbacks = [];
        };
        webpImage.src = 'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
      }
    }
  }

  function loadScript(script_src, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = script_src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function loadScripts(callback) {
    var remain = 0, callback_all = function () {
      if (!--remain) callback();
    };
    ++remain; loadScript('rlottie-wasm.js', function () {
      Module.onRuntimeInitialized = callback_all;
    });
    ++remain; loadScript('jszip-utils.min.js', callback_all);
    ++remain; loadScript('pako_inflate.min.js', callback_all);
    ++remain; loadScript('gunzip.min.js', callback_all);
  }

  function initApi(callback) {
    if (apiInited) {
      callback && callback();
    } else {
      callback && initCallbacks.push(callback);
      if (!apiInitStarted) {
        apiInitStarted = true;
        var workersRemain = rlottie.WORKERS_LIMIT;
        for (var workerNum = 0; workerNum < rlottie.WORKERS_LIMIT; workerNum++) {
          (function (workerNum) {
            var rlottieWorker = rlottieWorkers[workerNum] = new QueryableWorker('tgsticker-worker.js?7');
            rlottieWorker.addListener('ready', function () {
              console.log('worker #' + workerNum + ' ready');
              rlottieWorker.addListener('frame', onFrame);
              rlottieWorker.addListener('result', onResult);
              --workersRemain;
              if (!workersRemain) {
                console.log('workers ready');
                apiInited = true;
                for (var i = 0; i < initCallbacks.length; i++) {
                  initCallbacks[i]();
                }
                initCallbacks = [];
              }
            });
          })(workerNum);
        }
      }
    }
  }

  function destroyWorkers() {
    for (var workerNum = 0; workerNum < rlottie.WORKERS_LIMIT; workerNum++) {
      if (rlottieWorkers[workerNum]) {
        rlottieWorkers[workerNum].terminate();
        console.log('worker #' + workerNum + ' terminated');
      }
    }
    console.log('workers destroyed');
    apiInitStarted = apiInited = false;
    rlottieWorkers = [];
  }

  function initPlayer(el, options) {
    if (el.rlPlayer) return;
    if (el.tagName.toLowerCase() != 'picture') {
      console.warn('only picture tag allowed');
      return;
    }
    var webp_source = el.querySelector('source[type="image/webp"]');
    webp_source && doesSupportWebp(function (webp_supported) {
      if (webp_supported) {
        var thumb_src = tgs_source && tgs_source.getAttribute('srcset') || '';
        if (thumb_src) {
          rlPlayer.thumb = document.createElement('img');
          rlPlayer.thumb.src = thumb_src;
          el.appendChild(rlPlayer.thumb);
        }
      }
    });
    var tgs_source = el.querySelector('source[type="application/x-tgsticker"]');
    var url = tgs_source && tgs_source.getAttribute('srcset') || '';
    if (!url) {
      console.warn('picture source application/x-tgsticker not found');
      return;
    }
    var rlPlayer = el.rlPlayer = {};
    rlPlayer.reqId = ++reqId;
    rlottie.players[reqId] = rlPlayer;
    rlPlayer.el = el;
    rlPlayer.curFrame = 0;
    rlPlayer.frames = [];
    rlPlayer.width = el.clientWidth * deviceRatio;
    rlPlayer.height = el.clientHeight * deviceRatio;
    rlPlayer.rWorker = rlottieWorkers[curWorkerNum++];
    if (curWorkerNum >= rlottieWorkers.length) {
      curWorkerNum = 0;
    }
    rlPlayer.rWorker.sendQuery('loadSticker', rlPlayer.reqId, url, rlPlayer.width, rlPlayer.height);
    rlPlayer.options = options || {};
  }

  function destroyPlayer(el) {
    if (!el.rlPlayer) return;
    var rlPlayer = el.rlPlayer;
    window.cancelAnimationFrame(rlPlayer.rafId);
    delete rlottie.players[rlPlayer.reqId];
    delete rlPlayer;
  }

  function render(rlPlayer) {
    if (!rlPlayer.canvas ||
      rlPlayer.canvas.width == 0 ||
      rlPlayer.canvas.height == 0) {
      return;
    }
    if (!rlPlayer.forceRender) {
      if (!rlPlayer.options.playWithoutFocus && !document.hasFocus() ||
        rlPlayer.paused ||
        !rlPlayer.framesReady) {
        return;
      }
      var rect = rlPlayer.el.getBoundingClientRect();
      if (rect.bottom < 0 ||
        rect.right < 0 ||
        rect.top > (window.innerHeight || document.documentElement.clientHeight) ||
        rect.left > (window.innerWidth || document.documentElement.clientWidth)) {
        return;
      }
    }
    rlPlayer.forceRender = false;
    var frame = rlPlayer.frames[rlPlayer.curFrame++];
    rlPlayer.context.putImageData(frame, 0, 0);
    if (rlPlayer.thumb) {
      rlPlayer.el.removeChild(rlPlayer.thumb);
      delete rlPlayer.thumb;
    }
    if (rlPlayer.curFrame >= rlPlayer.frames.length) {
      rlPlayer.curFrame = 0;
    }
  }

  function onFrame(reqId, frameNo, frame, width, height) {
    var rlPlayer = rlottie.players[reqId];
    // var data = new Uint8ClampedArray(frame);
    rlPlayer.frames[frameNo] = new ImageData(frame, width, height);
  }

  function onResult(reqId, width, height, fps) {
    var rlPlayer = rlottie.players[reqId];
    rlPlayer.canvas = document.createElement('canvas');
    rlPlayer.canvas.width = rlPlayer.width;
    rlPlayer.canvas.height = rlPlayer.height;
    rlPlayer.el.appendChild(rlPlayer.canvas);
    rlPlayer.context = rlPlayer.canvas.getContext('2d');
    rlPlayer.fps = Math.max(1, Math.min(60, fps || 60));
    rlPlayer.frInterval = 1000 / rlPlayer.fps;
    rlPlayer.frThen = Date.now();
    rlPlayer.framesReady = true;
    rlPlayer.forceRender = true;
    rlPlayer.mainLoop = function () {
      rlPlayer.rafId = window.requestAnimationFrame(rlPlayer.mainLoop);

      var now = Date.now(), delta = now - rlPlayer.frThen;
      if (delta > rlPlayer.frInterval) {
        rlPlayer.frThen = now - (delta % rlPlayer.frInterval);

        render(rlPlayer);
      }
    };
    rlPlayer.rafId = window.requestAnimationFrame(rlPlayer.mainLoop);
  }

  rlottie.init = function (el, options) {
    initApi(function () {
      initPlayer(el, options);
    });
  }

  rlottie.destroy = function (el) {
    destroyPlayer(el);
  }

  rlottie.destroyWorkers = function () {
    destroyWorkers();
  }

  return rlottie;
}());



function QueryableWorker(url, defaultListener, onError) {
  var instance = this,
    worker = new Worker(url),
    listeners = {};

  this.defaultListener = defaultListener || function () { };

  if (onError) { worker.onerror = onError; }

  this.postMessage = function (message) {
    worker.postMessage(message);
  }

  this.terminate = function () {
    worker.terminate();
  }

  this.addListener = function (name, listener) {
    listeners[name] = listener;
  }

  this.removeListener = function (name) {
    delete listeners[name];
  }

  /*
    This functions takes at least one argument, the method name we want to query.
    Then we can pass in the arguments that the method needs.
  */
  this.sendQuery = function () {
    if (arguments.length < 1) {
      throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
      return;
    }
    worker.postMessage({
      'queryMethod': arguments[0],
      'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
    });
  }

  worker.onmessage = function (event) {
    if (event.data instanceof Object &&
      event.data.hasOwnProperty('queryMethodListener') &&
      event.data.hasOwnProperty('queryMethodArguments')) {
      listeners[event.data.queryMethodListener].apply(instance, event.data.queryMethodArguments);
    } else {
      this.defaultListener.call(instance, event.data);
    }
  }
}
