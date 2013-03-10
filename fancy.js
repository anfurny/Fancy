//throw "";
/**
 * benefits:
 * - Like underscore .chain method, but returns a more usable one-off.
 * - integrates oliver steele's functional
 * - assumes identity for filter
 * - The combination of the two libraries. So suppose I want to take an object, and return a sorted representation of its values.
 *  sure, .pairs helps, but there is no effective way to plug in pluck and sortBy, thus requiring a .pairs.sort(function (a,b) { return (a[1] < b[1])*2-1; }) //remember we can sort alphabetical things
 *  By connecting the two libraries we can get the grace we sought: .pairs.sortBy("x[1]")
 *
 * -- Will move hasAll to my library
 * -- Will arr.collapseToObj(reducer)
 *
 * @param input
 * @return {*}
 * @constructor
 */
var profileAlot = function(cb){
    var x = new Date().getTime();
    for (var y=0; y < 10000; y++)
        cb();
    return (new Date().getTime() - x)/ 1000;
}

var compatibility_mode = false; //uses native arrays, to enable things like [1,2,3].concat(FA([1,4,5])). Discouraged, because it introduces an inconsistency with IE.
var compatibility_mode_for_ie = compatibility_mode && false; //Discouraged, because it disallows writing over native prototype functions

if (typeof _ === "undefined") {
    throw "This Library Requires Underscore.js";
}

var FancyObject = FO = function(input) {
    if (! (this instanceof FancyObject))
        return new FancyObject(input);
    return this.setThisTo(input, this);
};
FancyObject.prototype = new Object;

/**
 * Shallow
 * @param obj
 */
FancyObject.prototype.setThisTo = function(obj) {
    var i;
    for (i in this) {
        if (this.hasOwnProperty(i))
            delete this[i];
    }
    for (i in obj) {
        if (obj.hasOwnProperty(i))
            this[i] = obj[i];
    }
    return this;
};

var AlexLibrary = {};
AlexLibrary.filterObj = AlexLibrary.selectObj = function(obj, callback) {
    return obj.pairs().filter(function(a) { return callback(a[1]); }).object();
};

AlexLibrary.rejectObj = function(obj, callback) {
    return obj.pairs().reject(function(a) { return callback(a[1]); }).object();
};

AlexLibrary.toTrueArray = function(arrayEsque) {
    return Array.prototype.constructor.apply(new Array, arrayEsque);
};

AlexLibrary.sameContents = function(arrMe, arrayEsque) {
    return (arrMe.countBy().meld(FancyArray(arrayEsque).countBy(), "-").filter().length == 0); //beautiful
};

AlexLibrary.concat = function(me, i) {
    var tmp = new FA(me); tmp.push.apply(tmp, i);
    return tmp;
}; //since native seems to break

/**
 * combines two objects using a reducer for duplicates
 * @param targetObj
 * @param reducer
 */
