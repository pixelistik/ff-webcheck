var ipRanges = {
    /**
     * Check if an IPv4 is part of an address range
     *
     * Based on http://stackoverflow.com/a/503238/376138.
     */
    isPartOfRange: function (range, ip) {
        var IPnumber = function IPnumber(IPaddress) {
            var ip = IPaddress.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
            if(ip) {
                return (+ip[1]<<24) + (+ip[2]<<16) + (+ip[3]<<8) + (+ip[4]);
            } else {
                throw new RangeError("Not a valid IPv4 address");
            }
        }

        var IPmask = function IPmask(maskSize) {
            return -1<<(32-maskSize)
        }

        var ipNumber = IPnumber(ip);

        var rangeParts = range.split("/");

        if (
            typeof rangeParts[1] === "undefined" ||
            rangeParts[1] === ""
        ) {
            throw new RangeError("Missing IPv4 mask");
        }

        if (
            rangeParts[1] < 0 ||
            rangeParts[1] > 32
        ) {
            throw new RangeError("Invalid IPv4 mask");
        }

        var rangeNumber = IPnumber(rangeParts[0]);
        var rangeMask = IPmask(rangeParts[1]);

        var result = (ipNumber & rangeMask) === rangeNumber;
        return result;
    }
};

module.exports = ipRanges;
