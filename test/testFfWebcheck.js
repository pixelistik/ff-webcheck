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

    describe("IP address categorisation", function () {
        it("should identify a local IPv4 from any of the 3 existing blocks", function () {
            // https://en.wikipedia.org/wiki/IPv4#Private_networks
            ffWebcheck.ips([
                "10.1.2.3",
                "172.30.30.30",
                "192.168.1.2"
            ]);

            assert.include(ffWebcheck.localIps(), "10.1.2.3");
            assert.include(ffWebcheck.localIps(), "172.30.30.30");
            assert.include(ffWebcheck.localIps(), "192.168.1.2");
        });

        it("should identify a public IPv4 address", function () {
            ffWebcheck.ips([
                "192.168.1.2",
                "20.30.40.50"
            ]);

            assert.include(ffWebcheck.publicIps(), "20.30.40.50");
            assert.notInclude(ffWebcheck.publicIps(), "192.168.1.2");
        });

        it("should identify an IPv6 address", function () {
            ffWebcheck.ips([
                "20.30.40.50",
                "2001:0db8:0000:0000:0000:ff00:0042:8329"
            ]);

            assert.include(ffWebcheck.v6Ips(), "2001:0db8:0000:0000:0000:ff00:0042:8329");
            assert.notInclude(ffWebcheck.v6Ips(), "20.30.40.50");
        })
    })

    describe("Domain detection by IP address", function () {
        var TEST_COMMUNITY_IP_RANGES = [
            {
                name: "One",
                range: "10.456.789.0/24"
            },
            {
                name: "Two",
                range: "10.123.987.0/24"
            }
        ];

        it("should identify community One", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["10.456.789.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[0].name);
        });

        it("should identify community Two", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["10.123.987.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[1].name);
        });

        it("should return null if no domain identified", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["999.999.999.999"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });

        it("should identify community One by the second IP", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["999.999.999.999", "10.456.789.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, TEST_COMMUNITY_IP_RANGES[0].name);
        });

        it("should return null if no IP addresses are known", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips([]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });

        it("should return null if no local IP addresses are known", function () {
            ffWebcheck.COMMUNITY_IP_RANGES = TEST_COMMUNITY_IP_RANGES;
            ffWebcheck.ips(["200.168.1.1"]);
            var result = ffWebcheck.communityFromIp();

            assert.strictEqual(result, null);
        });

        describe("special handling of dn42 net", function () {
            it("should return the 'real' community when first in the list", function () {
                ffWebcheck.COMMUNITY_IP_RANGES = [
                    {
                        name: "One",
                        range: "10.456.789.0/24"
                    },
                    {
                        name: "dn42",
                        range: "172.16.0.0/14"
                    }
                ];

                ffWebcheck.ips(["10.456.789.1", "172.16.0.1"]);
                var result = ffWebcheck.communityFromIp();

                assert.strictEqual(result, "One");
            });

            it("should return the 'real' community when second in the list", function () {
                ffWebcheck.COMMUNITY_IP_RANGES = [
                    {
                        name: "dn42",
                        range: "172.16.0.0/14"
                    },
                    {
                        name: "One",
                        range: "10.456.789.0/24"
                    }
                ];

                ffWebcheck.ips(["10.456.789.1", "172.16.0.1"]);
                var result = ffWebcheck.communityFromIp();

                assert.strictEqual(result, "One");
            });

            it("should return dn42 as community when it's the only match", function () {
                ffWebcheck.COMMUNITY_IP_RANGES = [
                    {
                        name: "dn42",
                        range: "172.16.0.0/14"
                    },
                    {
                        name: "One",
                        range: "99.99.789.0/24"
                    }
                ];

                ffWebcheck.ips(["10.456.789.1", "172.16.0.1"]);
                var result = ffWebcheck.communityFromIp();

                assert.strictEqual(result, "dn42");
            });
        });
    });
})
