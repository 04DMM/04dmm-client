import Linkable from '#/datastruct/Linkable.js';

export default class ObjStackEntity extends Linkable {
    readonly index: number;
    count: number;

    constructor(index: number, count: number) {
        super();
        this.index = index;
        this.count = count;
    }
}
