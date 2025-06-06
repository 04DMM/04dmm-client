import { ConfigType } from '#/config/ConfigType.js';

import Model from '#/graphics/Model.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

import { TypedArray1d } from '#/util/Arrays.js';

export default class IdkType extends ConfigType {
    static totalCount: number = 0;
    static instances: IdkType[] = [];

    static unpack(config: Jagfile): void {
        const dat: Packet = new Packet(config.read('idk.dat'));
        this.totalCount = dat.g2();
        for (let i: number = 0; i < this.totalCount; i++) {
            this.instances[i] = new IdkType(i).unpackType(dat);
        }
    }

    // ----

    bodyPart: number = -1;
    models: Int32Array | null = null;
    heads: Int32Array = new Int32Array(5).fill(-1);
    recol_s: Int32Array = new Int32Array(6);
    recol_d: Int32Array = new Int32Array(6);
    disableKit: boolean = false;

    unpack(code: number, dat: Packet): void {
        if (code === 1) {
            this.bodyPart = dat.g1();
        } else if (code === 2) {
            const count: number = dat.g1();
            this.models = new Int32Array(count);

            for (let i: number = 0; i < count; i++) {
                this.models[i] = dat.g2();
            }
        } else if (code === 3) {
            this.disableKit = true;
        } else if (code >= 40 && code < 50) {
            this.recol_s[code - 40] = dat.g2();
        } else if (code >= 50 && code < 60) {
            this.recol_d[code - 50] = dat.g2();
        } else if (code >= 60 && code < 70) {
            this.heads[code - 60] = dat.g2();
        } else {
            console.log('Error unrecognised config code: ', code);
        }
    }

    getModel(): Model | null {
        if (!this.models) {
            return null;
        }

        const models: (Model | null)[] = new TypedArray1d(this.models.length, null);
        for (let i: number = 0; i < this.models.length; i++) {
            models[i] = Model.model(this.models[i]);
        }

        let model: Model | null;
        if (models.length === 1) {
            model = models[0];
        } else {
            model = Model.modelFromModels(models, models.length);
        }

        for (let i: number = 0; i < 6 && this.recol_s[i] !== 0; i++) {
            model?.recolor(this.recol_s[i], this.recol_d[i]);
        }
        return model;
    }

    getHeadModel(): Model {
        let count: number = 0;

        const models: (Model | null)[] = new TypedArray1d(5, null);
        for (let i: number = 0; i < 5; i++) {
            if (this.heads[i] !== -1) {
                models[count++] = Model.model(this.heads[i]);
            }
        }

        const model: Model = Model.modelFromModels(models, count);
        for (let i: number = 0; i < 6 && this.recol_s[i] !== 0; i++) {
            model.recolor(this.recol_s[i], this.recol_d[i]);
        }

        return model;
    }
}
