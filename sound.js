// Based on https://css-tricks.com/introduction-web-audio-api/

class Sound {
    constructor(context, buffer) {
        this.context = context;
        this.buffer = buffer;
        this.init();
    }
  
    init() {
      this.gainNode = this.context.createGain();
      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.context.destination);
    }
  
    play() {
      this.source.start(this.context.currentTime);
    }  
  
    stop() {
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
      this.source.stop(this.context.currentTime + 0.5);
    }
}
