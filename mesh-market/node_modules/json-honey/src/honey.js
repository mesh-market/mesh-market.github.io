var _  = require("lodash"),
	__ = require("./utilities");

function scalarSorter(definition) {
	return !definition.scalar;
}

function typeSorter(definition) {
	return __.getObjectType(definition.value);
}

function parse(obj, options, runtime) {
	runtime = _.defaults(runtime || {}, {
		nullable: false,
		parents:  [],
		cache:    [obj]
	});

	return _.chain(obj)
		.reduce(function(definitions, value, key) {
			var definition, scalar, type, cache;

			// If it is not jsonable value - replace it to null in Array,
			// and omit in Object
			// @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
			if (!__.isJsonable(value)) {
				if (runtime.nullable) {
					value = null;
				} else {
					return definitions;
				}
			}

			definition = {
				key:     key,
				value:   value,
				parents: runtime.parents
			};

			if (__.isScalar(value)) {
				definition.compiled = value;
				definition.scalar   = true;
			} else {
				if (_.isFunction(value.toJSON)) {
					value = value.toJSON();
				}

				switch (type = __.getObjectType(value)) {
					case "Object":
					case "Array": {
						if (runtime.cache.indexOf(value) != -1) {
							if (options.circular) {
								definition.compiled = options.circularValue;
								definition.scalar   = true;
							} else {
								throw new Error("Converting circular structure to JSON")
							}
						} else {
							cache = runtime.cache.slice();
							cache.push(value);
							definition.definitions = parse(value, options, { nullable: type == "Array", parents: runtime.parents.concat(key), cache: cache });
							definition.scalar      = false;							
						}
						break;
					}

					case "Boolean":
					case "Number":
					case "String": {
						definition.compiled = value.valueOf();
						definition.scalar   = true;
						break;
					}

					case "Date": {
						definition.compiled = value.toISOString();
						definition.scalar   = true;
						break;
					}
				}

				definition.type = type;
			}

			definitions.push(definition);

			return definitions;
		}, [])
		.value();
}

function stringify(definitions, options, runtime) {
	var scalars, maxLen, buffer, pad, sorters, userSortBy,
		isArray, braceOpen, braceClose,
		output;

	runtime = _.defaults(runtime || {}, {
		pad: runtime.pad || options.pad
	});

	pad = runtime.pad;
	isArray = runtime.type == "Array";

	maxLen = _.chain(definitions).where({scalar: true}).reduce(function(length, definition) {
		var len;

		if ((len = definition.key.length) > length) {
			length = len;
		}

		return length;
	}, 0);

	
	if (!isArray) {
		sorters = [];

		if (options.sortScalar) {
			sorters.push(scalarSorter);
		}

		if (options.sortType) {
			sorters.push(typeSorter);
		}

		if (options.sortKey) {
			sorters.push("key")
		}
		
		if (userSortBy = options.sortBy) {
			if (!_.isArray(userSortBy)) {
				userSortBy = [userSortBy];
			}

			sorters = sorters.concat(userSortBy.map(function(sorter) {
				if (_.isFunction(sorter)) {
					return function(def) {
						return sorter.call(null, _.pick(def, ["key", "value", "parents", "scalar"]));
					}
				}

				return sorter;
			}));
		}

		sortedDefinitions = __.sortBy(definitions, sorters);
	} else {
		sortedDefinitions = definitions;
	}

	buffer = _.reduce(sortedDefinitions, function(buffer, definition, index, list) {
		var key, type, str;

		key = definition.key;

		str = __.repeat(pad);
		str+= isArray ? "" : __.toString(key) + ": ";
		str+= (definition.scalar && !isArray) ? __.repeat(maxLen - key.length) : "";
		str+= definition.scalar ? __.toString(definition.compiled) : stringify(definition.definitions, options, { pad: pad + options.pad, type: definition.type });

		buffer.push(str);

		return buffer;
	}, []);

	braceOpen  = isArray ? "[" : "{";
	braceClose = isArray ? "]" : "}";

	if (buffer.length > 0) {
		output = braceOpen + "\n" + buffer.join(",\n") + "\n" + __.repeat(pad - options.pad) + braceClose;
	} else {
		output = braceOpen + braceClose;
	}

	return output;
}

module.exports = function (obj, options) {
	var type;

	if (_.isFunction(obj.toJSON)) {
		obj = obj.toJSON();
	}

	type = __.getObjectType(obj);

	if (!_.contains(["Array", "Object"], type)) {
		return JSON.parse(obj);
	}

	options = _.defaults(options || {}, {
		pad:           2,
		sortScalar:    true,
		sortKey:       true,
		sortType:      false,
		circular:      false,
		circularValue: "[Circular]"
	});

	if (options.circular && !__.isScalar(options.circularValue)) {
		throw new Error("Only scalar value is acceptable for circular replacement");
	}

	return stringify(parse(obj, options), options, { type: type });
}