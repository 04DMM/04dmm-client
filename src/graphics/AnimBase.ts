import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

import { TypedArray1d } from '#/util/Arrays.js';

export default class AnimBase {
    static instances: AnimBase[] = [];

    static unpack(models: Jagfile): void {
        const head: Packet = new Packet(models.read('base_head.dat'));
        const type: Packet = new Packet(models.read('base_type.dat'));
        const label: Packet = new Packet(models.read('base_label.dat'));

        const total: number = head.g2();
        head.pos += 2; // const count = head.g2();

        for (let i: number = 0; i < total; i++) {
            const id: number = head.g2();
            const length: number = head.g1();

            const transformTypes: Uint8Array = new Uint8Array(length);
            const groupLabels: (Uint8Array | null)[] = new TypedArray1d(length, null);

            for (let j: number = 0; j < length; j++) {
                transformTypes[j] = type.g1();

                const groupCount: number = label.g1();
                const labels: Uint8Array = new Uint8Array(groupCount);

                for (let k: number = 0; k < groupCount; k++) {
                    labels[k] = label.g1();
                }
                groupLabels[j] = labels;
            }

            this.instances[id] = new AnimBase();
            this.instances[id].animLength = length;
            this.instances[id].animTypes = transformTypes;
            this.instances[id].animLabels = groupLabels;
        }
    }

    // ----

    animLength: number = 0;
    animTypes: Uint8Array | null = null;
    animLabels: (Uint8Array | null)[] | null = null;
}
