import Packet from '#/io/Packet.js';

export default class Envelope {
    start: number = 0;
    end: number = 0;
    form: number = 0;

    private envLength: number = 0;
    private shapeDelta: Int32Array | null = null;
    private shapePeak: Int32Array | null = null;
    private envThreshold: number = 0;
    private envPosition: number = 0;
    private delta: number = 0;
    private envAmplitude: number = 0;
    private ticks: number = 0;

    read(dat: Packet): void {
        this.form = dat.g1();
        this.start = dat.g4();
        this.end = dat.g4();
        this.envLength = dat.g1();
        this.shapeDelta = new Int32Array(this.envLength);
        this.shapePeak = new Int32Array(this.envLength);

        for (let i: number = 0; i < this.envLength; i++) {
            this.shapeDelta[i] = dat.g2();
            this.shapePeak[i] = dat.g2();
        }
    }

    reset(): void {
        this.envThreshold = 0;
        this.envPosition = 0;
        this.delta = 0;
        this.envAmplitude = 0;
        this.ticks = 0;
    }

    evaluateAt(delta: number): number {
        if (this.ticks >= this.envThreshold && this.shapePeak && this.shapeDelta) {
            this.envAmplitude = this.shapePeak[this.envPosition++] << 15;

            if (this.envPosition >= this.envLength) {
                this.envPosition = this.envLength - 1;
            }

            this.envThreshold = ((this.shapeDelta[this.envPosition] / 65536.0) * delta) | 0;
            if (this.envThreshold > this.ticks) {
                this.delta = (((this.shapePeak[this.envPosition] << 15) - this.envAmplitude) / (this.envThreshold - this.ticks)) | 0;
            }
        }

        this.envAmplitude += this.delta;
        this.ticks++;
        return (this.envAmplitude - this.delta) >> 15;
    }
}
