import Linkable from '#/datastruct/Linkable.js';

import Model from '#/graphics/Model.js';

export default abstract class Entity extends Linkable {
    abstract draw(loopCycle: number): Model | null;
}
