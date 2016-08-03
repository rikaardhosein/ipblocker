const git = require('simple-git');
const EventEmitter = require('events');


class RepositoryUpdater extends EventEmitter{
    constructor(repositoryDir, interval) {
        super();
        const that = this;
        setInterval(()=>{
          git(repositoryDir).pull(function(err, update) {
              if (err) {
                  that.emit('error', err);
              } else {
                  that.emit('pulled');  
              }
          });
        }, interval);
    }
}


module.exports = RepositoryUpdater;
