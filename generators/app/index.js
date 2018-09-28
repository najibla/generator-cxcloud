'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

const services = [
  {
    value: 'commerce',
    name: 'Commerce (CommerceTools)'
  },
  {
    value: 'search',
    name: 'Search (Algolia)'
  },
  {
    value: 'content',
    name: 'Content (Contentful)'
  },
  {
    value: 'auth',
    name: 'Authentication (AWS Cognito)'
  }
];

module.exports = class extends Generator {
  initializing() {
    this.composeWith(require.resolve('generator-git-init'));
  }

  async prompting() {
    this.log(
      // eslint-disable-next-line prettier/prettier
      yosay(
        `Welcome to the impeccable ${chalk.red('generator-cxcloud')} generator!`
      )
    );

    const githubUsername = await this.user.github.username();

    this.props = await this.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter a DNS compatible project name',
        default: this.appname
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Enter the project description',
        default: 'A CXCloud Microservice'
      },
      {
        type: 'input',
        name: 'orgName',
        message: 'Enter your Github username/organization name',
        default: githubUsername
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Enter your name',
        default: this.user.git.name()
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Enter your email',
        default: this.user.git.email()
      },
      {
        type: 'checkbox',
        name: 'services',
        message: 'Choose the services you want to install',
        choices: services
      },
      {
        type: 'confirm',
        name: 'isDeployedToKube',
        message:
          'Do you want to deploy this microservice to a Kubernetes cluster?',
        default: true
      },
      {
        type: 'list',
        name: 'ecrRepository',
        when: p => p.isDeployedToKube,
        message: 'Choose an ECR repository',
        choices: this.options.repositories || []
      },
      {
        type: 'confirm',
        name: 'isRouted',
        message: 'Do you want this service to be accessible on the internet?',
        default: true
      },
      {
        type: 'input',
        name: 'kubeDomain',
        when: p => p.isRouted,
        message: 'Enter a domain name'
      },
      {
        type: 'confirm',
        name: 'isSecure',
        message: 'Do you want a LetsEncrypt SSL certificate for this domain?',
        default: true
      }
    ]);
  }

  writing() {
    // Copy Base Structure
    this.fs.copyTpl(
      this.templatePath('service/**/*'),
      this.destinationPath(),
      this.props,
      {},
      {
        globOptions: { dot: true, ignore: ['.DS_Store'] }
      }
    );

    this.props.services.forEach(service => {
      this.fs.copyTpl(
        this.templatePath(`controllers/${service}/**/*`),
        this.destinationPath('src/controllers/'),
        this.props
      );
    });

    // Copy Deployment
    if (this.props.isDeployedToKube) {
      this.fs.copyTpl(
        this.templatePath('deployment/deployment.yml'),
        this.destinationPath('deployment/01-deployment.yml'),
        this.props
      );
    }

    // Copy Routing
    if (this.props.isRouted) {
      this.fs.copyTpl(
        this.templatePath('deployment/routing.yml'),
        this.destinationPath('deployment/02-routing.yml'),
        this.props
      );
    }

    // Copy Certificate
    if (this.props.isSecure) {
      this.fs.copyTpl(
        this.templatePath('deployment/cert.yml'),
        this.destinationPath('deployment/03-cert.yml'),
        this.props
      );
    }
  }

  install() {
    this.installDependencies({
      bower: false
    });
    this.npmInstall(this.props.services.map(service => `@cxcloud/${service}`));
  }
};
