// This file should test the readConfigList function.
const readConfigList = require('../readConfigList.js');
const path = require('path');
const dir = path.resolve('./read_conf_list_test_inputs')
const assert = require('assert');

describe('readConfigList', () => {
    it('should return an array of valid paths', () => {
        // Define the conf_list_path
        const conf_list_path = './read_conf_list_test_inputs/conf_list.yml';

        // Define the expected output
        const expected_output =
        [`${dir}/sample_archive_conf.yml`,
        `${dir}/sample_archive_conf2.yml`];

        // Call the function
        const actual_output = readConfigList(conf_list_path);

        // Compare the actual output to the expected output
        assert.deepEqual(actual_output, expected_output);
    });
});