import Packet from '#/io/Packet.js';

import Envelope from '#/sound/Envelope.js';

export default class Tone {
    static toneSrc: Int32Array | null = null;
    static noise: Int32Array | null = null;
    static sin: Int32Array | null = null;

    static tmpPhases: Int32Array = new Int32Array(5);
    static tmpDelays: Int32Array = new Int32Array(5);
    static tmpVolumes: Int32Array = new Int32Array(5);
    static tmpSemitones: Int32Array = new Int32Array(5);
    static tmpStarts: Int32Array = new Int32Array(5);

    frequencyBase: Envelope | null = null;
    amplitudeBase: Envelope | null = null;
    frequencyModRate: Envelope | null = null;
    frequencyModRange: Envelope | null = null;
    amplitudeModRate: Envelope | null = null;
    amplitudeModRange: Envelope | null = null;
    envRelease: Envelope | null = null;
    envAttack: Envelope | null = null;

    harmonicVolume: Int32Array = new Int32Array(5);
    harmonicSemitone: Int32Array = new Int32Array(5);
    harmonicDelay: Int32Array = new Int32Array(5);

    toneStart: number = 0;
    toneLength: number = 500;
    reverbVolume: number = 100;
    reverbDelay: number = 0;

    static init(): void {
        this.noise = new Int32Array(32768);
        for (let i: number = 0; i < 32768; i++) {
            if (Math.random() > 0.5) {
                this.noise[i] = 1;
            } else {
                this.noise[i] = -1;
            }
        }

        this.sin = new Int32Array(32768);
        for (let i: number = 0; i < 32768; i++) {
            this.sin[i] = (Math.sin(i / 5215.1903) * 16384.0) | 0;
        }

        this.toneSrc = new Int32Array(220500); // 10s * 22050 KHz
    }

    generate(sampleCount: number, length: number): Int32Array {
        for (let sample: number = 0; sample < sampleCount; sample++) {
            Tone.toneSrc![sample] = 0;
        }

        if (length < 10) {
            return Tone.toneSrc!;
        }

        const samplesPerStep: number = (sampleCount / length) | 0;

        this.frequencyBase?.reset();
        this.amplitudeBase?.reset();

        let frequencyStart: number = 0;
        let frequencyDuration: number = 0;
        let frequencyPhase: number = 0;

        if (this.frequencyModRate && this.frequencyModRange) {
            this.frequencyModRate.reset();
            this.frequencyModRange.reset();
            frequencyStart = (((this.frequencyModRate.end - this.frequencyModRate.start) * 32.768) / samplesPerStep) | 0;
            frequencyDuration = ((this.frequencyModRate.start * 32.768) / samplesPerStep) | 0;
        }

        let amplitudeStart: number = 0;
        let amplitudeDuration: number = 0;
        let amplitudePhase: number = 0;
        if (this.amplitudeModRate && this.amplitudeModRange) {
            this.amplitudeModRate.reset();
            this.amplitudeModRange.reset();
            amplitudeStart = (((this.amplitudeModRate.end - this.amplitudeModRate.start) * 32.768) / samplesPerStep) | 0;
            amplitudeDuration = ((this.amplitudeModRate.start * 32.768) / samplesPerStep) | 0;
        }

        for (let harmonic: number = 0; harmonic < 5; harmonic++) {
            if (this.frequencyBase && this.harmonicVolume[harmonic] !== 0) {
                Tone.tmpPhases[harmonic] = 0;
                Tone.tmpDelays[harmonic] = this.harmonicDelay[harmonic] * samplesPerStep;
                Tone.tmpVolumes[harmonic] = ((this.harmonicVolume[harmonic] << 14) / 100) | 0;
                Tone.tmpSemitones[harmonic] = (((this.frequencyBase.end - this.frequencyBase.start) * 32.768 * Math.pow(1.0057929410678534, this.harmonicSemitone[harmonic])) / samplesPerStep) | 0;
                Tone.tmpStarts[harmonic] = ((this.frequencyBase.start * 32.768) / samplesPerStep) | 0;
            }
        }

        if (this.frequencyBase && this.amplitudeBase) {
            for (let sample: number = 0; sample < sampleCount; sample++) {
                let frequency: number = this.frequencyBase.evaluateAt(sampleCount);
                let amplitude: number = this.amplitudeBase.evaluateAt(sampleCount);

                if (this.frequencyModRate && this.frequencyModRange) {
                    const rate: number = this.frequencyModRate.evaluateAt(sampleCount);
                    const range: number = this.frequencyModRange.evaluateAt(sampleCount);
                    frequency += this.generate2(range, frequencyPhase, this.frequencyModRate.form) >> 1;
                    frequencyPhase += ((rate * frequencyStart) >> 16) + frequencyDuration;
                }

                if (this.amplitudeModRate && this.amplitudeModRange) {
                    const rate: number = this.amplitudeModRate.evaluateAt(sampleCount);
                    const range: number = this.amplitudeModRange.evaluateAt(sampleCount);
                    amplitude = (amplitude * ((this.generate2(range, amplitudePhase, this.amplitudeModRate.form) >> 1) + 32768)) >> 15;
                    amplitudePhase += ((rate * amplitudeStart) >> 16) + amplitudeDuration;
                }

                for (let harmonic: number = 0; harmonic < 5; harmonic++) {
                    if (this.harmonicVolume[harmonic] !== 0) {
                        const position: number = sample + Tone.tmpDelays[harmonic];

                        if (position < sampleCount) {
                            Tone.toneSrc![position] += this.generate2((amplitude * Tone.tmpVolumes[harmonic]) >> 15, Tone.tmpPhases[harmonic], this.frequencyBase.form);
                            Tone.tmpPhases[harmonic] += ((frequency * Tone.tmpSemitones[harmonic]) >> 16) + Tone.tmpStarts[harmonic];
                        }
                    }
                }
            }
        }

        if (this.envRelease && this.envAttack) {
            this.envRelease.reset();
            this.envAttack.reset();

            let counter: number = 0;
            let muted: boolean = true;

            for (let sample: number = 0; sample < sampleCount; sample++) {
                const releaseValue: number = this.envRelease.evaluateAt(sampleCount);
                const attackValue: number = this.envAttack.evaluateAt(sampleCount);

                let threshold: number;
                if (muted) {
                    threshold = this.envRelease.start + (((this.envRelease.end - this.envRelease.start) * releaseValue) >> 8);
                } else {
                    threshold = this.envRelease.start + (((this.envRelease.end - this.envRelease.start) * attackValue) >> 8);
                }

                counter += 256;
                if (counter >= threshold) {
                    counter = 0;
                    muted = !muted;
                }

                if (muted) {
                    Tone.toneSrc![sample] = 0;
                }
            }
        }

        if (this.reverbDelay > 0 && this.reverbVolume > 0) {
            const start: number = this.reverbDelay * samplesPerStep;

            for (let sample: number = start; sample < sampleCount; sample++) {
                Tone.toneSrc![sample] += ((Tone.toneSrc![sample - start] * this.reverbVolume) / 100) | 0;
                Tone.toneSrc![sample] |= 0;
            }
        }

        for (let sample: number = 0; sample < sampleCount; sample++) {
            if (Tone.toneSrc![sample] < -32768) {
                Tone.toneSrc![sample] = -32768;
            }

            if (Tone.toneSrc![sample] > 32767) {
                Tone.toneSrc![sample] = 32767;
            }
        }

        return Tone.toneSrc!;
    }

