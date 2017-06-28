# Installation

This document describes the necessary steps to install ARSnova Mobile.
In case you are viewing this file from the repository please make sure you are on the corresponding `x.y-stable` branch for the target version.


## Preparations

ARSnova Mobile is only the frontend and does not work standalone.
Before you proceed we suggest that you
[install ARSnova Backend](https://github.com/thm-projects/arsnova-backend/blob/master/src/site/markdown/installation.md) first.


## Web Application Deployment

The ARSnova Mobile application is contained in a single file: the web archive (`.war file`).
You can download the latest version from our
[GitHub releases page](https://github.com/thm-projects/arsnova-mobile/releases).

To deploy the frontend on the Tomcat Servlet container, copy the file to Tomcat's webapp directory and name it `mobile.war`.

Check that the application is deployed correctly by sending a HTTP request:

	$ curl localhost:8080/mobile/resources/version.json

Version information should be returned.


## Web Server Configuration

### Nginx

Modify the site configuration file `arsnova` in `/etc/nginx/sites-available` which you have created before for the backend.
Add the following line to the `server` section of this file:

	location /mobile { proxy_pass http://localhost:8080; }


### Apache HTTP Server

Modify the site configuration file `arsnova` in `/etc/apache2/sites-available` which you have created before for the backend.
Add the following lines to the `VirtualHost` section of this file:

	<Location /mobile/>
		ProxyPass http://localhost:8080/mobile/
	</Location>


## ARSnova Configuration

All configuration the frontend needs is provided via the backend's API.
No additional configuration for ARSnova Mobile is necessary.
Changes to the configuration are made in the backend's `arsnova.properties` file.


## Docker

If you want to run ARSnova in a containerized environment, you can use our Docker images.
Have a look at our [deployment instructions](https://github.com/thm-projects/arsnova-docker) for Docker.
