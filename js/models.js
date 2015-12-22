"use strict";
var ko = require("knockout");

var FfWebcheck = function FfWebcheck() {

    /**
     * https://diafygi.github.io/webrtc-ips/
     */
    var getIPs = function getIPs(callback){
        var ip_dups = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection
            || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        //bypass naive webrtc blocking using an iframe
        if(!RTCPeerConnection){
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{RtpDataChannels: true}]
        };

        var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate){
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            var ip_addr = ip_regex.exec(candidate)[1];

            //remove duplicates
            if(ip_dups[ip_addr] === undefined)
                callback(ip_addr);

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice){

            //skip non-candidate events
            if(ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result){

            //trigger the stun server request
            pc.setLocalDescription(result, function(){}, function(){});

        }, function(){});

        //wait for a while to let everything done
        setTimeout(function(){
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }

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
