import Linkable from './Linkable';

export default class LinkList {
    private readonly sentinel: Linkable = new Linkable();

    // runtime
    private current: Linkable | null = null;

    constructor() {
        this.sentinel.next = this.sentinel;
        this.sentinel.prev = this.sentinel;
    }

    addTail(node: Linkable): void {
        if (node.prev) {
            node.unlink();
        }
        node.prev = this.sentinel.prev;
        node.next = this.sentinel;
        if (node.prev) {
            node.prev.next = node;
        }
        node.next.prev = node;
    }

    addHead(node: Linkable): void {
        if (node.prev) {
            node.unlink();
        }
        node.prev = this.sentinel;
        node.next = this.sentinel.next;
        node.prev.next = node;
        if (node.next) {
            node.next.prev = node;
        }
    }

    removeHead(): Linkable | null {
        const node: Linkable | null = this.sentinel.next;
        if (node === this.sentinel) {
            return null;
        }
        node?.unlink();
        return node;
    }

    head(): Linkable | null {
        const node: Linkable | null = this.sentinel.next;
        if (node === this.sentinel) {
            this.current = null;
            return null;
        }
        this.current = node?.next || null;
        return node;
    }

    tail(): Linkable | null {
        const node: Linkable | null = this.sentinel.prev;
        if (node === this.sentinel) {
            this.current = null;
            return null;
        }
        this.current = node?.prev || null;
        return node;
    }

    next(): Linkable | null {
        const node: Linkable | null = this.current;
        if (node === this.sentinel) {
            this.current = null;
            return null;
        }
        this.current = node?.next || null;
        return node;
    }

    prev(): Linkable | null {
        const node: Linkable | null = this.current;
        if (node === this.sentinel) {
            this.current = null;
            return null;
        }
        this.current = node?.prev || null;
        return node;
    }

    clear(): void {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const node: Linkable | null = this.sentinel.next;
            if (node === this.sentinel) {
                return;
            }
            node?.unlink();
        }
    }
}
