import SpotAnimType from '#/config/SpotAnimType.js';

import Entity from '#/dash3d/entity/Entity.js';

import Model from '#/graphics/Model.js';

export default class ProjectileEntity extends Entity {
    readonly spotanim: SpotAnimType;
    readonly projLevel: number;
    readonly srcX: number;
    readonly srcZ: number;
    readonly srcY: number;
    readonly projOffsetY: number;
    readonly startCycle: number;
    readonly lastCycle: number;
    readonly peakPitch: number;
    readonly projArc: number;
    readonly projTarget: number;

    // runtime
    mobile: boolean = false;
    x: number = 0.0;
    z: number = 0.0;
    y: number = 0.0;
    projVelocityX: number = 0.0;
    projVelocityZ: number = 0.0;
    projVelocity: number = 0.0;
    projVelocityY: number = 0.0;
    accelerationY: number = 0.0;
    yaw: number = 0;
    pitch: number = 0;
    seqFrame: number = 0;
    seqCycle: number = 0;

    constructor(spotanim: number, level: number, srcX: number, srcY: number, srcZ: number, startCycle: number, lastCycle: number, peakPitch: number, arc: number, target: number, offsetY: number) {
        super();
        this.spotanim = SpotAnimType.instances[spotanim];
        this.projLevel = level;
        this.srcX = srcX;
        this.srcZ = srcZ;
        this.srcY = srcY;
        this.startCycle = startCycle;
        this.lastCycle = lastCycle;
        this.peakPitch = peakPitch;
        this.projArc = arc;
        this.projTarget = target;
        this.projOffsetY = offsetY;
    }

    updateVelocity(dstX: number, dstY: number, dstZ: number, cycle: number): void {
        if (!this.mobile) {
            const dx: number = dstX - this.srcX;
            const dz: number = dstZ - this.srcZ;
            const d: number = Math.sqrt(dx * dx + dz * dz);

            this.x = this.srcX + (dx * this.projArc) / d;
            this.z = this.srcZ + (dz * this.projArc) / d;
            this.y = this.srcY;
        }

        const dt: number = this.lastCycle + 1 - cycle;
        this.projVelocityX = (dstX - this.x) / dt;
        this.projVelocityZ = (dstZ - this.z) / dt;
        this.projVelocity = Math.sqrt(this.projVelocityX * this.projVelocityX + this.projVelocityZ * this.projVelocityZ);
        if (!this.mobile) {
            this.projVelocityY = -this.projVelocity * Math.tan(this.peakPitch * 0.02454369);
        }
        this.accelerationY = ((dstY - this.y - this.projVelocityY * dt) * 2.0) / (dt * dt);
    }

    update(delta: number): void {
        this.mobile = true;
        this.x += this.projVelocityX * delta;
        this.z += this.projVelocityZ * delta;
        this.y += this.projVelocityY * delta + this.accelerationY * 0.5 * delta * delta;
        this.projVelocityY += this.accelerationY * delta;
        this.yaw = ((Math.atan2(this.projVelocityX, this.projVelocityZ) * 325.949 + 1024) | 0) & 0x7ff;
        this.pitch = ((Math.atan2(this.projVelocityY, this.projVelocity) * 325.949) | 0) & 0x7ff;

        if (!this.spotanim.seq || !this.spotanim.seq.seqDelay) {
            return;
        }
        this.seqCycle += delta;
        while (this.seqCycle > this.spotanim.seq.seqDelay[this.seqFrame]) {
            this.seqCycle -= this.spotanim.seq.seqDelay[this.seqFrame] + 1;
            this.seqFrame++;
            if (this.seqFrame >= this.spotanim.seq.seqFrameCount) {
                this.seqFrame = 0;
            }
        }
    }

    draw(): Model | null {
        const tmp: Model = this.spotanim.getModel();
        const model: Model = Model.modelShareColored(tmp, true, !this.spotanim.disposeAlpha, false);

        if (this.spotanim.seq && this.spotanim.seq.seqFrames) {
            model.createLabelReferences();
            model.applyTransform(this.spotanim.seq.seqFrames[this.seqFrame]);
            model.labelFaces = null;
            model.labelVertices = null;
        }

        if (this.spotanim.resizeh !== 128 || this.spotanim.resizev !== 128) {
            model.scale(this.spotanim.resizeh, this.spotanim.resizev, this.spotanim.resizeh);
        }

        model.rotateX(this.pitch);
        model.calculateNormals(64 + this.spotanim.ambient, 850 + this.spotanim.contrast, -30, -50, -30, true);
        return model;
    }
}
