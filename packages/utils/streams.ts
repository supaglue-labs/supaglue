import type { Readable } from 'stream';
import { Transform } from 'stream';

class PeekStream extends Transform {
  #peekState: {
    peeked: boolean;
    object?: unknown | null;
  };
  constructor() {
    super({ objectMode: true });
    this.#peekState = {
      peeked: false,
    };
  }

  _transform(data: unknown, encoding: string, callback: () => void) {
    const state = this.#peekState;

    state.object = data;
    callback();
  }

  _flush(callback: () => void) {
    if (this.#peekState.peeked) {
      return callback();
    }

    this.#peek(callback);
  }

  #peek(callback: () => void) {
    const state = this.#peekState;

    this.emit('peek', state.object);
    this.push(state.object);
    this.#stopPeeking();

    callback();
  }

  #stopPeeking() {
    const state = this.#peekState;
    state.object = null;
    state.peeked = true;

    this._transform = function (data, encoding, callback) {
      this.push(data);
      callback();
    };
  }
}

export function peekObjectStream<T = unknown>(stream: Readable): Promise<[T, Readable]> {
  function _peek(callback: (err: unknown, record?: T, dest?: Readable) => void) {
    const dest = new PeekStream();

    dest.once('peek', function (data) {
      callback(null, data, dest);
    });
    dest.once('error', function (err) {
      callback(err);
    });

    return stream.pipe(dest);
  }
  return new Promise((resolve, reject) => {
    _peek(function (err, record, dest) {
      if (err) {
        return reject(err);
      }
      resolve([record, dest] as [T, Readable]);
    });
  });
}
