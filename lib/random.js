const between = (min, max) => Math.random() * (max - min) + min;
module.exports.between = between;


const integer = (min, max) => (between(min, max) | 0);
module.exports.integer = integer;


const element = items => items[integer(0, items.length)];
module.exports.element = element;
