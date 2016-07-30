const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const bunyan = require('bunyan');
const uuid = require('uuid');
const os = require('os');

const conf = require('./config');
const ip_blacklist = require('./ip_blacklist');

const log = bunyan.createLogger({
    name: "ipblocker",
    uuid: uuid.v4(),
    hostname: os.hostname(),
    level: 'debug'
});

log.info({
    conf: conf
}, "Configuration");
log.info("Initializing application. Loading blocklist-ipsets...");


const blacklist = new ip_blacklist.IpBlacklist();
const blocklists_directory = conf.get('blocklist_ipsets_path');

const add_file_to_blacklist = function(filepath, blacklist) {
    let data = fs.readFileSync(filepath, {
        encoding: 'utf8'
    });
    data = data.split('\n');
    data = _.filter(data, line => line[0] !== '#');
    _.forEach(data, function(ip) {
        blacklist.add(ip, {
            source: filepath
        });
    });
};

fs.readdir(blocklists_directory, function(err, items) {

    files = _.filter(items, item => path.extname(item) === '.ipset');
    let success = 0,
        failure = 0;

    let filepath;
    _.forEach(files, function(file) {
        filepath = blocklists_directory + '/' + file;
        try {
            add_file_to_blacklist(filepath, blacklist);
        } catch (err) {
            log.error(err.message)
                ++failure;
            return
        }
        ++success;
        log.debug({
            file: filepath
        }, "Loaded blocklist-ipset file.");
    });

    log.info({
        successful: success,
        failed: failure
    }, 'Finished loading blocklist-ipsets.');

});
