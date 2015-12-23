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

    describe("Domain detection by IP address", function () {
        var TEST_COMMUNITY_IP_RANGES = [
            {
                name: "One",
                range: "123.456.789.0/24"
            },
            {
                name: "Two",
                range: "456.123.987.0/24"
            }
        ];

        it("should identify community One", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["123.456.789.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[0]);
        });

        it("should identify community Two", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["456.123.987.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[1]);
        });

        it("should return null if no domain identified", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["999.999.999.999"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });

        it("should identify community One by the second public IP", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["999.999.999.999", "123.456.789.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[0]);
        });

        it("should return null if no IP addresses are known", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips([]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });

        it("should return null if no public IP addresses are known", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["192.168.1.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });
    });
})
