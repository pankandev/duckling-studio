export class HashedArray<T, Hash> {
    private readonly items: Array<T>;
    private readonly hashSet: Set<Hash>;

    get array(): T[] {
        return this.items;
    }

    constructor(
        private readonly extractId: (a: T) => Hash,
        items?: T[],
    ) {
        items ??= [];
        this.items = [...items];
        this.hashSet = new Set();
        for (const item of items) {
            this.items.push(item);
        }
    }

    contains(hash: Hash): boolean {
        return this.hashSet.has(hash);
    }

    [Symbol.iterator]() {
        return this.items[Symbol.iterator]();
    }

    push(item: T) {
        this.items.push(item);
        this.hashSet.add(this.extractId(item));
    }
}