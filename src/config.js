const convict = require('convict');


const conf = convict({
    blocklist_ipsets_path: {
        doc: 'The path to the ipset files that are used for creating the blacklist.',
        format: String,
        default: 'Please specify a path via BLOCKLIST_IPSETS_PATH!',
        env: 'BLOCKLIST_IPSETS_PATH'
    },
    blocklist_bind_addr: {
        doc: 'The address that the web server should bind to.',
        format: 'ipaddress',
        default: '0.0.0.0',
        env: 'BLOCKLIST_BIND_ADDR'
    },
    blocklist_bind_port: {
        doc: 'The port that the server should bind to',
        format: 'port',
        default: 8080,
        env: 'BLOCKLIST_BIND_PORT'
    },
    blocklist_git_repo: {
        doc: 'The git repository containing the blocklist ipsets.',
        format: String,
        default: 'https://github.com/firehol/blocklist-ipsets.git',
        env: 'BLOCKLIST_GIT_REPO'
    }
});

conf.validate({
    strict: false
});
module.exports = conf;