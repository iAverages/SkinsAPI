const canvas = require('canvas');
const Image = canvas.Image;

const TYPE_OLD = 1;
const TYPE_NEW = 2;

class MinecraftSkin {

    static side = 60;
    static defaultWidth = 140;

    baseBuffer = null;
    imageWidth = null;
    baseImage = null;
    img = null;
    isAlex = false;
    type = TYPE_OLD;
    blockSize = null;
    _canvas = null;
    _ctx = null;

    constructor(imageBufferFile, isAlex = false, imageWidth = MinecraftSkin.side) {
        this.baseBuffer = imageBufferFile;

        const imageFile = new Image();
        imageFile.src = imageBufferFile;
        this.baseImage = imageFile;

        this.side = MinecraftSkin.side;
        this.isAlex = isAlex;
        this.imageWidth = imageWidth;

        if (!imageFile.width || typeof imageFile.width !== 'number') throw Error(`Invalid skin file dimensions! Width was ${imageFile.width}.`);
        if (imageFile.width % 64 !== 0) throw Error(`Invalid skin file dimensions! Expected width number divisable by 64, got ${imageFile.width}`);
        if (imageFile.height % 32 !== 0) throw Error(`Invalid skin file dimensions! Expected height number divisable by 32, got ${imageFile.height}`);

        // determine type?
        this.type = (imageFile.height !== imageFile.width) ? TYPE_OLD : TYPE_NEW;

        this._canvas = canvas.createCanvas(imageWidth, imageWidth);
        this._ctx = this._canvas.getContext('2d');

        this._ctx.mozImageSmoothingEnabled = true;
        this._ctx.webkitImageSmoothingEnabled = true;
        this._ctx.msImageSmoothingEnabled = true;
        this._ctx.imageSmoothingEnabled = true;
    }

    getRender = () => {
        // use multiples of 60 for "base" height, then scale down...
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = MinecraftSkin.getSideForHead(this.imageWidth);
        let drawSide = MinecraftSkin.side;
        // get next multiple of 60 that is >= outSide...

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        // get render in multiples of 60 (most accturate/good looking math)
        const upscaleImage = this._internalGetRender();

        // render at specified width and determine height now
        const [finalWidth, finalHeight] = [this.imageWidth, this.imageWidth * 2.05];
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    }

    getHead = () => {
        // use multiples of 60 for "base" height, then scale down...
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = MinecraftSkin.getSideForHead(this.imageWidth);
        let drawSide = MinecraftSkin.side;
        // get next multiple of 60 that is >= outSide...

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        // get render in multiples of 60 (most accturate/good looking math)
        const upscaleImage = this._internalGetHead();


        const [finalWidth, finalHeight] = [this.imageWidth, this.imageWidth];

        // render at specified width and determine height now
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    }

    _makeScaledImage = () => {
        try {
            this.img = MinecraftSkin.generateToScaleImage(this.side, this.baseImage);
            this.blockSize = this.img.width / 8;
        } catch (e) {
            throw Error("Could not generate upscaled image");
        }
    };

    _internalGetRender = () => {
        if (this.img === null) this._makeScaledImage();

        const { side, blockSize, img } = this;
        const [rectWidth, rectHeight] = [side * 2.5, side * 5.1];

        let tmpCanvas = canvas.createCanvas(rectWidth, rectHeight);
        let ctx = tmpCanvas.getContext("2d");

        // make upscaled image

        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;

        const hB = blockSize / 2;
        const sB = blockSize / 8;

        const w = side * 0.9;
        const h = side;

        const baseOffsetL = side * 0.25;
        const baseOffsetT = side * 0.55;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // ============== feet ==============

        //left leg face
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 6 / 8, baseOffsetT + side * 23 / 8 - 1 - sB / 16);

        ctx.drawImage(img, hB + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);

        ctx.restore();
        ctx.save();

        if (this.type == TYPE_OLD) {

            // right leg face (mirrored left leg)
            ctx.transform(-1, 0.5, 0, 1, baseOffsetL + side * 13 / 8 + sB / 7, baseOffsetT + side * 19 / 8 + sB / 3 - 0.5 - sB / 16);

            ctx.drawImage(img, hB, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);

            ctx.restore();
            ctx.save();

        } else {

            // right leg face
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 9 / 8 + sB / 2, baseOffsetT + side * 21 / 8 + sB / 8 - sB / 16);

            ctx.drawImage(img, hB * 5 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);

            ctx.restore();
            ctx.save();

            // OVERLAY

            // right leg face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 9 / 8 + sB / 2, baseOffsetT + side * 21 / 8 - sB / 8);

