// https://github.com/parawanderer/mc-render-generator

const canvas = require("canvas");
const Image = canvas.Image;

const TYPE_OLD = 1;
const TYPE_NEW = 2;

// TODO: Look at this and see if it can be cleaned up, alot..
class Render3d {
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

    constructor(imageBufferFile, isAlex = false, imageWidth = Render3d.side) {
        this.baseBuffer = imageBufferFile;

        const imageFile = new Image();
        imageFile.src = imageBufferFile;
        this.baseImage = imageFile;

        this.side = Render3d.side;
        this.isAlex = isAlex;
        this.imageWidth = imageWidth;

        if (!imageFile.width || typeof imageFile.width !== "number")
            throw Error(`Invalid skin file dimensions! Width was ${imageFile.width}.`);
        if (imageFile.width % 64 !== 0)
            throw Error(`Invalid skin file dimensions! Expected width number divisable by 64, got ${imageFile.width}`);
        if (imageFile.height % 32 !== 0)
            throw Error(`Invalid skin file dimensions! Expected height number divisable by 32, got ${imageFile.height}`);

        // determine type?
        this.type = imageFile.height !== imageFile.width ? TYPE_OLD : TYPE_NEW;

        this._canvas = canvas.createCanvas(imageWidth, imageWidth);
        this._ctx = this._canvas.getContext("2d");

        this._ctx.mozImageSmoothingEnabled = true;
        this._ctx.webkitImageSmoothingEnabled = true;
        this._ctx.msImageSmoothingEnabled = true;
        this._ctx.imageSmoothingEnabled = true;
    }

    getRender = () => {
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = Render3d.getSideForHead(this.imageWidth);
        let drawSide = Render3d.side;

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        const upscaleImage = this._internalGetRender();
        const [finalWidth, finalHeight] = [this.imageWidth, this.imageWidth * 2.05];

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    };

    getHead = () => {
        const ctx = this._ctx;
        const canvas = this._canvas;

        const outSide = Render3d.getSideForHead(this.imageWidth);
        let drawSide = Render3d.side;

        while (drawSide < outSide) {
            drawSide *= 2;
        }

        this.side = drawSide;

        const upscaleImage = this._internalGetHead();

        const [finalWidth, finalHeight] = [this.imageWidth, this.imageWidth];

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(upscaleImage, 0, 0, finalWidth, finalHeight);

        return canvas.toBuffer();
    };

    _makeScaledImage = () => {
        try {
            this.img = Render3d.generateToScaleImage(this.side, this.baseImage);
            this.blockSize = this.img.width / 8;
        } catch (e) {
            throw Error("Could not generate upscaled image");
        }
    };

