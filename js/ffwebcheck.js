"use strict";
var ko = require("knockout");
var stun = require("./stun.js");
var checkResourceConnectivity = require("./checkresourceconnectivity.js")

var FfWebcheck = function FfWebcheck() {

    var getIPs = stun.getIPs;

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

    getIPs(function (ip) {
        this.ips.push(ip);
    }.bind(this))

    this.COMMUNITY_IP_RANGES = [
        {
            name: "Test community",
            range: "37.24.185.0/24"
        }
    ];

    this.communitiesByIp = ko.pureComputed(function () {
        var ipRanges = require("./ipranges.js");
        var ip = this.publicIps()[0];

        if (typeof ip === "undefined") {
            return [];
        }

        var matchingCommunities = this.COMMUNITY_IP_RANGES.filter(function (community) {
            return ipRanges.isPartOfRange(community.range, ip);
        }.bind(this));

        if (matchingCommunities.length === 1) {
            return matchingCommunities[0];
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
};

module.exports = FfWebcheck;