            ctx.drawImage(img, hB + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, (h * 1.5) * 1.1);

            ctx.restore();
            ctx.save();
        }

        // left leg left
        ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 2 / 8 + sB / 2, baseOffsetT + side * 21 / 8 + sB / 8 - sB / 16);

        ctx.drawImage(img, 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            // OVERLAY

            //left leg face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 6 / 8 - 1, baseOffsetT + side * 23 / 8 - sB / 4);

            ctx.drawImage(img, hB + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, (h * 1.5) * 1.1);

            ctx.restore();
            ctx.save();

            // left leg left overlay
            ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 2 / 8, baseOffsetT + side * 21 / 8 - sB / 4);

            ctx.drawImage(img, 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, (h * 1.5) * 1.1);
            ctx.restore();
            ctx.save();

        }

        // arms right
        if (this.type == TYPE_OLD) {
            //mirror left

            // right arm face
            ctx.transform(-1, 0.5, 0, 1, baseOffsetL + (side * 16.75 / 8) - sB / 16, baseOffsetT + (side * 6 / 8) - sB / 4);

            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w * 0.5, h * 1.5);
            ctx.restore();
            ctx.save();

            // right arm top
            ctx.transform(1, 0.5, -1, 0.5, baseOffsetL + (side * 13 / 8) + sB / 8, baseOffsetT + (side * 4 / 8));

            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, sB * 3 - 2, hB - 2, 0, 0, w / 2, w / 2);
            ctx.restore();
            ctx.save();

        }
        else if (this.isAlex) {

            // right arm face
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13 / 8) + sB / 8 - sB / 16, baseOffsetT + (side * 7.5 / 8));

            ctx.drawImage(img, hB * 9 + 1, hB * 13 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, w * 3 / 8, h * 1.5);
            ctx.restore();
            ctx.save();

            //right arm top
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10 / 8) - sB / 2.5, baseOffsetT + (side * 6 / 8) - sB / 4);

            ctx.drawImage(img, hB * 9 + 1, hB * 12 + 1, sB * 3 - 2, hB - 2, 0, 0, w * 3 / 8, w / 2);

            ctx.restore();
            ctx.save();

            // OVERLAYS

            // right arm face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13 / 8) + sB / 8, baseOffsetT + (side * 7.5 / 8) - sB * 0.667);

            ctx.drawImage(img, hB * 13 + 1, hB * 13 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, (w * 3 / 8) * 1.1, (h * 1.5) * 1.1);
            ctx.restore();
            ctx.save();

            //right arm top overlay
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10 / 8) - sB * 0.75, baseOffsetT + (side * 5 / 8) - sB / 8);
            ctx.drawImage(img, hB * 13 + 1, hB * 12 + 1, sB * 3 - 2, hB - 2, 0, 0, (w * 3 / 8) * 1.1, (w / 2) * 1.1);

            ctx.restore();
            ctx.save();

        } else {

            // right arm face
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13 / 8) + sB / 8 - sB / 16, baseOffsetT + (side * 7.5 / 8));

            ctx.drawImage(img, hB * 9 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            //right arm top
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10 / 8) - sB / 2.5, baseOffsetT + (side * 6 / 8) - sB / 4);

            ctx.drawImage(img, hB * 9 + 1, hB * 12 + 1, hB - 2, hB - 2, 0, 0, w / 2, w / 2);

            ctx.restore();
            ctx.save();

            // OVERLAY

            // right arm face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13 / 8) + sB / 8, baseOffsetT + (side * 7.5 / 8) - sB * 0.667);

            ctx.drawImage(img, hB * 13 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, (h * 1.5) * 1.1);
            ctx.restore();
            ctx.save();

            //right arm top overlay
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 9 / 8) + sB / 8, baseOffsetT + (side * 5 / 8) - sB / 8);

            ctx.drawImage(img, hB * 13 + 1, hB * 12 + 1, hB - 2, hB - 2, 0, 0, (w / 2) * 1.1, (w / 2) * 1.1);

            ctx.restore();
            ctx.save();


        }

        // ============ body ==============

        // body face
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.75, baseOffsetT + side * 11 / 8);

        ctx.drawImage(img, hB * 5 + 1, hB * 5 + 1, hB * 2 - 2, hB * 3 - 2, 0, 0, w, h * 1.5);

        ctx.restore();
        ctx.save();


        // body left
        ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 2, baseOffsetT + side * 9.180 / 8);

        ctx.drawImage(img, hB * 4 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);

        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            // overlay layers body

            // body face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.75, baseOffsetT + side * 11 / 8 - sB / 2);

            ctx.drawImage(img, hB * 5 + 1, hB * 9 + 1, hB * 2 - 2, hB * 3 - 2, 0, 0, w * 1.1, h * 1.65);

            ctx.restore();
            ctx.save();

            // body left overlay
            ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 8, baseOffsetT + side * 9 / 8 - sB / 2);

            ctx.drawImage(img, hB * 4 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, w * 0.55, h * 1.65);

            ctx.restore();
            ctx.save();


        }

        // arms left
        if (this.isAlex) {

            // left arm side
            ctx.transform(1, 0.5, 0, 1, baseOffsetL - (side * 0.25) + sB * 1.5 + sB / 16, baseOffsetT + side * 11 / 8 - sB * 0.334);

            ctx.drawImage(img, hB * 10 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            // left arm face
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 0.25) + sB * 9 / 8, baseOffsetT + (side * 13 / 8) - sB / 2);

            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, w * 3 / 8, h * 1.5);
            ctx.restore();
            ctx.save();

            //left arm top
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - (side * 1.5 / 8) + sB, baseOffsetT + (side * 11 / 8) - (sB * 0.334) + 1);

            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, sB * 3 - 2, hB - 2, 0, 0, w * 3 / 8, w / 2);

            ctx.restore();
            ctx.save();

            // overlays

            // left arm side overlay
            ctx.transform(1, 0.5, 0, 1, baseOffsetL - (side * 0.25) + sB * 1.5 - w / 8 * 0.3344, baseOffsetT + side * 10 / 8 - sB * 0.334 + 1);

            ctx.drawImage(img, hB * 10 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w * 1.1) / 2, (h * 1.1) * 1.5);
            ctx.restore();
            ctx.save();

            // left arm face overlay
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 0.25) + sB * 9 / 8, baseOffsetT + (side * 13 / 8) - sB * 1.2);

            ctx.drawImage(img, hB * 11 + 1, hB * 9 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, (w * 3 / 8) * 1.1, (h * 1.5) * 1.1);
            ctx.restore();
            ctx.save();

            //left arm top overlay
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - (side * 1.5 / 8) + sB * 0.667 + 1, baseOffsetT + (side * 10 / 8) - (sB * 0.334) + 1);

            ctx.drawImage(img, hB * 11 + 1, hB * 8 + 1, sB * 3 - 2, hB - 2, 0, 0, (w * 3 / 8) * 1.1, (w / 2) * 1.1);

            ctx.restore();
            ctx.save();

        } else {

            // left arm side
            ctx.transform(1, 0.5, 0, 1, baseOffsetL - (side * 0.25) + sB / 2 + sB / 16, baseOffsetT + side * 11 / 8 + sB / 4);

            ctx.drawImage(img, hB * 10 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            // left arm face
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 0.25) + sB / 8, baseOffsetT + (side * 13 / 8));

            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            //left arm top
            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - (side * 1.5 / 8), baseOffsetT + (side * 11 / 8) + sB / 4 + 1);

            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, hB - 2, hB - 2, 0, 0, w / 2, w / 2);
            ctx.restore();
            ctx.save();

            if (this.type == TYPE_NEW) {
                // overlays

                // left arm side overlay
                ctx.transform(1, 0.5, 0, 1, baseOffsetL - (side * 0.25) + sB / 2 - w / 8 * 0.3344, baseOffsetT + side * 10 / 8 + sB / 4 + 1);

                ctx.drawImage(img, hB * 10 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w * 1.1) / 2, (h * 1.1) * 1.5);
                ctx.restore();
                ctx.save();

                // left arm face overlay
                ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 0.25) + sB / 8, baseOffsetT + (side * 13 / 8) - sB * 0.75);

                ctx.drawImage(img, hB * 11 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, (h * 1.5) * 1.1);
                ctx.restore();
                ctx.save();

                //left arm top overlay
                ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - (side * 1.5 / 8) - (sB * 0.25), baseOffsetT + (side * 11 / 8) - (sB * 0.667) + 1);

                ctx.drawImage(img, hB * 11 + 1, hB * 8 + 1, hB - 2, hB - 2, 0, 0, (w / 2) * 1.1, (w / 2) * 1.1);

                ctx.restore();
                ctx.save();

            }

        }

        // ============== head ==============

        //right hair overlay
        ctx.transform(-1, -0.5, 0, 1, baseOffsetL + w * 2 + sB * .667, baseOffsetT - sB * 0.334);

        ctx.drawImage(img, blockSize * 6 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        //back hair overlay
        ctx.transform(1, -0.5, 0, 1, baseOffsetL - w / 8 * 0.667, baseOffsetT - sB * 0.334);

        ctx.drawImage(img, blockSize * 7 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        //head face
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + (w * 0.5));

        ctx.drawImage(img, blockSize + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);

        ctx.restore();
        ctx.save();

        //head left
        ctx.transform(1, 0.5, 0, 1, baseOffsetL + 0.5, baseOffsetT);

        ctx.drawImage(img, 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);

        ctx.restore();
        ctx.save();


        //head top
        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL, baseOffsetT + 1);

        ctx.drawImage(img, blockSize + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w, w);

        ctx.restore();
        ctx.save();

        //left hair overlay
        ctx.transform(1, 0.5, 0, 1, baseOffsetL - w / 8 * 0.667, baseOffsetT - h / 8 * 0.3334 + 1);
        ctx.drawImage(img, blockSize * 4 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        // front hair overlay
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + h * 0.4625);
        ctx.drawImage(img, blockSize * 5 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        // top hair overlay
        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - sB / 1.75 - 1.5, baseOffsetT - sB / 4);

        ctx.drawImage(img, hB * 10 + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1 + 0.5, w * 1.1 + 0.5);
        ctx.restore();
        ctx.save();

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    }

    _internalGetHead = () => {
        if (this.img === null) this._makeScaledImage();

        const { side, blockSize, img } = this;
        const [rectWidth, rectHeight] = [side * 2.175, side * 2.175];

        let tmpCanvas = canvas.createCanvas(rectWidth, rectHeight);
        let ctx = tmpCanvas.getContext("2d");

        // make upscaled image

        ctx.mozImageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.msImageSmoothingEnabled = true;
        ctx.imageSmoothingEnabled = true;

        const hB = blockSize / 2;
        const sB = blockSize / 8;

        const baseOffsetL = side / 8;
        const baseOffsetT = side / 2 + sB / 2;

        const w = side * 0.9;
        const h = side;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // reset previous drawing (if any)
        ctx.save();

        // ============== head ==============

        //right hair overlay
        ctx.transform(-1, -0.5, 0, 1, baseOffsetL + w * 2 + sB * .667, baseOffsetT - sB * 0.334);

        ctx.drawImage(img, blockSize * 6 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        //back hair overlay
        ctx.transform(1, -0.5, 0, 1, baseOffsetL - w / 8 * 0.667, baseOffsetT - sB * 0.334);

        ctx.drawImage(img, blockSize * 7 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        //head face
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + (w * 0.5));

        ctx.drawImage(img, blockSize + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);

        ctx.restore();
        ctx.save();

        //head left
        ctx.transform(1, 0.5, 0, 1, baseOffsetL + 0.5, baseOffsetT);

        ctx.drawImage(img, 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);

        ctx.restore();
        ctx.save();


        //head top
        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL, baseOffsetT + 1);

        ctx.drawImage(img, blockSize + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w, w);

        ctx.restore();
        ctx.save();

        //left hair overlay
        ctx.transform(1, 0.5, 0, 1, baseOffsetL - w / 8 * 0.667, baseOffsetT - h / 8 * 0.3334 + 1);
        ctx.drawImage(img, blockSize * 4 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);

        ctx.restore();
        ctx.save();

        // front hair overlay
        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + h * 0.4625);
        ctx.drawImage(img, blockSize * 5 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        // top hair overlay
        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - sB / 1.75 - 1.5, baseOffsetT - sB / 4);

        ctx.drawImage(img, hB * 10 + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1 + 0.5, w * 1.1 + 0.5);
        ctx.restore();
        ctx.save();

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    }

    static generateToScaleImage = (side, image) => {

        const minWidth = side * 8;
        let newWidth = image.width;
        let newHeight = image.height;

        while (newWidth < minWidth) {
            newWidth *= 2;
            newHeight *= 2;
            // determine workable minimum scale width
        }

        let tmpCanvas = canvas.createCanvas(newWidth, newHeight);
        let tmpCtx = tmpCanvas.getContext("2d");

        tmpCanvas.width = newWidth;
        tmpCanvas.height = newHeight;

        // make upscaled image

        tmpCtx.mozImageSmoothingEnabled = false;
        tmpCtx.webkitImageSmoothingEnabled = false;
        tmpCtx.msImageSmoothingEnabled = false;
        tmpCtx.imageSmoothingEnabled = false;

        tmpCtx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    };

    static getSideForHead(imageWidth) {
        return Math.floor(imageWidth / 2.05);
    }
}

module.exports = MinecraftSkin;