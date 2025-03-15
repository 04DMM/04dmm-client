import SpotAnimType from '#/config/SpotAnimType.js';

import Entity from '#/dash3d/entity/Entity.js';

import Model from '#/graphics/Model.js';

export default class SpotAnimEntity extends Entity {
    readonly spotType: SpotAnimType;
    readonly spotLevel: number;
    readonly x: number;
    readonly z: number;
    readonly y: number;
    readonly startCycle: number;

    // runtime
    seqComplete: boolean = false;
    seqFrame: number = 0;
    seqCycle: number = 0;

    constructor(id: number, level: number, x: number, z: number, y: number, cycle: number, delay: number) {
        super();
        this.spotType = SpotAnimType.instances[id];
        this.spotLevel = level;
        this.x = x;
        this.z = z;
        this.y = y;
        this.startCycle = cycle + delay;
    }

    update(delta: number): void {
        if (!this.spotType.seq || !this.spotType.seq.seqDelay) {
            return;
        }

        for (this.seqCycle += delta; this.seqCycle > this.spotType.seq.seqDelay[this.seqFrame]; ) {
            this.seqCycle -= this.spotType.seq.seqDelay[this.seqFrame] + 1;
            this.seqFrame++;

            if (this.seqFrame >= this.spotType.seq.seqFrameCount) {
                this.seqFrame = 0;
                this.seqComplete = true;
            }
        }
    }

    draw(): Model {
        const tmp: Model = this.spotType.getModel();
        const model: Model = Model.modelShareColored(tmp, true, !this.spotType.disposeAlpha, false);
        if (!this.seqComplete && this.spotType.seq && this.spotType.seq.seqFrames) {
            model.createLabelReferences();
            model.applyTransform(this.spotType.seq.seqFrames[this.seqFrame]);
            model.labelFaces = null;
            model.labelVertices = null;
        }

        if (this.spotType.resizeh !== 128 || this.spotType.resizev !== 128) {
            model.scale(this.spotType.resizeh, this.spotType.resizev, this.spotType.resizeh);
        }

        if (this.spotType.spotAngle !== 0) {
            if (this.spotType.spotAngle === 90) {
                model.rotateY90();
            } else if (this.spotType.spotAngle === 180) {
                model.rotateY90();
                model.rotateY90();
            } else if (this.spotType.spotAngle === 270) {
                model.rotateY90();
                model.rotateY90();
                model.rotateY90();
            }
        }

        model.calculateNormals(64 + this.spotType.ambient, 850 + this.spotType.contrast, -30, -50, -30, true);
        return model;
    }
}
