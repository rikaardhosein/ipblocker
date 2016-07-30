const ip = require('ip');
const _ = require('lodash');


const normalize_cidr_subnet = function(cidr_subnet) {
    let ipaddr, subnet_mask;
    [ipaddr, subnet_mask] = cidr_subnet.split('/');
    const k = ip.toLong(ipaddr);
    const bitmask = (0xFFFFFFFF << (32 - subnet_mask)) >>> 0;
    ipaddr = ip.fromLong(k & bitmask)
    return ipaddr + '/' + subnet_mask;
}

const ip_to_cidr_subnets = function(ipaddr) {
    const k = ip.toLong(ipaddr);
    return _.map(_.range(1, 32), i => ip.fromLong((k & (0xFFFFFFFF << i)) >>> 0) + '/' + (32 - i).toString());
};


module.exports = {
    normalize_cidr_subnet,
    ip_to_cidr_subnets
};