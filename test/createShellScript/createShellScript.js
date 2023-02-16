// This tests the createShellScript function

let assert = require('assert');
let resolve = require('path').resolve;
let fs = require('fs');

// Require resolves paths relative to this folder
let createShellScript = require('../../src/createShellScript.js');

// resolve() resolves paths relative to the current working directory (not this folder)
let this_dir = resolve('./test/createShellScript');

// Define the config object
let config = {
    archive_name: 'test_archive',
    archive_extension: '.tar.gz',
    archive_destination: '/backups/ubuntu',
    backup_paths: ['/home/ubuntu/test1', '/home/ubuntu/test2'],
    username: 'ubuntu',
    cron_schedule: '0 0 0 * *'
}

// Define the shell script folder
let shell_script_folder = this_dir;

// Define the expected shell script
let expected_shell_script = `#!/bin/bash\ntar -czf /backups/ubuntu/test_archive.tar.gz /home/ubuntu/test1 /home/ubuntu/test2\nchown ubuntu:ubuntu /backups/ubuntu/test_archive.tar.gz`

describe('createShellScript', function() {
    
        it('should create a shell script and return an object that contains the script_path and cron_schedule', async function() {
            let {script_path, cron_schedule} = await createShellScript(config, shell_script_folder);
            //read the shell script
            let shell_script = await fs.promises.readFile(`${shell_script_folder}/${config.archive_name}`, 'utf8');
            assert.equal(shell_script, expected_shell_script);
            assert.equal(script_path, `${shell_script_folder}/${config.archive_name}`);
            assert.equal(cron_schedule, config.cron_schedule);
        });
    
        it('should return rejected promise and error if the shell script folder does not exist', async function() {
            try{
                await createShellScript(config, `${shell_script_folder}/nonexistent`);
            }
            catch(err){
                assert.equal(err instanceof Error, true)
                assert.equal(err.message, `Shell script folder ${shell_script_folder}/nonexistent does not exist`);
            }
        });
    
        it('should return rejected promise and error if the shell script folder is not specified', async function() {
            try{
                await createShellScript(config);
            }
            catch(err){
                assert.equal(err instanceof Error, true)
                assert.equal(err.message, `Shell script folder is not specified`);
            }
        });
    
        it('should return rejected promise if the config is not specified', async function() {
            try {
                await createShellScript();
            }
            catch(err){
                assert.equal(err instanceof Error, true)
                assert.equal(err.message, `Config is invalid`);
            }
        });
    
    }); 


