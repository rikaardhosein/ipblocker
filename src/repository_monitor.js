const EventEmitter = require('events');
const git = require('nodegit');


class RepositoryMonitor extends EventEmitter {
    constructor(repositoryDir, interval) {
        super();
        const that = this;
        let initialized = false;

        git.Repository.open(repositoryDir).then(function(repository) {
                let previousHeadCommitSha = null;

                repository.getHeadCommit().then(function(headCommit) {
                    if (headCommit != null) {
                        previousHeadCommitSha = headCommit.sha();
                    }
                    that.emit('initialized');

                    setInterval(function() {
                        repository.getHeadCommit().then(function(headCommit) {
                            const currentHeadCommitSha = headCommit.sha();
                            if (previousHeadCommitSha !== currentHeadCommitSha) {
                                previousHeadCommitSha = currentHeadCommitSha;
                                that.emit('updated');
                            }
                        });
                    }, interval);

                });

            })
            .catch(function(err) {
                that.emit('error', err);
            });
    }
}


module.exports = RepositoryMonitor;
