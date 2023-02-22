// This file should test the readConfig.js file with the sample_archive_conf.yaml file
let assert = require('assert');
let resolve = require('path').resolve;

// Require resolves paths relative to this folder
let readConfig = require('../../src/readConfig.js');

// Resolve does not work as expected with mocha and is resolving relative to ../../
let this_dir = resolve('./test/readConfig');
let sample_path = `${this_dir}/sample_archive_conf.yml`;
let username_fail_path = `${this_dir}/username_fail.yml`;
let archive_destination_fail_path = `${this_dir}/archive_destination_fail.yml`;
let archive_extension_fail_path = `${this_dir}/archive_extension_fail.yml`;


describe('readConfig', function() {

    it('should return a config object', async function() {
        let config_output = await readConfig(sample_path);
        let { backup_paths, archive_extension, archive_destination, username, cron_schedule } = config_output;
        //assert.equal(backup_paths, config.backup_paths);
        assert.equal(archive_extension, '.tar.gz');
        assert.equal(archive_destination, "test/readConfig/archive_destination");
        assert.equal(username, 'ubuntu');
    });

    it('should return false if the username is invalid', async function() {
        let config_output = await readConfig(username_fail_path);
        assert.equal(config_output, false);
    });

    it('should return false if the archive_destination is invalid', async function() {
        let config_output = await readConfig(archive_destination_fail_path);
        assert.equal(config_output, false);
    });

    it('should return false if the archive_extension is invalid', async function() {
        let config_output = await readConfig(archive_extension_fail_path);
        assert.equal(config_output, false);
    });

    it('should return false if the paths dont exist');

    it('should return false if the cron_schedule is invalid');
})