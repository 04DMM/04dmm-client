import { ConfigType } from '#/config/ConfigType.js';
import SeqType from '#/config/SeqType.js';

import LruCache from '#/datastruct/LruCache.js';

import Model from '#/graphics/Model.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

export default class SpotAnimType extends ConfigType {
    static totalCount: number = 0;
    static instances: SpotAnimType[] = [];
    static modelCache: LruCache | null = new LruCache(30);

    static unpack(config: Jagfile): void {
        const dat: Packet = new Packet(config.read('spotanim.dat'));
        this.totalCount = dat.g2();
        for (let i: number = 0; i < this.totalCount; i++) {
            this.instances[i] = new SpotAnimType(i).unpackType(dat);
        }
    }

    // ----

    model: number = 0;
    anim: number = -1;
    seq: SeqType | null = null;
    disposeAlpha: boolean = false;
    recol_s: Uint16Array = new Uint16Array(6);
    recol_d: Uint16Array = new Uint16Array(6);
    resizeh: number = 128;
    resizev: number = 128;
    spotAngle: number = 0;
    ambient: number = 0;
    contrast: number = 0;

    unpack(code: number, dat: Packet): void {
        if (code === 1) {
            this.model = dat.g2();
        } else if (code === 2) {
            this.anim = dat.g2();

            if (SeqType.instances) {
                this.seq = SeqType.instances[this.anim];
            }
        } else if (code === 3) {
            this.disposeAlpha = true;
        } else if (code === 4) {
            this.resizeh = dat.g2();
        } else if (code === 5) {
            this.resizev = dat.g2();
        } else if (code === 6) {
            this.spotAngle = dat.g2();
        } else if (code === 7) {
            this.ambient = dat.g1();
        } else if (code === 8) {
            this.contrast = dat.g1();
        } else if (code >= 40 && code < 50) {
            this.recol_s[code - 40] = dat.g2();
        } else if (code >= 50 && code < 60) {
            this.recol_d[code - 50] = dat.g2();
        } else {
            console.log('Error unrecognised spotanim config code: ', code);
        }
    }

    getModel(): Model {
        let model: Model | null = SpotAnimType.modelCache?.get(BigInt(this.id)) as Model | null;
        if (model) {
            return model;
        }
        model = Model.model(this.model);
        for (let i: number = 0; i < 6; i++) {
            if (this.recol_s[0] !== 0) {
                model.recolor(this.recol_s[i], this.recol_d[i]);
            }
        }
        SpotAnimType.modelCache?.put(BigInt(this.id), model);
        return model;
    }
}
