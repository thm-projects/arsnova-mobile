# ARSnova

ARSnova is a modern approach to Audience Response Systems (ARS). It is released under the GPLv3 license, and is offered as a Software as a Service free of charge. Head over to [arsnova.eu](https://arsnova.eu/) to see it in action.

![ARSnova](src/site/resources/showcase.png)

ARSnova consists of two projects: the mobile client and the server. This repository contains the mobile client code. You will find the server at [thm-projects/arsnova-war](https://github.com/thm-projects/arsnova-mobile). If you plan to work on the client you have to build both repositories - the server and the client.

## Getting Started

This is the mobile client repository. The following chapters will guide you through the installation, as well as the utilization of of all requirements you need to build and use the mobile client of ARSnova. Before you start, please ensure that the server part has been arranged completely. 

### Requirements

The mobile client is using Sencha Touch 2 as application framework. In order to work with the client you have to install Sencha CMD. The basic requirement for installing and using Sencha CMD is the presence of Ruby 1.9.3 and Java Runtime Environment in Version 1.7. Before you continue, please ensure that all requirements are installed properly. 

The download links to the referred requirements, as well as the installation guide for Sencha CMD can be found in the Sencha CMD documentation: 

[http://www.sencha.com/products/sencha-cmd/]
[http://docs.sencha.com/cmd/4.0.0/#!/guide/command_whats_new] (subsection "Installing Sencha Cmd")

### Building

ARSnova consists of two main projects: arsnova-mobile (this repository) and arsnova-war. You have to build both projects separately, in order to work with the mobile client. If you need informations regarding the installation of arsnova-war, please look up the read me at [thm-projects/arsnova-war](https://github.com/thm-projects/arsnova-mobile).

Basically a complete build is done with:

	mvn install
	

Alternatively you can use several ant-targets to build for different purposes:

Refresh Sencha CMD project structure:

	ant sencha:refresh
	
Build ARSnova with testing parameter:

	ant sencha:build:testing
	
Build ARSnova with production parameter:

	ant sencha:build:production

### Sencha CMD

Sencha CMD is the cornerstone to build a Sencha application. We will use it to minifying and deploying ARSnova to production. In order to use Sencha CMD with the mobile client you have to call `sencha` in your terminal. This will only work from the `arsnova-mobile/src/main/webapp` folder, where the Sencha CMD project files lies.

The usage of Sencha CMD is explained explicitly in the [Sencha CMD documentation](http://docs.sencha.com/cmd/4.0.0/).

#### Deploying

We can use Sencha CMD to deploy the mobile client. As specified in the [Sencha CMD documentation](http://docs.sencha.com/cmd/4.0.0/#!/guide/command_app_touch), there are different build environment options. Two of them are relevant for deploying the mobile client - `testing` and `production`.

Before you call any deployment command, you have to refresh your Sencha CMD project:

	cd /path/to/arsnova-mobile/src/main/webapp
	sencha app refresh

After that you can use the following command to deploy the mobile client for testing deployment:

	cd /path/to/arsnova-mobile/src/main/webapp
	sencha app build testing
	
And similarly for production deployment:

	cd /path/to/arsnova-mobile/src/main/webapp
	sencha app build production

#### Development

In order to develop and test on your local machine, you can use Jetty to deploy ARSnova:

	cd /path/to/arsnova-war
	mvn jetty:run
	
If you not intend to (re)build the client after every change, you can use `sencha app watch`. With this command Sencha CMD will containually update bootstrap.js and apps.js files after you change a component in your application. To do so you have to open a second terminal and execute the following command:

	cd /path/to/arsnova-mobile/src/main/webapp
	sencha app watch
	
Or the ant target respectively:

	cd /path/to/arsnova-mobile
	ant sencha:app:watch
	
	
## Credits

ARSnova is powered by Technische Hochschule Mittelhessen - University of Applied Sciences.