# ARSnova

ARSnova is a modern approach to Audience Response Systems (ARS). It is released under the GPLv3 license and is offered as a Software as a Service free of charge. Head over to [arsnova.eu](https://arsnova.eu/) to see it in action.

![ARSnova](src/site/resources/showcase.png)

ARSnova consists of two projects: the mobile client and the server. This repository contains the mobile client code. You will find the server at [thm-projects/arsnova-war](https://github.com/thm-projects/arsnova-war). If you plan to work on the client you have to build both repositories - the server and the client.

[![Build Status](https://travis-ci.org/thm-projects/arsnova-mobile.svg?branch=master)](https://travis-ci.org/thm-projects/arsnova-mobile)

## Getting Started

The most convenient way to get started developing ARSnova is by using our [Vagrant](http://www.vagrantup.com/) environment, found at [thm-projects/arsnova-vagrant](https://github.com/thm-projects/arsnova-vagrant). Use your IDE on your host machine to make changes to ARSnova, while the build process is completely handled by the Vagrant box. You will not need to install any development tools.

[arsnova-vagrant](https://github.com/thm-projects/arsnova-vagrant) sets up a virtual machine for both development and production use. The basic usage is `vagrant up`, which will start the development environment. If you wish to start production as well, use `vagrant up production`.

Once any machine has been started, all required ARSnova repositories are automatically cloned from GitHub, so that you can start coding immediately.

To connect to your development machine, type `vagrant ssh`. After that, you can start ARSnova inside the machine by running `./start.sh`. You can then access ARSnova from your host machine by opening http://localhost:8080.

### QA Private Build

[arsnova-vagrant](https://github.com/thm-projects/arsnova-vagrant) also sets up the build environment we use internally at THM, which consists of [Jenkins](http://jenkins-ci.org/) and [SonarQube](http://www.sonarqube.org/). The former provides a QA pipeline that builds, tests, analyzes, and finally deploys ARSnova to the production environment. SonarQube is used for the analyzation phase and provides a drill-down into many quality aspects, including [technical debt](https://en.wikipedia.org/wiki/Technical_debt).

While the development environment is running, Jenkins and SonarQube are available at:

- http://localhost:9000 (SonarQube)
- http://localhost:9090 (Jenkins)

### QA Public Build

We also leverage the cloud provided by [Travis CI](https://travis-ci.org/) and [Sauce Labs](https://saucelabs.com/) to build and test ARSnova. Travis first builds and unit tests the software, then it instructs Sauce Labs to run smoke tests on different browsers and operating systems. This ensures that the basic features of ARSnova work across browsers and platforms. See [this example](https://saucelabs.com/tests/4beecf8c754f418da0b75259c039c077) to get an idea.

Our official build status provided by Travis CI:

- [![Build Status](https://travis-ci.org/thm-projects/arsnova-war.svg?branch=master)](https://travis-ci.org/thm-projects/arsnova-war) for ARSnova-war
- [![Build Status](https://travis-ci.org/thm-projects/arsnova-mobile.svg?branch=master)](https://travis-ci.org/thm-projects/arsnova-mobile) for ARSnova-mobile

## Development

This is the mobile client repository. The following chapters will guide you through the installation, as well as the utilization of all requirements you need to build and use the mobile client of ARSnova. Before you start, please ensure that the server part has been arranged completely.

### Requirements

The mobile client uses Sencha Touch 2 as application framework. In order to work with the client you have to install Sencha Cmd. The basic requirement for installing and using Sencha Cmd is the presence of Ruby 1.9.3 and Java Runtime Environment in Version 1.7. Before you continue, please ensure that all requirements are installed properly.

The download links to the referred requirements, as well as the installation guide for Sencha Cmd can be found here:

- [Download Sencha Cmd](http://www.sencha.com/products/sencha-cmd/)
- [Sencha Cmd documentation](http://docs.sencha.com/cmd/4.0.0/#!/guide/command_whats_new) (see subsection "Installing Sencha Cmd")

### Building

ARSnova consists of two main projects: arsnova-mobile (this repository) and arsnova-war. You have to build both projects separately, in order to work with the mobile client. If you need informations regarding the installation of arsnova-war, please look up the read me at [thm-projects/arsnova-war](https://github.com/thm-projects/arsnova-war).

Basically a complete build for both projects is done with:

	mvn clean install

When you build ARSnova the first time, please be attentive to build the mobile client **first** and afterwards the server application.

#### Continuous Build

The command above builds the software in such a way that it can be put into production immediately. However, this is not the best way to develop a feature or to fix a bug. Instead, we provide several fine-grained build commands, based on Sencha Cmd.

Before you call any build command, you have to refresh your Sencha Cmd project:

	cd /path/to/arsnova-mobile
	ant sencha:refresh

After that you can use the following command to build the mobile client for production deployment:

	cd /path/to/arsnova-mobile
	ant sencha:build:production

In order to develop and test on your local machine, you can use Jetty to deploy ARSnova:

	cd /path/to/arsnova-war
	mvn jetty:run

If you do not want to manually rebuild the client after every change, you can use Sencha Cmd's watching feature. Then ARSnova will be built continuously, while Jetty will pick up and redeploy the changes. To do so you have to open a second terminal and execute the following command:

	cd /path/to/arsnova-mobile
	ant sencha:app:watch

#### The "testing" environment

By default, all JavaScript and CSS files are minified and put into the browser's cache. This is good to make your changes ready for production, but you might want to have a faster build including proper stack traces while your still coding your feature. This is where the `testing` environment comes in.

The build commands change in the following way:

	cd /path/to/arsnova-mobile
	ant sencha:build:testing

	cd /path/to/arsnova-war
	mvn jetty:run -Dmobile.path=\${mobile.testing.path}

For using the watching functionality, run:

	cd /path/to/arsnova-mobile
	ant sencha:app:watch -Denvironment=testing

## Credits

ARSnova is powered by Technische Hochschule Mittelhessen - University of Applied Sciences.
