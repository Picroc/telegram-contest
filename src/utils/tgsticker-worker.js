importScripts('rlottie-wasm.js');
importScripts('pako-inflate.min.js');

var RLottieWorker = (function () {
  var worker = {};
  worker.Api = {};
  worker.lottieHandle = 0;

  function initApi() {
    worker.Api = {
      init: Module.cwrap('lottie_init', '', []),
      destroy: Module.cwrap('lottie_destroy', '', ['number']),
      resize: Module.cwrap('lottie_resize', '', ['number', 'number', 'number']),
      buffer: Module.cwrap('lottie_buffer', 'number', ['number']),
      frameCount: Module.cwrap('lottie_frame_count', 'number', ['number']),
      render: Module.cwrap('lottie_render', '', ['number', 'number']),
      loadFromData: Module.cwrap('lottie_load_from_data', 'number', ['number', 'number']),
    };
  }
  worker.init = function () {
    initApi();
    reply('ready');
  }
  worker.renderFrames = function (reqId, jsString, width, height, fps) {
    try {
      var handle = worker.Api.init();
      var lengthBytes = lengthBytesUTF8(jsString) + 1;
      var stringOnWasmHeap = Module._malloc(lengthBytes);
      stringToUTF8(jsString, stringOnWasmHeap, lengthBytes);
      worker.Api.loadFromData(handle, stringOnWasmHeap);
      var frameCount = worker.Api.frameCount(handle);
      worker.Api.resize(handle, width, height);
      var frames = [];
      for (var frameNo = 0; frameNo < frameCount; frameNo++) {
        worker.Api.render(handle, frameNo);
        var bufferPointer = worker.Api.buffer(handle);
        var data = new Uint8ClampedArray(Module.HEAP8.buffer, bufferPointer, width * height * 4);
        data = new Uint8ClampedArray(data);
        reply('frame', reqId, frameNo, data, width, height);
      }
      try {
        Module._free(stringOnWasmHeap);
      } catch (e) { }
      reply('result', reqId, width, height, fps);
      return frames;
    } catch (e) { }
  }
  worker.loadSticker = function (url, callback) {
    getUrlContent(url, function (err, data) {
      if (err) {
        return console.warn('Can\'t fetch file ' + url, err);
      }
      try {
        var json = pako.inflate(data, { to: 'string' });
        var json_parsed = JSON.parse(json);
        if (!json_parsed.tgs) {
          throw new Error('Invalid file');
        }
      } catch (e) {
        return console.warn('Invalid file ' + url);
      }
      callback(json, json_parsed.fr);
    });
  }
  return worker;
}());

Module.onRuntimeInitialized = _ => {
  RLottieWorker.init();
};

var queryableFunctions = {
  loadSticker: function (reqId, url, width, height) {
    RLottieWorker.loadSticker(url, function (json, fr) {
      var frames = RLottieWorker.renderFrames(reqId, json, width, height, fr);
    });
  },
  renderFrames: function (reqId, jsString, width, height) {
    try {
      var json_parsed = JSON.parse(jsString);
      if (!json_parsed.tgs) {
        throw new Error('Invalid file');
      }
      var frames = RLottieWorker.renderFrames(reqId, jsString, width, height, json_parsed.fr);
      // reply('result', reqId, width, height, frames);
    } catch (e) { }
  }
};

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply() {
  if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
  var transfer = [], args = Array.prototype.slice.call(arguments, 1);
  for (var i = 0, targ; i < args.length; i++) {
    if (args[i] instanceof ArrayBuffer) {
      transfer.push(args[i]);
    }
    if (args[i].buffer && args[i].buffer instanceof ArrayBuffer) {
      transfer.push(args[i].buffer);
    }
  }
  postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': args }, transfer);
}

onmessage = function (oEvent) {
  if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
    queryableFunctions[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
  } else {
    defaultReply(oEvent.data);
  }
};

function getUrlContent(path, callback) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    if ('responseType' in xhr) {
      xhr.responseType = 'arraybuffer';
    }
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
    xhr.onreadystatechange = function (event) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          callback(null, xhr.response || xhr.responseText);
        } else {
          callback(new Error('Ajax error: ' + this.status + ' ' + this.statusText));
        }
      }
    };
    xhr.send();
  } catch (e) {
    callback(new Error(e));
  }
};