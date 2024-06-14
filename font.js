class FontBuilder {
    constructor(characterBitmapMapping, foreground, background) {
        this.font = this.getCharacterImages(characterBitmapMapping, foreground, background);
    }

    getCharacterImages(characterBitmapMapping, foreground, background) {
        let font = {}; // key : letter, value : image
    
        let numberOfCharacters = characterBitmapMapping.length;
        for (let i = 0; i < numberOfCharacters; ++i) {
            let item = characterBitmapMapping[i];
    
            let ch = item[0];
    
            let bitmapArray = item.slice(1);
    
            font[ch] = this.createLetterCanvas(bitmapArray, foreground, background);
        }
    
        return font;
    }

    createLetterCanvas(bitmapArray, foreground, background) {
        const width = 8;
        const height = 8;
    
        let offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        let offscreenContext = offscreenCanvas.getContext('2d');
    
        let image = offscreenContext.createImageData(width, height);
        let lines = height;
        let pixelindex = 0;
        for (var i = 0; i < lines; ++i) {
            let lineBits = bitmapArray[i];
            let bitMask = 128; // binary 10000000
            for (var bit = 7; bit >= 0; --bit) {
                if (bitMask & lineBits) {
                    image.data[pixelindex++] = foreground[0];
                    image.data[pixelindex++] = foreground[1];
                    image.data[pixelindex++] = foreground[2] ;
                    image.data[pixelindex++] = foreground[3];
                } else {
                    image.data[pixelindex++] = background[0];
                    image.data[pixelindex++] = background[1];
                    image.data[pixelindex++] = background[2];
                    image.data[pixelindex++] = background[3];
                }
                bitMask = bitMask >> 1;
            }
        }
        offscreenContext.putImageData(image, 0, 0);
        return offscreenCanvas;
    }    
}

function buildFont(characterBitmapMapping, foreground, background) {
    let font = new FontBuilder(characterBitmapMapping, foreground, background);
    return font.font;
}
