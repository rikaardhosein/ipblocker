const EventEmitter = require('events');
const git = require('nodegit');


class RepositoryMonitor extends EventEmitter {
    constructor(repositoryDir, interval) {
        super();
        const that = this;
        let initialized = false,
            previousHeadCommitSha = null;

        setInterval(() => {
            git.Repository.open(repositoryDir)
                .then(repository => repository.getHeadCommit())
                .then((headCommit) => {
                    const currentHeadCommitSha = headCommit ? headCommit.sha() : null;
                    if (!initialized) {
                        initialized = true;
                        that.emit('initialized');
                        return
                    }
                    if (previousHeadCommitSha !== currentHeadCommitSha) {
                        previousHeadCommitSha = currentHeadCommitSha;
                        that.emit('updated');
                    }
                })
                .catch((err) => that.emit('error', err));
        }, interval);
    }
}


module.exports = RepositoryMonitor;