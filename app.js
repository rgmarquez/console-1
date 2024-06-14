class App {
    constructor() {
        const columns = 40;
        const rows = 24;
        const scale = 3;
        const characterSize = 8 * scale;
    
        let canvasElementIds = ["layer1", "layer2", "layer3"];
        let canvasElements = getElementsById(canvasElementIds);

        let containingElement = document.activeElement; // HTMLBodyElement

        // layers
        this.canvas = new LayeredCanvas(canvasElements, columns * characterSize, rows * characterSize);

        // fonts
        this.font = buildFont(atari8bitFont, [114, 187, 244, 255], [19, 81, 160, 255]);
        this.cursorFont = buildFont(cursorsFont, [114, 187, 244, 255], [0, 0, 0, 0]);

        // sound playback
        this.playSound = function() {
            let sound = this.getSound(0);
            if (sound !== null) {
                sound.play();
            }
        }

        this.console = new Console(
            columns, rows, scale, this.font, this.cursorFont,
            [this.canvas.contexts2d[1], this.canvas.contexts2d[0]],
            containingElement, this.playSound.bind(this)
        );

        // audio
        let context = new (window.AudioContext || window.webkitAudioContext)();
        let buffer = new Buffer(context, sounds);
        buffer.loadAll();

        this.getSound = function(index) {
            let soundBuffer = buffer.getSoundByIndex(index);
            if (typeof soundBuffer === "undefined") {
                return null;
            }
            return new Sound(context, soundBuffer);
        }
    }
}

window.onload = function() {
    window.app = new App();
};
