import SeqType from '#/config/SeqType.js';

import Linkable from '#/datastruct/Linkable.js';

export default class LocEntity extends Linkable {
    heightmapSW: number;
    readonly heightmapSE: number;
    readonly heightmapNE: number;
    readonly heightmapNW: number;
    readonly index: number;
    readonly seq: SeqType;
    seqFrame: number;
    seqCycle: number;

    constructor(index: number, heightmapSW: number, heightmapSE: number, heightmapNE: number, heightmapNW: number, seq: SeqType, randomFrame: boolean) {
        super();
        this.heightmapSW = heightmapSW;
        this.heightmapSE = heightmapSE;
        this.heightmapNE = heightmapNE;
        this.heightmapNW = heightmapNW;
        this.index = index;
        this.seq = seq;

        if (randomFrame && seq.replayoff !== -1 && this.seq.seqDelay) {
            this.seqFrame = (Math.random() * this.seq.seqFrameCount) | 0;
            this.seqCycle = (Math.random() * this.seq.seqDelay[this.seqFrame]) | 0;
        } else {
            this.seqFrame = -1;
            this.seqCycle = 0;
        }
    }
}
