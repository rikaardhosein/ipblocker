var assert = require('chai').assert;
var iphelper = require('../src/ip_helper');



describe('IP Lookup', function() {
    describe('normalize_cidrsubnet', function() {
        it('normalization of 192.168.1.134/26 should be 192.168.1.128/26.', function() {
            assert.equal('192.168.1.128/26', iphelper.normalize_cidr_subnet('192.168.1.134/26'));
        });
    });
});