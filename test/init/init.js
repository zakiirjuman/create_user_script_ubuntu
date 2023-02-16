// This file should test the init process.
//  - Test that the program will not run if no conf_list_path is supplied

// Artificially create backup paths to work with:
//  - Create a folder in the test/init called backup_paths

let assert = require('assert');
let init  = require('../../src/init.js');
let resolve = require('path').resolve;
let yaml = require('js-yaml');
let fs = require('fs');

describe('init', function() {  
    before(function() {
        fs.rmdirSync(resolve('./test/init/backup_paths'), {recursive: true});
        fs.rmdirSync(resolve('./test/init/scripts'), {recursive: true});
        fs.rmdirSync(resolve('./test/init/cron'), {recursive: true});
        // Artificially create backup paths to work with:
        //  - Create a folder in test/init called backup_paths
        fs.mkdirSync(resolve('./test/init/backup_paths'));
        //  - Create a file called test_file.txt in backup_paths
        fs.writeFileSync(resolve('./test/init/backup_paths/test_file.txt'), 'This is a test file');
        fs.writeFileSync(resolve('./test/init/backup_paths/test_file2.txt'), 'This is a test file');
        fs.writeFileSync(resolve('./test/init/backup_paths/test_file3.txt'), 'This is a test file');
        fs.writeFileSync(resolve('./test/init/backup_paths/test_file4.txt'), 'This is a test file');
        let backup_paths = [
            resolve('./test/init/backup_paths/test_file.txt'),
            resolve('./test/init/backup_paths/test_file2.txt'),
            resolve('./test/init/backup_paths/test_file3.txt'),
            resolve('./test/init/backup_paths/test_file4.txt')
        ];
        //console.log(backup_paths)
        let config = yaml.load(fs.readFileSync(resolve('./test/init/sample_archive_conf.yml'), 'utf8'));
        config.backup_paths = backup_paths;
        fs.writeFileSync(resolve('./test/init/sample_archive_conf.yml'), yaml.dump(config));
        // Create a folder to store the shell scripts in
        let scripts_path = resolve('./test/init/scripts');
        fs.mkdirSync(scripts_path);
        // Create a folder to store the cron file in
        let cron_path = resolve('./test/init/cron');
        fs.mkdirSync(cron_path);
    });

    it('should return an error if invalid conf list path is supplied', async function() {
        try{
            await init('invalid/path');
        } catch (err) {
            assert.equal(err.message, 'Invalid conf list path: invalid/path');
        }
    });

    it('should return an error if invalid scripts path is supplied', async function() {
        try{
            await init(resolve('./test/init/sample_archive_conf.yml'), 'invalid/path');
        } catch (err) {
            assert.equal(err.message, 'Invalid shell script folder path: invalid/path');
        }
    });

    it('should return an error if invalid cron folder is supplied', async function() {
        try{
            await init(resolve('./test/init/sample_archive_conf.yml'), resolve('./test/init/scripts'), 'invalid/path');
        } catch (err) {
            assert.equal(err.message, 'Invalid cron folder path: invalid/path');
        }
    });
    
    it('should be able to create script files and cron file', async function() {
        await init(resolve('./test/init/conf_list.yml'), resolve('./test/init/scripts'), resolve('./test/init/cron'));
        // Check that the script files were created
        let files = fs.readdirSync(resolve('./test/init/scripts'));
        assert.equal(files.length, 2);
        // Check that the cron file was created
        let cron_files = fs.readdirSync(resolve('./test/init/cron'));
        assert.equal(cron_files.length, 1);
        
    });

    after(function(){

    })
});

