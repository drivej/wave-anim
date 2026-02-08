let audioContext;

function fixIOS() {
    if (this.audioContext.sampleRate !== 44100) {
      this.audioContext.close();
      this.initNodes();
    }
  }

export function loadFile(src, options) {
  if (debug) console.log('loadAudioBuffer()', options);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.responseType = 'arraybuffer';

    request.onloadend = () => {
      options.onProgress(1);
    };

    request.onload = (e) => {
      resolve(e.currentTarget.response);
    };

    request.onprogress = (e) => {
      options.onProgress(e.loaded / e.total);
    };

    request.onerror = (e) => {
      reject(e);
    };

    request.send();
  });
}

export function decodeAudioData(arrayBuffer, audioContext) {
  return new Promise((resolve, reject) => {
    this.audioContext.decodeAudioData(
      arrayBuffer,
      (buffer) => {
        this.fixIOS();
        resolve(buffer);
      },
      (e) => {
        reject(e);
      }
    );
  });
}

export default AudioLoader = {
    load: (src, onProgress) => {
        return load(src, { onProgress }).then(decodeAudioData.bind(this));
    }
};
