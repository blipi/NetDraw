class TypeSymbol {
    constructor (value, description) {
        this.value = value;
        this.description = description;
    }

    valueOf () {
        return this.value;
    }

    toString () {
        return this.description;
    }
}

export const VISION = new TypeSymbol(0, 'VISION');
export const LOSS = new TypeSymbol(1, 'LOSS');
export const ACTIVATION = new TypeSymbol(2, 'ACTIVATION');
export const DATA = new TypeSymbol(3, 'DATA');
export const COMMON = new TypeSymbol(4, 'COMMON');
