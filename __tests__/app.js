'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-cxcloud:app', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/app')).withPrompts({
      isDeployedToKube: false,
      projectName: 'test',
      projectDescription: 'test',
      orgName: 'test',
      authorName: 'test',
      authorEmail: 'test@test.com',
      services: [],
      ecrRepository: '',
      isRouted: false,
      kubeDomain: '',
      isSecure: false
    });
  });

  it('creates files', () => {
    assert.file(['package.json']);
  });
});
