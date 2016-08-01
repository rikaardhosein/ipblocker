const git = require('nodegit');


class RepositoryUpdater {
    constructor(repositoryDir, interval) {
        git.Repository.open(repositoryDir).then(function(repository) {
            setInterval(function() {
                repository.fetchAll().then(function() {
                    repository.mergeBranches('master', 'origin/master');
                });
            }, interval);
        });
    }
}


module.exports = RepositoryUpdater;