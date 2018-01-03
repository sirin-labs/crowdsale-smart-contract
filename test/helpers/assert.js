let around = (a, b, diff) => {
    let abs = Math.abs(a - b);
    if (abs > diff) {
        throw new Error(`Assertion failed: ${a} is not ${diff} around ${b}`);
    }
};

export default { around };
