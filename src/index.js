const ip_blacklist = require('./ip_blacklist');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');


//Let's see how long it'll take me to read in all these files.

const blacklist = new ip_blacklist.IpBlacklist();


const blocklists_directory = '/Users/Rikaard/blocklist-ipsets';

const add_file_to_blacklist = function(filepath, blacklist) {
    let data = fs.readFileSync(filepath).toString();
    data = data.split('\n')
    data = _.filter(data, line => line[0] !== '#')
    _.forEach(data, function(ip) {
        blacklist.add(ip, "metadata");
    });
};

fs.readdir(blocklists_directory, function(err, items) {
    //items holds a list of items. I'm only interested in .ipset.
    files = _.filter(items, item => path.extname(item) === '.ipset')

    let filepath;
    _.forEach(files, function(file) {
          filepath = blocklists_directory + '/' + file;
          add_file_to_blacklist(filepath, blacklist);
    });

});
