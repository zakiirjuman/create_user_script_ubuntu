// This file should test the readConfig.js file with the sample_archive_conf.yaml file
let readConfig = require('../readConfig.js');
let assert = require('assert');

let sample_path = 'read_config_test_inputs/sample_archive_conf.yml';
let user_fail_path = 'read_config_test_inputs/username_fail.yml';
let archive_destination_fail_path = 'read_config_test_inputs/archive_destination_fail.yml';
let archive_extension_fail_path = 'read_config_test_inputs/archive_extension_fail.yml';


describe('readConfig', function() {
    it('should return a config object', async function() {
        let config_output = await readConfig(sample_path);
        let { backup_paths, archive_extension, archive_destination, username, cron_schedule } = config_output;
        //assert.equal(backup_paths, config.backup_paths);
        assert.equal(archive_extension, '.tar.gz');
        assert.equal(archive_destination, '/backups/ubuntu');
        assert.equal(username, 'ubuntu');
    });

    it('should return false if the username is invalid', async function() {
        let config_output = await readConfig(user_fail_path);
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