    generate2(amplitude: number, phase: number, form: number): number {
        if (form === 1) {
            return (phase & 0x7fff) < 16384 ? amplitude : -amplitude;
        } else if (form === 2) {
            return (Tone.sin![phase & 0x7fff] * amplitude) >> 14;
        } else if (form === 3) {
            return (((phase & 0x7fff) * amplitude) >> 14) - amplitude;
        } else if (form === 4) {
            return Tone.noise![((phase / 2607) | 0) & 0x7fff] * amplitude;
        } else {
            return 0;
        }
    }

    read(dat: Packet): void {
        this.frequencyBase = new Envelope();
        this.frequencyBase.read(dat);

        this.amplitudeBase = new Envelope();
        this.amplitudeBase.read(dat);

        if (dat.g1() !== 0) {
            dat.pos--;

            this.frequencyModRate = new Envelope();
            this.frequencyModRate.read(dat);

            this.frequencyModRange = new Envelope();
            this.frequencyModRange.read(dat);
        }

        if (dat.g1() !== 0) {
            dat.pos--;

            this.amplitudeModRate = new Envelope();
            this.amplitudeModRate.read(dat);

            this.amplitudeModRange = new Envelope();
            this.amplitudeModRange.read(dat);
        }

        if (dat.g1() !== 0) {
            dat.pos--;

            this.envRelease = new Envelope();
            this.envRelease.read(dat);

            this.envAttack = new Envelope();
            this.envAttack.read(dat);
        }

        for (let harmonic: number = 0; harmonic < 10; harmonic++) {
            const volume: number = dat.gsmarts();
            if (volume === 0) {
                break;
            }

            this.harmonicVolume[harmonic] = volume;
            this.harmonicSemitone[harmonic] = dat.gsmart();
            this.harmonicDelay[harmonic] = dat.gsmarts();
        }

        this.reverbDelay = dat.gsmarts();
        this.reverbVolume = dat.gsmarts();
        this.toneLength = dat.g2();
        this.toneStart = dat.g2();
    }
}
