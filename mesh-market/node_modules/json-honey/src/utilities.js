var _ = require("lodash");

function isScalar(obj) {
	return _.contains(["number", "string", "boolean"], typeof obj) || obj === null;
}

function isJsonable(obj) {
	return !_.contains(["undefined", "function"], typeof obj) && getObjectType(obj) !== "Symbol";
}

function getObjectType(obj) {
	return Object.prototype.toString.call(obj).match(/\[object ([a-zA-Z]+)\]/)[1];
}

function toString(obj) {
	return JSON.stringify(obj);
}

// fastest variant of repeat
// http://stackoverflow.com/a/5450113/1473140
function repeat(count, pattern) {
	pattern = pattern || " ";
    if (count < 1) return '';
    var result = '';
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result;
}

// tuned `sortBy` from `lodash` to accept functions in sorters
// @see https://github.com/lodash/lodash/pull/504
function sortBy(collection, sorters) {
	return _.chain(collection)
		.map(function(value, index) {
			return {
				criteria: _.map(sorters, function(sorter) {
					if (_.isFunction(sorter)) {
						return sorter.call(null, value, index, collection);
					}

					if (_.isString(sorter)) {
						return value[sorter];
					}
				}),
				index: index,
				value: value
			};
		})
		.sort(function(a, b) {
			var aCriteria, bCriteria, index, length,
				value, other;

			aCriteria = a.criteria;
			bCriteria = b.criteria;

			index = -1;
			length = aCriteria.length;

			while(++index < length) {
				value = aCriteria[index];
				other = bCriteria[index];

				if (value !== other) {
					if (value > other || typeof value == 'undefined') {
						return 1;
					}
					if (value < other || typeof other == 'undefined') {
						return -1;
					}
				}
			}

			return a.index - b.index;
		})
		.map(function(obj) {
			return obj.value;
		})
		.value();
}

module.exports = {
	isScalar:      isScalar,
	isJsonable:    isJsonable,
	getObjectType: getObjectType,
	toString:      toString,
	sortBy:        sortBy,
	repeat:        repeat
};
