export class CustomSet<T = any> extends Set {
    constructor(values?: readonly T[] | null) {
        super(values);
    }

    difference(otherSet: Set<T>): CustomSet<T> {
        return new CustomSet([...this].filter((val) => !otherSet.has(val)));
    }

    intersect(otherSet: Set<T>): CustomSet<T> {
        const smallerSet = (this.size < otherSet.size) ? this : otherSet;
        const largerSet = (this.size < otherSet.size) ? otherSet : this;
        return new CustomSet([...smallerSet].filter((val) => largerSet.has(val)));
    }

    union(otherSet: Set<T>): CustomSet<T> {
        const newSet = new CustomSet();
        for (let val of this) {
            newSet.add(val);
        }
        for (let val of otherSet) {
            newSet.add(val);
        }
        return newSet;
    }

    equals(otherSet: Set<T>): boolean {
        return this.symmetricDifference(otherSet).size === 0;
    }

    /**
     * Returns the symmetric difference of two sets (all items from both sets
     * except items present in both).
     */
    symmetricDifference(otherSet: Set<T>): CustomSet<T> {
        const union = this.union(otherSet);
        const intersect = this.intersect(otherSet);
        return union.difference(intersect);
    }

    /** Returns true if two sets share no elements. */
    isDisjoint(otherSet: Set<T>): boolean {
        return this.intersect(otherSet).size === 0;
    }

    /**
     * Returns true this set is a subset of the given set (all the elements in
     * this set are in the second).
     */
    isSubset(otherSet: Set<T>): boolean {
        return this.equals(this.intersect(otherSet));
    }
}
