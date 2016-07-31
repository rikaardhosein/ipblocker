const assert = require('chai').assert;
const git = require('nodegit');
const os = require('os');
const tmp = require('tmp');
const RepositoryMonitor = require('../src/repository_monitor');
const path = require('path');

let repositoryDir;
let repositoryCreated;

const signature = git.Signature.now("Rikaard Hosein", "test@test.com");
const interval = 1000;

describe('Git Repository Monitor', function() {

    before(function() {
        repositoryDir = tmp.dirSync({
            unsafeCleanup: true
        });
        repositoryCreated = git.Repository.init(repositoryDir.name, 0);
        repositoryCreated.catch(function(err) {
            console.log(err);
        });
    });

    after(function() {
        repositoryDir.removeCallback();
    });

    it('should emit event when repository has been updated', function(done) {
        this.timeout(10000);
        repositoryCreated.then(function(repository) {
            const repoMonitor = new RepositoryMonitor(repositoryDir.name, interval);
            repoMonitor.on('updated', done);

            repoMonitor.on('initialized', function() {
                const tmpFile = tmp.fileSync({
                    dir: repositoryDir.name
                });
                repository.createCommitOnHead([path.basename(tmpFile.name)], signature, signature, 'test').catch(done);
            });

        });

    });

    it('should emit error if repository does not exist', function(done) {
        const repoMonitor = new RepositoryMonitor("DOES_NOT_EXIST", interval);
        repoMonitor.on('error', () => {
            done();
        });
    });
});