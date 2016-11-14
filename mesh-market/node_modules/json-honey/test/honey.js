var honey  = require("../src/honey"),
	_      = require("lodash"),
	chai   = require("chai"),
	Chance = require("chance"),
	fs     = require("fs"),
	chance = new Chance(),
	expect = chai.expect,
	assert = chai.assert;

it("should return valid json", function() {
	var obj, nested, sugar, stringParsedJSON, options;

	function fill(obj) {
		var keys;

		keys = _.map(new Array(10), chance.word.bind(chance));
		values = [
			chance.string(),
			chance.floating(),
			chance.natural(),
			chance.bool(),
			new Boolean(chance.bool()),
			new String(chance.string()),
			new Number(chance.integer()),
			new Date(),
			undefined,
			_.noop
		];

		if (_.isArray(obj)) {
			_.forEach(values, function(val) {
				obj.push(val);
			});
		} else {
			_.extend(obj, _.zipObject(keys, values));
		}

		return obj;
	}

	obj = {};
	fill(obj);

	nested = obj[chance.word()] = {};	
	fill(nested);

	arr = obj[chance.word()] = [fill({})];
	fill(arr);
	arr.push(fill({}));

	options = { sortKey: false, sortScalar: false };

	expect(honey.bind(null, obj, options)).to.not.throw(Error);
	expect(JSON.parse.bind(JSON, honey(obj, options))).to.not.throw(Error);

	stringParsedJSON = JSON.parse(JSON.stringify(obj));

	expect(JSON.parse(honey(obj, options).replace(/\n/, ""))).to.deep.equal(stringParsedJSON);
});

it("should parse as expected", function() {
	var obj;

	obj = {
		"sweetest": "honey",
		"ever": true,
		"it": {
			"makes": {
				"me": [ "cry", "happy", "calm", 999, "next will null", undefined, _.noop]
			},
			"want": {
				"to": ["to", {"actions": ["try", "it", "right", "now"]}]
			}
		},
		"empty": {}
	};

	expect(honey(obj, { sortKey: false, sortScalar: false })).equal(fs.readFileSync(__dirname + "/expectation.txt").toString());
});

it("should sort by user fn", function() {
	var obj, sorted;

	obj = {
		"a": 1,
		"z": 0
	};

	sorted = honey(obj, {
		sortBy: [function(def) {
			return _.indexOf(["z", "a"], def.key);
		}],
		sortKey: false,
		sortScalar: false
	});

	expect(sorted).equal(fs.readFileSync(__dirname + "/sorted.txt").toString());
});

it("should sort by key", function() {
	var obj, sorted;

	obj = {
		"b": 1,
		"a": 1
	};

	sorted = honey(obj, {
		sortScalar: false,
		sortKey:    true
	});

	expect(sorted).equal(fs.readFileSync(__dirname + "/key-sorted.txt").toString())
});


it("should sort by scalar", function() {
	var obj, sorted;

	obj = {
		"b": 1,
		"a": {},
		"c": "hi"
	};

	sorted = honey(obj, {
		sortScalar: true,
		sortKey:    false
	});

	expect(sorted).equal(fs.readFileSync(__dirname + "/scalar-sorted.txt").toString())
});

it("should sort by type", function() {
	var obj, sorted;

	obj = {
		"s": "s",
		"b": 1,
		"q": new Boolean(false),
		"a": {},
		"c": "hi",
		"z": true
	};

	sorted = honey(obj, {
		sortScalar: false,
		sortKey:    false,
		sortType:   true
	});

	expect(sorted).equal(fs.readFileSync(__dirname + "/type-sorted.txt").toString())
});

it("should output single lined braces for emtpy iterables", function() {
	var options;

	options = { sortKey: false, sortScalar: false };

	expect(honey({}, options)).equal("{}");
	expect(honey(new Object, options)).equal("{}");
	expect(honey([], options)).equal("[]");
	expect(honey(new Array, options)).equal("[]");
});

it("should use `toJSON` method if exists", function() {
	var options, value;

	value = chance.word();

	expect(honey({ a: { toJSON: function() { return value }} }))
	 	.equal(
	 		"{\n" +
	 		"  \"a\": \"" + value + "\"\n" +
	 		"}"
 		);
});

it("should pass object with properties from the spec to the sorter", function() {
	var obj;

	obj = {
		a: {
			b: 1
		}
	};

	honey(obj, {
		sortBy: function(def) {
			expect(def).to.have.property("key");
			expect(def).to.have.property("value");
			expect(def).to.have.property("parents");
			expect(def).to.have.property("scalar");

			switch (def.key) {
				case "a": {
					expect(def.parents).to.be.empty();
					expect(def.value).to.deep.equal({b: 1});
					expect(def.scalar).to.equal(false);
					break;
				}

				case "b": {
					expect(def.parents).to.have.property('0', "a");
					expect(def.value).to.equal(1);
					expect(def.scalar).to.equal(true);
					break;
				}

				default: {
					throw new Error("Unknown key passed to the sorter");
				}
			}
		},
		sortKey: false,
		sortScalar: false
	});
});


it("should parse circular references", function() {
	var options, a, b;

	a = {};
	b = {};

	a.b = b;
	b.a = a;

	expect(honey(a, { circular: true })).equal(fs.readFileSync(__dirname + "/circular.txt").toString())
});