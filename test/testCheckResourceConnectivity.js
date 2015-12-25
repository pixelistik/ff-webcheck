var assert = require("chai").assert;
var jsdom = require("jsdom");

var checkResourceConnectivity = require("../js/checkresourceconnectivity.js");

describe.skip("checkResourceConnectivity", function () {
    it("should export", function () {
        assert(typeof checkResourceConnectivity !== "undefined");
    });

    it("should report success on reachable URL", function (done) {
        this.timeout(5000);
        jsdom.env(
            "<p>dummy</p>",
            [],
            {
                features: {
                    FetchExternalResources: ["script"],
                    ProcessExternalResources: ["script"],
                    "MutationEvents": ["2.0"]
                }
            },
            function(err, window) {
                if (err) {
                    console.log("some error creating jsdom window");
                }
                checkResourceConnectivity("http://google.com/", function (url, success) {
                    assert.isTrue(success);
                    done();
                }, window.document);
            }
        );
    });

    it("should report failure on non-existent domain", function (done) {
        this.timeout(5000);
        jsdom.env(
            "<p>dummy</p>",
            [],
            {
                features: {
                    FetchExternalResources: ["script"],
                    ProcessExternalResources: ["script"],
                    "MutationEvents": ["2.0"]
                }
            },
            function(err, window) {
                if (err) {
                    console.log("some error creating jsdom window");
                }
                checkResourceConnectivity("http://ldkjgreifmugeroiefmoijfmd.com/", function (url, success) {
                    assert.isFalse(success);
                    done();
                }, window.document);
            }
        );
    });

    it("should report failure on unreachable URL", function (done) {
        this.timeout(5000);
        jsdom.env(
            "<p>dummy</p>",
            [],
            {
                features: {
                    FetchExternalResources: ["script"],
                    ProcessExternalResources: ["script"],
                    "MutationEvents": ["2.0"]
                }
            },
            function(err, window) {
                if (err) {
                    console.log("some error creating jsdom window");
                }
                checkResourceConnectivity("http://192.168.999.123/", function (url, success) {
                    assert.isFalse(success);
                    done();
                }, window.document);
            }
        );
    });

});
