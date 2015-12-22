"use strict";
var ko = require("knockout");

var FfWebcheck = function FfWebcheck() {

    var getIPs = require("./stun.js").getIPs;

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

    this.communitiesByIp = ko.pureComputed(function () {
        var ipRanges = require("./ipranges.js");
    });

    /**
     * http://stackoverflow.com/a/7609202/376138
     */
    var checkResourceConnectivity = function checkResourceConnectivity(url, callback) {
        var tag = document.createElement('script');
        tag.src = url;
        //tag.type = 'application/x-unknown';
        tag.async = true;
        tag.onload = function (e) {
            document.getElementsByTagName('head')[0].removeChild(tag);
            callback(url, true);
        };
        tag.onerror = function (e) {
            document.getElementsByTagName('head')[0].removeChild(tag);
            callback(url, false);
        };
        document.getElementsByTagName('head')[0].appendChild(tag);
    }

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
