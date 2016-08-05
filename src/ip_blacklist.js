const ip_helper = require('./ip_helper');
const iptrie = require('iptrie');

class IpBlacklist {
    constructor() {
				this.blacklist = new iptrie.IPTrie();
        this.map = {};
    };

    add(ip, metadata) {
			const parts = ip.split('/');
			ip = parts[0];	
			let mask = 32;

			if(parts.length == 2) {
				mask = parseInt(parts[1])
			}
			this.blacklist.add(ip, mask, metadata);
    };

    get(ip) {
			let res = this.blacklist.find(ip);
			if (res == null){
				res = null;	
			}	
			return res;
		}
};

module.exports = {
    IpBlacklist
};
