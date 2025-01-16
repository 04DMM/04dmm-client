import { ConfigType } from '#/config/ConfigType.js';

import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

export default class VarpType extends ConfigType {
    static count: number = 0;
    static instances: VarpType[] = [];
    static code3: number[] = [];
    static code3Count: number = 0;

    static unpack = (config: Jagfile): void => {
        const dat: Packet = new Packet(config.read('varp.dat'));
        this.count = dat.g2;
        for (let i: number = 0; i < this.count; i++) {
            this.instances[i] = new VarpType(i).decodeType(dat);
        }
    };

    // ----

    scope: number = 0;
    type: number = 0;
    code3: boolean = false;
    protect: boolean = true;
    clientcode: number = 0;
    code7: number = 0;
    transmit: boolean = false;
    code8: boolean = false;

    decode(code: number, dat: Packet): void {
        if (code === 1) {
            this.scope = dat.g1;
        } else if (code === 2) {
            this.type = dat.g1;
        } else if (code === 3) {
            this.code3 = true;
            VarpType.code3[VarpType.code3Count++] = this.id;
        } else if (code === 4) {
            this.protect = false;
        } else if (code === 5) {
            this.clientcode = dat.g2;
        } else if (code === 6) {
            this.transmit = true;
        } else if (code === 7) {
            this.code7 = dat.g4;
        } else if (code === 8) {
            this.code8 = true;
        } else if (code === 10) {
            this.debugname = dat.gjstr;
        } else {
            console.log('Error unrecognised config code: ', code);
        }
    }
}
