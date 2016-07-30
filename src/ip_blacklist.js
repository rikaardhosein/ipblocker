const ip_helper = require('./ip_helper');

class IpBlacklist {
    constructor() {
        this.map = {};
    };

    add(ip, metadata) {
        if (ip.indexOf('/') !== -1) {
            ip = ip_helper.normalize_cidr_subnet(ip);
        }
        this.map[ip] = metadata;
    };

    get(ip) {
        if (ip in this.map) {
            return this.map[ip];
        }
        const subnets = ip_helper.ip_to_cidr_subnets(ip)
        let subnet;
        for (var i = 0; i < subnets.length; i++) {
            subnet = subnets[i];
            if (subnet in this.map) {
                return this.map[subnet];
            }
        }
        return null;
    }
};

module.exports = {
    IpBlacklist
};