AlexLibrary.meld = function(me, targetObj, reducer) {
    var result = new FancyObject({});
    me.keys().union(FO(targetObj).keys()).map(function(keyName){
        if (me.hasOwnProperty(keyName) && targetObj.hasOwnProperty(keyName))
            result[keyName] = reducer(me[keyName], targetObj[keyName]);
        else
            result[keyName] = me[keyName] || targetObj[keyName];
    });
    return result;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var FancyArray = FA = function(/*Array*/ input) {
    if (! input )
        input = [];
    if (! (this instanceof FancyArray)) {
        if (input instanceof FancyArray)
            return input;
        return new FancyArray(input);
    }
    //perhaps put logic here checking constructor, error checking
    this.setThisTo(input);

    if (compatibility_mode) {
        var result = AlexLibrary.toTrueArray(input);
        if (typeof result.__proto__ == "object") {
            if (!compatibility_mode_for_ie)
                return this;
            result.__proto__ = this.__proto__;
        } else {
            var x;
            for (x in FancyArray.prototype) {
                if (!result[x])
                    result[x] = FancyArray.prototype[x];
            }
        }

        return result;
    }
    return this;
};
FancyArray.prototype = new Array; //should go right here.

/**
 * Since we can't directly assign to this
 * @param arr
 */
FancyArray.prototype.setThisTo = function(arr, thiss) {
    var args = [0, this.length].concat(FancyArray.makeArray(arr));
    this.splice.apply(this, args );
    return this;
};

FancyArray.range = function () { return FancyArray(_.range.apply(_, arguments)); };
FancyArray.make = function (i) { return new FancyArray(i); };
FancyArray.makeArray = function(i) { return Array.prototype.slice.call(i, 0); };

//var polyfillColl = ["each", "map", "reduce", "reduceRight", "find", "filter", "where", "findWhere", "reject", "every", "some", "contains", "invoke", "pluck", "max", "min", "sortBy", "groupBy", "countBy", "shuffle", "toArray", "size"];
var polyfillColl = [{"name":"each", iterator: 1},{"name":"map", iterator:1},{"name":"reduce", iterator: 1},{"name":"reduceRight", iterator: 1},{"name":"find", iterator:1},{"name":"filter", iterator: 1, assumeIdentity: true},
    {"name":"where"},{"name":"findWhere"},{"name":"reject", iterator:1},{"name":"every", iterator: 1},{"name":"some", iterator: 1},
    {"name":"contains"},{"name":"invoke"},{"name":"pluck"},{"name":"max", iterator:1},{"name":"min", iterator:1},
    {"name":"sortBy", iterator:1},{"name":"groupBy", iterator: 1},{"name":"countBy", iterator: 1},{"name":"shuffle"},{"name":"toArray"},{"name":"size"}];

var polyfillArr = [{"name":"first"},{"name":"initial"},{"name":"last"},{"name":"rest"},{"name":"compact"},
    {"name":"flatten"},{"name":"without"},{"name":"union"},{"name":"intersection"},{"name":"difference"},
    {"name":"uniq", iterator: 2},{"name":"zip"},{"name":"object"},{"name":"indexOf"},{"name":"lastIndexOf"},{"name":"sortedIndex", iterator:2},{"name":"range"}];

var polyfillObj = [{"name":"keys"},{"name":"values"},{"name":"pairs"},{"name":"invert"},{"name":"functions"},
    {"name":"extend"},{"name":"pick"},{"name":"omit"},{"name":"defaults"},{"name":"clone"},{"name":"tap"},{"name":"has"},
    {"name":"isEqual"},{"name":"isEmpty"},{"name":"isElement"},{"name":"isArray"},{"name":"isObject"},{"name":"isArguments"},
    {"name":"isFunction"},{"name":"isString"},{"name":"isNumber"},{"name":"isFinite"},{"name":"isBoolean"},{"name":"isDate"},
    {"name":"isRegExp"},{"name":"isNaN"},{"name":"isNull"},{"name":"isUndefined"}];

var alexLibObj = [{"name": "filterObj", iterator: 1}, {name: "selectObj", iterator: 1}, {name: "rejectObj", iterator: 1}, {name: "meld", iterator: 2}];
var alexLibArr = [ {name: "toTrueArray"}, {name: "sameContents"}];

if (!compatibility_mode)
    alexLibArr.push({name: "concat"}); //without compatibility mode, the native version doesn't work

var x, polyfill = polyfillColl.concat(polyfillArr);

function fillInWith(target, polyfill, otherLibrary) {
    var x;
    for (x in polyfill) {
        if (polyfill.hasOwnProperty(x)) {
            var func = polyfill[x];
            //if (! target.prototype[func.name])
            //overwrite the native prototype, cuz ours is better!
            target.prototype[func.name] = (function(funcSig) {
                return function() {
                    var params = [this].concat(FancyArray.makeArray(arguments));
                    var result;
                    var replacer = funcSig.hasOwnProperty('iterator') && (funcSig.iterator-1);
                    if ((replacer !== false) && (typeof Functional != "undefined") && arguments.hasOwnProperty(replacer) && (typeof arguments[replacer] == "string") ){
                        params[replacer+1] = Functional.lambda(arguments[replacer]);
                    }
                    if (!arguments.length && funcSig.assumeIdentity)
                        params.push(_.identity);

                    result = otherLibrary[funcSig.name].apply(otherLibrary, params);

                    if (result.constructor.toString().indexOf(" Array()")>=0 ) //returned an array
                        return new FancyArray(result);
                    if (result.constructor.toString().indexOf(" Object()")>=0 ) //returned an object
                        return new FancyObject(result);
                    return result;
                };
            })(func);
        }
    }
}
fillInWith(FancyArray, polyfill, _);
fillInWith(FancyObject, polyfillColl.concat(polyfillObj), _);
fillInWith(FancyObject, alexLibObj, AlexLibrary);
fillInWith(FancyArray, alexLibArr, AlexLibrary);