import Model from '#/graphics/Model.js';

export default class Wall {
    readonly y: number;
    readonly x: number;
    readonly z: number;
    readonly typeA: number;
    readonly typeB: number;
    modelA: Model | null;
    modelB: Model | null;
    readonly typecode: number;
    readonly info: number; // byte

    constructor(y: number, x: number, z: number, typeA: number, typeB: number, modelA: Model | null, modelB: Model | null, typecode: number, info: number) {
        this.y = y;
        this.x = x;
        this.z = z;
        this.typeA = typeA;
        this.typeB = typeB;
        this.modelA = modelA;
        this.modelB = modelB;
        this.typecode = typecode;
        this.info = info;
    }
}
