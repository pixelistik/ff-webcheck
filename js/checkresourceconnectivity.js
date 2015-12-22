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

module.exports = checkResourceConnectivity;
