var rewire = require("rewire");
var assert = require("chai").assert;
var FfWebcheck = rewire("../js/ffwebcheck.js");

FfWebcheck.__set__("stun", {
    getIPs: function (callback) {
        callback("0.0.0.0");
    }
});

FfWebcheck.__set__("checkResourceConnectivity", function (url, callback) {
    callback(false);
});

var ffWebcheck;

describe("FfWebcheck", function () {
    beforeEach(function () {
        ffWebcheck = new FfWebcheck();
    });

    it("should instantiate", function () {
        assert(typeof ffWebcheck !== "undefined");
    })
})
