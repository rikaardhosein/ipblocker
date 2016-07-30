const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const bunyan = require('bunyan');
const uuid = require('uuid');
const os = require('os');
const hapi = require('hapi');

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



const server = new hapi.Server();
const host = conf.get('blocklist_bind_addr');
const port = conf.get('blocklist_bind_port');
server.connection({
    host: host,
    port: port
});


server.route({
    method: 'GET',
    path: '/allowed/{ipaddress}',
    handler: function(request, reply) {
        //TODO: add validation here
        //TODO: log how long it took to complete request
        //TODO: check what response format is supposed to be.
        let response;
        const result = blacklist.get(request.params.ipaddress);
        if (result === null) {
            response = "ALLOWED";
        } else {
            response = "DENIED: " + JSON.stringify(result);
        }
        return reply(response);
    }
});


server.start((err) => {
    if (err) {
        log.error(err.message);
        throw err;
    }

    log.info({
        host: host,
        port: port
    }, 'Server running.');
});
