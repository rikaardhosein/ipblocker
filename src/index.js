const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const bunyan = require('bunyan');
const uuid = require('uuid');
const os = require('os');
const url = require('url');
const http = require('http');
const git = require('nodegit');
const byline = require('byline');

const conf = require('./config');
const ip_blacklist = require('./ip_blacklist');
const RepositoryMonitor = require('./repository_monitor');
const RepositoryUpdater = require('./repository_updater');

const log = bunyan.createLogger({
    name: 'ipblocker',
    uuid: uuid.v4(),
    hostname: os.hostname(),
    level: 'info',
    src: true
});

log.info({
    conf: conf.toString()
}, 'Configuration');
log.info('Initializing application. Loading blocklist-ipsets...');

const blocklists_directory = conf.get('blocklist_ipsets_path');
const blocklist_git_repo = conf.get('blocklist_git_repo');
const host = conf.get('blocklist_bind_addr');
const port = conf.get('blocklist_bind_port');



const load_blacklist = function(blacklist, blocklists_directory, cb) {

    const add_file_to_blacklist = function(filepath, blacklist) {
        var stream = byline(fs.createReadStream(filepath, {
            encoding: 'utf8'
        }));
        stream.on('data', function(line) {
            if (line[0] !== '#') {
                blacklist.add(line, {
                    source: filepath
                });

                log.trace({
                    action: 'BLOCKLIST_IPSET_IP_ADD',
                    ip: line,
                    file: filepath
                });
            }
        });
    };


    fs.readdir(blocklists_directory, function(err, items) {
        if (err != null) {
            log.error({
                error: err.message
            }, "Failed to get directory listing!");
            return;
        }

        files = _.filter(items, item => path.extname(item) === '.ipset');

        let success = 0, failure = 0;

        let filepath;
        _.forEach(files, function(file) {
            filepath = blocklists_directory + '/' + file;
            try {
                add_file_to_blacklist(filepath, blacklist);
            } catch (err) {
                log.error({
                        filepath: filepath,
                        blocklists_directory: blocklists_directory,
                        error: err.message
                    }, "Failed to read ipset file!")
                    ++failure;
                return;
            }
            ++success;

            log.debug({
                file: filepath,
                action: 'BLOCKLIST_IPSET_FILE_ADD'
            });
        });

        log.info({
            action: 'BLOCKLIST_LOADED',
            successful: success,
            failed: failure
        }, 'Finished loading blocklist-ipsets.');

        if (cb) cb();

    });

};

const repoMonitor = new RepositoryMonitor(blocklists_directory, 5000);
const repoUpdater = new RepositoryUpdater(blocklists_directory, 5000);

let blacklist = new ip_blacklist.IpBlacklist();

load_blacklist(blacklist, blocklists_directory);


repoMonitor.on('updated', function() {
    const tempBlacklist = new ip_blacklist.IpBlacklist();
    load_blacklist(tempBlacklist, blocklists_directory, function() {
        blacklist = tempBlacklist;
    });
});


http.createServer(function(request, response) {
    let resp = {};
    response.setHeader('Connection', 'close');
    const urlParts = url.parse(request.url, true);
    if (urlParts.pathname === '/check' && 'ip' in urlParts.query) {
        resp.status = 'success';
        const ip = urlParts.query['ip'];
        const result = blacklist.get(ip);
        if (result !== null) {
            resp.allowed = false;
            resp.metadata = result;
        } else {
            resp.allowed = true;
        }
    } else {
        resp.status = 'error';
        if (urlParts.pathname !== '/check') {
            resp.message = 'Invalid path!';
        } else if (!('ip' in urlParts.query)) {
            resp.message = 'Missing ip parameter in query string!';
        }
    }
    response.end(JSON.stringify(resp));
}).listen(port);
