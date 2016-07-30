const assert = require('chai').assert;
const iphelper = require('../src/ip_helper');
const ip = require('ip');
const _ = require('lodash');

describe('IP Lookup', function() {
    describe('normalize_cidr_subnet', function() {
        it('normalization of 192.168.1.134/26 should be 192.168.1.128/26.', function() {
            assert.equal('192.168.1.128/26', iphelper.normalize_cidr_subnet('192.168.1.134/26'));
        });

        it('normalization of 192.168.32.0/20 should be 192.168.32.0/20.', function() {
            assert.equal('192.168.32.0/20', iphelper.normalize_cidr_subnet('192.168.32.0/20'));
        });

        it('normalization of 192.168.1.134/26 should NOT be 192.168.32.0/20', function() {
            assert.notEqual('192.168.32.0/20', iphelper.normalize_cidr_subnet('192.168.1.134/26'));
        });
    });

    describe('ip_to_cidr_subnets', function() {
        it('should return all the possible subnets that 192.168.1.190 could belong to', function() {
            const answer = ['192.168.1.190/31', '192.168.1.188/30', '192.168.1.184/29',
                '192.168.1.176/28', '192.168.1.160/27', '192.168.1.128/26',
                '192.168.1.128/25', '192.168.1.0/24', '192.168.0.0/23',
                '192.168.0.0/22', '192.168.0.0/21', '192.168.0.0/20',
                '192.168.0.0/19', '192.168.0.0/18', '192.168.0.0/17',
                '192.168.0.0/16', '192.168.0.0/15', '192.168.0.0/14',
                '192.168.0.0/13', '192.160.0.0/12', '192.160.0.0/11',
                '192.128.0.0/10', '192.128.0.0/9', '192.0.0.0/8',
                '192.0.0.0/7', '192.0.0.0/6', '192.0.0.0/5',
                '192.0.0.0/4', '192.0.0.0/3', '192.0.0.0/2',
                '128.0.0.0/1'
            ];

            assert.deepEqual(answer, iphelper.ip_to_cidr_subnets('192.168.1.190'));
            assert.isTrue(_.every(answer, x => ip.cidrSubnet(x).contains('192.168.1.190')));
        });
    });
});