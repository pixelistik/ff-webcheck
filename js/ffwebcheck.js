"use strict";
var ko = require("knockout");
var stun = require("./stun.js");
var checkResourceConnectivity = require("./checkresourceconnectivity.js")

var FfWebcheck = function FfWebcheck() {
    this.ips = ko.observableArray([]);

    this.localIps = ko.pureComputed(function () {
        return this.ips().filter(function (ip) {
            return ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/);
        });
    }.bind(this));

    this.v6Ips = ko.pureComputed(function () {
        return this.ips().filter(function (ip) {
            return ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/);
        });
    }.bind(this));

    this.publicIps = ko.pureComputed(function () {
        return this.ips().filter(function (ip) {
            return !ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)
                && !ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/);
        });
    }.bind(this));

    stun.getIPs(function (ip) {
        this.ips.push(ip);
    }.bind(this))

    this.COMMUNITY_IP_RANGES = require("../data/communities/communities.json");

    this.communityFromIp = ko.pureComputed(function () {
        var ipRanges = require("./ipranges.js");
        var ips = this.localIps();

        var matchingCommunities = this.COMMUNITY_IP_RANGES.filter(function (community) {
            var matchingIps = ips.filter(function (ip) {
                return ipRanges.isPartOfRange(community.range, ip);
            });

            return matchingIps.length > 0;
        });
        if (matchingCommunities.length > 0) {
            return matchingCommunities.sort(function (a, b) {
                // "dn42" is not a real community, it should always come last
                if (a.name === "dn42") {
                    return 1;
                } else {
                    return -1;
                }
            })[0].name;
        } else {
            return null;
        }
    }.bind(this));

    var connectivityTestUrls = [
        { url: "http://google.com"},
        { url: "http://ipv6.test-ipv6.com/"},
        { url: "http://10.155.0.1/cgi-bin/status"},
    ];

    this.urlConnectivity = ko.observableArray([]);

    connectivityTestUrls.forEach(function (url) {
        checkResourceConnectivity(url.url, function (url, success) {
            this.urlConnectivity.push({
                url: url,
                success: success
            });
        }.bind(this))
    }.bind(this));

    this.v4v6ConnectivityProbes = ko.observableArray();

    this.ipv4ConnectivityOk = ko.pureComputed(function () {
        var successfulv4Probes = this.v4v6ConnectivityProbes().filter(function (probe) {
            return probe.protocol === "4";
        });

        return successfulv4Probes.length > 0;
    }.bind(this));

    this.ipv6ConnectivityOk = ko.pureComputed(function () {
        var successfulv6Probes = this.v4v6ConnectivityProbes().filter(function (probe) {
            return probe.protocol === "6";
        });

        return successfulv6Probes.length > 0;
    }.bind(this));

    if (typeof window !== "undefined") {
        window.connectivityCallback = function (data) {
            this.v4v6ConnectivityProbes.push(data);
        }.bind(this);
    }
};

module.exports = FfWebcheck;
