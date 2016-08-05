const assert = require('chai').assert;
const ip = require('ip');
const iphelper = require('../src/ip_helper');
const ip_blacklist = require('../src/ip_blacklist');
const _ = require('lodash');

describe('IP Blacklist', function() {

    describe('#add', function() {


    });

    describe('#get', function() {

        it('blacklist should contain the ip address 127.0.0.1 and return metadata', function() {
            const blacklist = new ip_blacklist.IpBlacklist();
            const entry = '127.0.0.1';
            const metadata = {
                source: "test_source"
            };

            let result = blacklist.get(entry)
            assert.isNull(result);

            blacklist.add(entry, metadata)

            result = blacklist.get(entry)
            assert.isNotNull(result)
            assert.deepEqual(metadata, result);

        });

        it('blacklist should block the entire range 192.168.1.128/26 {from 192.168.1.128 to 192.168.1.191}', function() {
            const blacklist = new ip_blacklist.IpBlacklist();
            const entry = '192.168.1.128/26';
            const metadata = {};
            const start = 128,
                end = 191,
                prefix = '192.168.1.';

            let result = _.every(_.range(start, end + 1), x => blacklist.get(prefix + x.toString()) === null);

            blacklist.add(entry, metadata);

            result = _.every(_.range(start, end + 1), x => blacklist.get(prefix + x.toString()) !== null);
            assert.isTrue(result);
        });

        it('blacklist should block the same range as 192.168.1.128/26. 192.168.1.134/26 should be normalized', function() {
            const blacklist = new ip_blacklist.IpBlacklist();
            const entry = '192.168.1.134/26';
            const metadata = {};
            const start = 128,
                end = 191,
                prefix = '192.168.1.';

            let result = _.every(_.range(start, end + 1), x => blacklist.get(prefix + x.toString()) === null);

            blacklist.add(entry, metadata);

            result = _.every(_.range(start, end + 1), x => blacklist.get(prefix + x.toString()) !== null);
            assert.isTrue(result)
        });
    });



});
