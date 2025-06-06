import Jagfile from '#/io/Jagfile.js';
import Packet from '#/io/Packet.js';

import Tone from '#/sound/Tone.js';

import { TypedArray1d } from '#/util/Arrays.js';

export default class Wave {
    static readonly delays: Int32Array = new Int32Array(1000);
    static waveBytes: Uint8Array | null = null;
    static waveBuffer: Packet | null = null;

    private static readonly tracks: (Wave | null)[] = new TypedArray1d(1000, null);
    private readonly tones: (Tone | null)[] = new TypedArray1d(10, null);

    private waveLoopBegin: number = 0;
    private waveLoopEnd: number = 0;

    static unpack(sounds: Jagfile): void {
        const dat: Packet = new Packet(sounds.read('sounds.dat'));
        this.waveBytes = new Uint8Array(441000);
        this.waveBuffer = new Packet(this.waveBytes);
        Tone.init();

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const id: number = dat.g2();
            if (id === 65535) {
                break;
            }

            const wave: Wave = new Wave();
            wave.read(dat);
            this.tracks[id] = wave;
            this.delays[id] = wave.trim();
        }
    }

    static generate(id: number, loopCount: number): Packet | null {
        if (!this.tracks[id]) {
            return null;
        }
        const track: Wave | null = this.tracks[id];
        return track?.getWave(loopCount) ?? null;
    }

    read(dat: Packet): void {
        for (let tone: number = 0; tone < 10; tone++) {
            if (dat.g1() !== 0) {
                dat.pos--;
                this.tones[tone] = new Tone();
                this.tones[tone]?.read(dat);
            }
        }
        this.waveLoopBegin = dat.g2();
        this.waveLoopEnd = dat.g2();
    }

    trim(): number {
        let start: number = 9999999;
        for (let tone: number = 0; tone < 10; tone++) {
            if (this.tones[tone] && ((this.tones[tone]!.toneStart / 20) | 0) < start) {
                start = (this.tones[tone]!.toneStart / 20) | 0;
            }
        }

        if (this.waveLoopBegin < this.waveLoopEnd && ((this.waveLoopBegin / 20) | 0) < start) {
            start = (this.waveLoopBegin / 20) | 0;
        }

        if (start === 9999999 || start === 0) {
            return 0;
        }

        for (let tone: number = 0; tone < 10; tone++) {
            if (this.tones[tone]) {
                this.tones[tone]!.toneStart -= start * 20;
            }
        }

        if (this.waveLoopBegin < this.waveLoopEnd) {
            this.waveLoopBegin -= start * 20;
            this.waveLoopEnd -= start * 20;
        }

        return start;
    }

    getWave(loopCount: number): Packet | null {
        const length: number = this.generate(loopCount);
        Wave.waveBuffer!.pos = 0;
        Wave.waveBuffer?.p4(0x52494646); // "RIFF" ChunkID
        Wave.waveBuffer?.ip4(length + 36); // ChunkSize
        Wave.waveBuffer?.p4(0x57415645); // "WAVE" format
        Wave.waveBuffer?.p4(0x666d7420); // "fmt " chunk id
        Wave.waveBuffer?.ip4(16); // chunk size
        Wave.waveBuffer?.ip2(1); // audio format
        Wave.waveBuffer?.ip2(1); // num channels
        Wave.waveBuffer?.ip4(22050); // sample rate
        Wave.waveBuffer?.ip4(22050); // byte rate
        Wave.waveBuffer?.ip2(1); // block align
        Wave.waveBuffer?.ip2(8); // bits per sample
        Wave.waveBuffer?.p4(0x64617461); // "data"
        Wave.waveBuffer?.ip4(length);
        Wave.waveBuffer!.pos += length;
        return Wave.waveBuffer;
    }

    private generate(loopCount: number): number {
        let duration: number = 0;
        for (let tone: number = 0; tone < 10; tone++) {
            if (this.tones[tone] && this.tones[tone]!.toneLength + this.tones[tone]!.toneStart > duration) {
                duration = this.tones[tone]!.toneLength + this.tones[tone]!.toneStart;
            }
        }

        if (duration === 0) {
            return 0;
        }

        let sampleCount: number = ((duration * 22050) / 1000) | 0;
        let loopStart: number = ((this.waveLoopBegin * 22050) / 1000) | 0;
        let loopStop: number = ((this.waveLoopEnd * 22050) / 1000) | 0;
        if (loopStart < 0 || loopStop < 0 || loopStop > sampleCount || loopStart >= loopStop) {
            loopCount = 0;
        }

        let totalSampleCount: number = sampleCount + (loopStop - loopStart) * (loopCount - 1);
        for (let sample: number = 44; sample < totalSampleCount + 44; sample++) {
            if (Wave.waveBytes) {
                Wave.waveBytes[sample] = -128;
            }
        }

        for (let tone: number = 0; tone < 10; tone++) {
            if (this.tones[tone]) {
                const toneSampleCount: number = ((this.tones[tone]!.toneLength * 22050) / 1000) | 0;
                const start: number = ((this.tones[tone]!.toneStart * 22050) / 1000) | 0;
                const samples: Int32Array = this.tones[tone]!.generate(toneSampleCount, this.tones[tone]!.toneLength);

                for (let sample: number = 0; sample < toneSampleCount; sample++) {
                    if (Wave.waveBytes) {
                        Wave.waveBytes[sample + start + 44] += ((samples[sample] >> 8) << 24) >> 24;
                    }
                }
            }
        }

        if (loopCount > 1) {
            loopStart += 44;
            loopStop += 44;
            sampleCount += 44;
            totalSampleCount += 44;

            const endOffset: number = totalSampleCount - sampleCount;
            for (let sample: number = sampleCount - 1; sample >= loopStop; sample--) {
                if (Wave.waveBytes) {
                    Wave.waveBytes[sample + endOffset] = Wave.waveBytes[sample];
                }
            }

            for (let loop: number = 1; loop < loopCount; loop++) {
                const offset: number = (loopStop - loopStart) * loop;

                for (let sample: number = loopStart; sample < loopStop; sample++) {
                    if (Wave.waveBytes) {
                        Wave.waveBytes[sample + offset] = Wave.waveBytes[sample];
                    }
                }
            }

            totalSampleCount -= 44;
        }

        return totalSampleCount;
    }
}
