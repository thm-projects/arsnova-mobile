# Upgrading ARSnova

This document describes the necessary steps to upgrade ARSnova Mobile.
In case you are viewing this file from the Repository please make sure you are on the corresponding `x.y-stable` branch for the target version.


# Compatibility

When upgrading ARSnova Mobile to a new minor release, make sure to also upgrade the backend to a compatible version.
To avoid compatibility issues we recommend to always install matching minor versions of ARSnova Mobile and Backend.


## Mobile Upgrade

Copy the web archive (`.war` file) for the new backend version into Tomcat's `webapps` directory.
It is usually located at either `/var/lib/tomcatX/webapps` or `/opt/tomcatX/webapps`.
Make sure you use the same name you chose when installing ARSnova (we suggest `mobile.war`) and override the existing file.
By default, Tomcat automatically deploys the updated application.


## Final Steps

The new version of the frontend should now be up and running.
As a quick test you can run the following `curl` commands:

	curl localhost:8080/mobile/resources/version.json

The new version should be returned.