    _internalGetRender = () => {
        if (this.img === null) this._makeScaledImage();

        const { side, blockSize, img } = this;
        const [rectWidth, rectHeight] = Render3d.getRenderImageDimensions(side);

        let tmpCanvas = canvas.createCanvas(rectWidth, rectHeight);
        let ctx = tmpCanvas.getContext("2d");

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

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 6) / 8, baseOffsetT + (side * 23) / 8 - 1 - sB / 16);
        ctx.drawImage(img, hB + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
        ctx.restore();
        ctx.save();

        if (this.type == TYPE_OLD) {
            ctx.transform(
                -1,
                0.5,
                0,
                1,
                baseOffsetL + (side * 13) / 8 + sB / 7,
                baseOffsetT + (side * 19) / 8 + sB / 3 - 0.5 - sB / 16
            );
            ctx.drawImage(img, hB, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();
        } else {
            ctx.transform(
                1,
                -0.5,
                0,
                1,
                baseOffsetL + (side * 9) / 8 + sB / 2,
                baseOffsetT + (side * 21) / 8 + sB / 8 - sB / 16
            );
            ctx.drawImage(img, hB * 5 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 9) / 8 + sB / 2, baseOffsetT + (side * 21) / 8 - sB / 8);
            ctx.drawImage(img, hB + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();
        }

        ctx.transform(1, 0.5, 0, 1, baseOffsetL + (side * 2) / 8 + sB / 2, baseOffsetT + (side * 21) / 8 + sB / 8 - sB / 16);
        ctx.drawImage(img, 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 6) / 8 - 1, baseOffsetT + (side * 23) / 8 - sB / 4);
            ctx.drawImage(img, hB + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();

            ctx.transform(1, 0.5, 0, 1, baseOffsetL + (side * 2) / 8, baseOffsetT + (side * 21) / 8 - sB / 4);
            ctx.drawImage(img, 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();
        }

        if (this.type == TYPE_OLD) {
            ctx.transform(-1, 0.5, 0, 1, baseOffsetL + (side * 16.75) / 8 - sB / 16, baseOffsetT + (side * 6) / 8 - sB / 4);
            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w * 0.5, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, 0.5, -1, 0.5, baseOffsetL + (side * 13) / 8 + sB / 8, baseOffsetT + (side * 4) / 8);
            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, sB * 3 - 2, hB - 2, 0, 0, w / 2, w / 2);
            ctx.restore();
            ctx.save();
        } else if (this.isAlex) {
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13) / 8 + sB / 8 - sB / 16, baseOffsetT + (side * 7.5) / 8);
            ctx.drawImage(img, hB * 9 + 1, hB * 13 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, (w * 3) / 8, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10) / 8 - sB / 2.5, baseOffsetT + (side * 6) / 8 - sB / 4);
            ctx.drawImage(img, hB * 9 + 1, hB * 12 + 1, sB * 3 - 2, hB - 2, 0, 0, (w * 3) / 8, w / 2);
            ctx.restore();
            ctx.save();

            ctx.transform(
                1,
                -0.5,
                0,
                1,
                baseOffsetL + (side * 13) / 8 + sB / 8,
                baseOffsetT + (side * 7.5) / 8 - sB * 0.667
            );
            ctx.drawImage(img, hB * 13 + 1, hB * 13 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, ((w * 3) / 8) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10) / 8 - sB * 0.75, baseOffsetT + (side * 5) / 8 - sB / 8);
            ctx.drawImage(img, hB * 13 + 1, hB * 12 + 1, sB * 3 - 2, hB - 2, 0, 0, ((w * 3) / 8) * 1.1, (w / 2) * 1.1);
            ctx.restore();
            ctx.save();
        } else {
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + (side * 13) / 8 + sB / 8 - sB / 16, baseOffsetT + (side * 7.5) / 8);
            ctx.drawImage(img, hB * 9 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 10) / 8 - sB / 2.5, baseOffsetT + (side * 6) / 8 - sB / 4);
            ctx.drawImage(img, hB * 9 + 1, hB * 12 + 1, hB - 2, hB - 2, 0, 0, w / 2, w / 2);
            ctx.restore();
            ctx.save();

            ctx.transform(
                1,
                -0.5,
                0,
                1,
                baseOffsetL + (side * 13) / 8 + sB / 8,
                baseOffsetT + (side * 7.5) / 8 - sB * 0.667
            );
            ctx.drawImage(img, hB * 13 + 1, hB * 13 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL + (side * 9) / 8 + sB / 8, baseOffsetT + (side * 5) / 8 - sB / 8);
            ctx.drawImage(img, hB * 13 + 1, hB * 12 + 1, hB - 2, hB - 2, 0, 0, (w / 2) * 1.1, (w / 2) * 1.1);
            ctx.restore();
            ctx.save();
        }

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.75, baseOffsetT + (side * 11) / 8);
        ctx.drawImage(img, hB * 5 + 1, hB * 5 + 1, hB * 2 - 2, hB * 3 - 2, 0, 0, w, h * 1.5);
        ctx.restore();
        ctx.save();

        ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 2, baseOffsetT + (side * 9.18) / 8);
        ctx.drawImage(img, hB * 4 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
        ctx.restore();
        ctx.save();

        if (this.type == TYPE_NEW) {
            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.75, baseOffsetT + (side * 11) / 8 - sB / 2);
            ctx.drawImage(img, hB * 5 + 1, hB * 9 + 1, hB * 2 - 2, hB * 3 - 2, 0, 0, w * 1.1, h * 1.65);
            ctx.restore();
            ctx.save();

            ctx.transform(1, 0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 8, baseOffsetT + (side * 9) / 8 - sB / 2);
            ctx.drawImage(img, hB * 4 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, w * 0.55, h * 1.65);
            ctx.restore();
            ctx.save();
        }

        if (this.isAlex) {
            ctx.transform(
                1,
                0.5,
                0,
                1,
                baseOffsetL - side * 0.25 + sB * 1.5 + sB / 16,
                baseOffsetT + (side * 11) / 8 - sB * 0.334
            );
            ctx.drawImage(img, hB * 10 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.25 + (sB * 9) / 8, baseOffsetT + (side * 13) / 8 - sB / 2);
            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, (w * 3) / 8, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(
                1,
                -0.5,
                1,
                0.5,
                baseOffsetL - (side * 1.5) / 8 + sB,
                baseOffsetT + (side * 11) / 8 - sB * 0.334 + 1
            );
            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, sB * 3 - 2, hB - 2, 0, 0, (w * 3) / 8, w / 2);
            ctx.restore();
            ctx.save();

            ctx.transform(
                1,
                0.5,
                0,
                1,
                baseOffsetL - side * 0.25 + sB * 1.5 - (w / 8) * 0.3344,
                baseOffsetT + (side * 10) / 8 - sB * 0.334 + 1
            );
            ctx.drawImage(img, hB * 10 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, (w * 1.1) / 2, h * 1.1 * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.25 + (sB * 9) / 8, baseOffsetT + (side * 13) / 8 - sB * 1.2);
            ctx.drawImage(img, hB * 11 + 1, hB * 9 + 1, sB * 3 - 2, hB * 3 - 2, 0, 0, ((w * 3) / 8) * 1.1, h * 1.5 * 1.1);
            ctx.restore();
            ctx.save();

            ctx.transform(
                1,
                -0.5,
                1,
                0.5,
                baseOffsetL - (side * 1.5) / 8 + sB * 0.667 + 1,
                baseOffsetT + (side * 10) / 8 - sB * 0.334 + 1
            );
            ctx.drawImage(img, hB * 11 + 1, hB * 8 + 1, sB * 3 - 2, hB - 2, 0, 0, ((w * 3) / 8) * 1.1, (w / 2) * 1.1);
            ctx.restore();
            ctx.save();
        } else {
            ctx.transform(
                1,
                0.5,
                0,
                1,
                baseOffsetL - side * 0.25 + sB / 2 + sB / 16,
                baseOffsetT + (side * 11) / 8 + sB / 4
            );
            ctx.drawImage(img, hB * 10 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 8, baseOffsetT + (side * 13) / 8);
            ctx.drawImage(img, hB * 11 + 1, hB * 5 + 1, hB - 2, hB * 3 - 2, 0, 0, w / 2, h * 1.5);
            ctx.restore();
            ctx.save();

            ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - (side * 1.5) / 8, baseOffsetT + (side * 11) / 8 + sB / 4 + 1);
            ctx.drawImage(img, hB * 11 + 1, hB * 4 + 1, hB - 2, hB - 2, 0, 0, w / 2, w / 2);
            ctx.restore();
            ctx.save();

            if (this.type == TYPE_NEW) {
                ctx.transform(
                    1,
                    0.5,
                    0,
                    1,
                    baseOffsetL - side * 0.25 + sB / 2 - (w / 8) * 0.3344,
                    baseOffsetT + (side * 10) / 8 + sB / 4 + 1
                );
                ctx.drawImage(img, hB * 10 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w * 1.1) / 2, h * 1.1 * 1.5);
                ctx.restore();
                ctx.save();

                ctx.transform(1, -0.5, 0, 1, baseOffsetL + side * 0.25 + sB / 8, baseOffsetT + (side * 13) / 8 - sB * 0.75);
                ctx.drawImage(img, hB * 11 + 1, hB * 9 + 1, hB - 2, hB * 3 - 2, 0, 0, (w / 2) * 1.1, h * 1.5 * 1.1);
                ctx.restore();
                ctx.save();

                ctx.transform(
                    1,
                    -0.5,
                    1,
                    0.5,
                    baseOffsetL - (side * 1.5) / 8 - sB * 0.25,
                    baseOffsetT + (side * 11) / 8 - sB * 0.667 + 1
                );
                ctx.drawImage(img, hB * 11 + 1, hB * 8 + 1, hB - 2, hB - 2, 0, 0, (w / 2) * 1.1, (w / 2) * 1.1);
                ctx.restore();
                ctx.save();
            }
        }

        ctx.transform(-1, -0.5, 0, 1, baseOffsetL + w * 2 + sB * 0.667, baseOffsetT - sB * 0.334);
        ctx.drawImage(img, blockSize * 6 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL - (w / 8) * 0.667, baseOffsetT - sB * 0.334);
        ctx.drawImage(img, blockSize * 7 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + w * 0.5);
        ctx.drawImage(img, blockSize + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);
        ctx.restore();
        ctx.save();

        ctx.transform(1, 0.5, 0, 1, baseOffsetL + 0.5, baseOffsetT);
        ctx.drawImage(img, 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL, baseOffsetT + 1);
        ctx.drawImage(img, blockSize + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w, w);
        ctx.restore();
        ctx.save();

        ctx.transform(1, 0.5, 0, 1, baseOffsetL - (w / 8) * 0.667, baseOffsetT - (h / 8) * 0.3334 + 1);
        ctx.drawImage(img, blockSize * 4 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + h * 0.4625);
        ctx.drawImage(img, blockSize * 5 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - sB / 1.75 - 1.5, baseOffsetT - sB / 4);
        ctx.drawImage(img, hB * 10 + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1 + 0.5, w * 1.1 + 0.5);
        ctx.restore();
        ctx.save();

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    };

    _internalGetHead = () => {
        if (this.img === null) this._makeScaledImage();

        const { side, blockSize, img } = this;
        const [rectWidth, rectHeight] = Render3d.getHeadImageDimensions(side);

        let tmpCanvas = canvas.createCanvas(rectWidth, rectHeight);
        let ctx = tmpCanvas.getContext("2d");

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

        ctx.transform(-1, -0.5, 0, 1, baseOffsetL + w * 2 + sB * 0.667, baseOffsetT - sB * 0.334);
        ctx.drawImage(img, blockSize * 6 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL - (w / 8) * 0.667, baseOffsetT - sB * 0.334);
        ctx.drawImage(img, blockSize * 7 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + w * 0.5);
        ctx.drawImage(img, blockSize + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);
        ctx.restore();
        ctx.save();

        ctx.transform(1, 0.5, 0, 1, baseOffsetL + 0.5, baseOffsetT);
        ctx.drawImage(img, 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w, h);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL, baseOffsetT + 1);
        ctx.drawImage(img, blockSize + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w, w);
        ctx.restore();
        ctx.save();

        ctx.transform(1, 0.5, 0, 1, baseOffsetL - (w / 8) * 0.667, baseOffsetT - (h / 8) * 0.3334 + 1);
        ctx.drawImage(img, blockSize * 4 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 0, 1, baseOffsetL + w, baseOffsetT + h * 0.4625);
        ctx.drawImage(img, blockSize * 5 + 1, blockSize + 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1, h * 1.1);
        ctx.restore();
        ctx.save();

        ctx.transform(1, -0.5, 1, 0.5, baseOffsetL - sB / 1.75 - 1.5, baseOffsetT - sB / 4);
        ctx.drawImage(img, hB * 10 + 1, 1, blockSize - 2, blockSize - 2, 0, 0, w * 1.1 + 0.5, w * 1.1 + 0.5);
        ctx.restore();
        ctx.save();

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    };

    static getHeadImageDimensions(side) {
        return [side * 2.175, side * 2.175];
    }
    static getRenderImageDimensions(side) {
        return [side * 2.5, side * 5.1];
    }

    static generateToScaleImage = (side, image) => {
        const minWidth = side * 8;
        let newWidth = image.width;
        let newHeight = image.height;

        while (newWidth < minWidth) {
            newWidth *= 2;
            newHeight *= 2;
        }

        let tmpCanvas = canvas.createCanvas(newWidth, newHeight);
        let tmpCtx = tmpCanvas.getContext("2d");

        tmpCanvas.width = newWidth;
        tmpCanvas.height = newHeight;

        tmpCtx.mozImageSmoothingEnabled = false;
        tmpCtx.webkitImageSmoothingEnabled = false;
        tmpCtx.msImageSmoothingEnabled = false;
        tmpCtx.imageSmoothingEnabled = false;

        tmpCtx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);

        let tmpImg = new Image();
        tmpImg.src = tmpCanvas.toBuffer();
        return tmpImg;
    };

    static getSideForRender(imageWidth) {
        return Math.floor(imageWidth / 2.5);
    }
    static getSideForHead(imageWidth) {
        return Math.floor(imageWidth / 2.05);
    }
}

module.exports = Render3d;
