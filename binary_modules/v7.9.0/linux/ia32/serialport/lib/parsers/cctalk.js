'use strict';
const Transform = require('stream').Transform;
const Buffer = require('safe-buffer').Buffer;

module.exports = class CCTalkParser extends Transform {
  constructor() {
    super();
    this.array = [];
    this.cursor = 0;
  }
  _transform(buffer, _, cb) {
    this.cursor += buffer.length;
    // TODO: Better Faster es7 no supported by node 4
    // ES7 allows directly push [...buffer]
    // this.array = this.array.concat(Array.from(buffer)); //Slower ?!?
    Array.from(buffer)
      .map((byte) => this.array.push(byte));
    while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
      // full frame accumulated
      // copy command from the array
      const FullMsgLength = this.array[1] + 5;

      const frame = Buffer.from(this.array.slice(0, FullMsgLength));
      // Preserve Extra Data
      this.array = this.array.slice(frame.length, this.array.length);
      this.cursor -= FullMsgLength;
      this.push(frame);
    }
    cb();
  }
};
