var assert = require("chai").assert;
var ipRanges = require("../js/ipranges.js");

describe("IP Ranges", function () {
    it("should instantiate", function () {
        assert(typeof ipRanges !== "undefined");
    });

    describe("Test if part of range", function () {
        it("should have a function", function () {
            assert(typeof ipRanges.isPartOfRange === "function");
        });

        it("should correctly identify one single IP as part of the range", function () {
            var range = "192.168.123.456/32";
            var ip = "192.168.123.456";

            var result = ipRanges.isPartOfRange(range, ip);
            assert.isTrue(result);
        });

        it("should correctly identify one single IP as NOT part of the range", function () {
            var range = "192.168.123.456/32";
            var ip = "192.168.999.999";

            var result = ipRanges.isPartOfRange(range, ip);
            assert.isFalse(result);
        });

        it("should correctly identify an IP as part of the range", function () {
            var range = "192.168.123.000/24";
            var ip = "192.168.123.001";

            var result = ipRanges.isPartOfRange(range, ip);
            assert.isTrue(result);
        });

        it("should correctly identify an IP as NOT part of the range", function () {
            var range = "192.168.123.000/24";
            var ip = "192.168.124.001";

            var result = ipRanges.isPartOfRange(range, ip);
            assert.isFalse(result);
        });
    });
    
    describe("Input validation", function () {
        it("should throw an error on invalid IPv4 address", function () {
            var range = "192.168.123.000/24";
            var ip = "999999999";

            assert.throws(function () {
                ipRanges.isPartOfRange(range, ip);
            }, RangeError);
        });

        it("should throw an error on invalid IPv4 range", function () {
            var range = "99999999/24";
            var ip = "192.168.124.001";

            assert.throws(function () {
                ipRanges.isPartOfRange(range, ip);
            }, RangeError);
        });

        it("should throw an error on invalid IPv4 mask", function () {
            var range = "192.168.123.000/99";
            var ip = "192.168.124.001";

            assert.throws(function () {
                ipRanges.isPartOfRange(range, ip);
            }, RangeError);
        });

        it("should throw an error on missing IPv4 mask", function () {
            var range = "192.168.123.000";
            var ip = "192.168.124.001";

            assert.throws(function () {
                ipRanges.isPartOfRange(range, ip);
            }, RangeError);
        });

        it("should throw an error on empty IPv4 mask", function () {
            var range = "192.168.123.000/";
            var ip = "192.168.124.001";

            assert.throws(function () {
                ipRanges.isPartOfRange(range, ip);
            }, RangeError);
        });
    });
});
