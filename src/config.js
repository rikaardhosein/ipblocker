const convict = require('convict');


const conf = convict({
    blocklist_ipsets_path: {
        doc: 'The path to the ipset files that are used for creating the blacklist.',
        format: String,
        default: 'Please specify a path via BLOCKLIST_IPSETS_PATH!',
        env: 'BLOCKLIST_IPSETS_PATH'
    }
});

conf.validate({
    strict: true
});
module.exports = conf;