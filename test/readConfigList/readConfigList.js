// This file should test the readConfigList function.
const resolve = require('path').resolve;
const assert = require('assert');

// Require resolves paths relative to this folder
const readConfigList = require('../../src/readConfigList.js');

let this_dir = resolve('./test/readConfigList');

describe('readConfigList', () => {
    it('should return an array of valid paths', () => {
        // Define the conf_list_path
        const conf_list_path = `${this_dir}/conf_list.yml`;

        // Define the expected output
        const expected_output =
        [`${this_dir}/sample_archive_conf.yml`,
        `${this_dir}/sample_archive_conf2.yml`];

        // Call the function
        const actual_output = readConfigList(conf_list_path);

        // Compare the actual output to the expected output
        assert.deepEqual(actual_output, expected_output);
    });
});