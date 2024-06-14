class LayeredCanvas {
    constructor(canvasElements, width, height) {
        // create an array of canvases
        this.canvases = canvasElements;
        this.contexts2d = [];

        // set the z sort order and other attributes
        let length = canvasElements.length;
        for (var i = 0; i < length; ++i) {
            let canvas = this.canvases[i];

            this.contexts2d[i] = canvas.getContext('2d');

            canvas.width = width;
            canvas.height = height;

            let z = -(i + 1);
            canvas.style.zIndex = z.toString();
            canvas.style.position = 'absolute';
            canvas.style.left = 0 +'px';
            canvas.style.top = 0 +'px';
        }
        this.contexts2d[1].imageSmoothingEnabled = false;
        this.contexts2d[1].globalCompositeOperation = "source-over";

        this.contexts2d[0].imageSmoothingEnabled = false;
        this.contexts2d[0].globalCompositeOperation = "copy";

    }
}
