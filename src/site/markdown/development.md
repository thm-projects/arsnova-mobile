# Development

## Preparations

The mobile client uses Sencha Touch 2 as application framework.
In order to work with the client you have to install Sencha Cmd 4 (version 5 is currently not compatible with ARSnova).
The basic requirement for installing and using Sencha Cmd is the presence of Ruby and Java Runtime Environment 1.7 (or newer).
Additionally, you need [Grunt](http://gruntjs.com/) to build the frontend which runs on top of NodeJS.
Before you continue, please ensure that all requirements are installed properly.

The download links to the referred requirements, as well as the installation guide for Sencha Cmd can be found here:

- [Download Sencha Cmd](http://www.sencha.com/products/sencha-cmd/)
- [Sencha Cmd documentation](http://docs.sencha.com/cmd/5.x/intro_to_cmd.html) (see subsection "System Setup")


## Building

ARSnova consists of two main projects: ARSnova Mobile (this repository) and ARSnova Backend.
You have to build both projects separately, in order to work with the mobile client.
If you need information regarding the installation of ARSnova Backend, please look up the read me at
[thm-projects/arsnova-backend](https://github.com/thm-projects/arsnova-backend).

ARSnova Mobile is built by the Grunt task runner.
When building the frontend for the first time, you need to install the build dependencies via NPM:

	# npm install -g grunt-cli
	$ cd /path/to/arsnova-mobile
	$ npm install

Afterwards, you can create a web archive for a servlet container by running:

	$ grunt package

This creates the archive `arsnova-mobile.war` in the `target` directory.
If you just wish to build the production system without creating an archive, you can use

	$ grunt build


### Continuous Build

The commands above build the software in such a way that it can be put into production immediately.
However, this is not the best way to develop a feature or to fix a bug.
Instead, we provide several build commands, based on Sencha Cmd.

In order to develop and test on your local machine, you first need to run the ARSnova backend.
You can use Jetty to start it:

	$ cd /path/to/arsnova-backend
	$ mvn jetty:run

Then, and before you call any build command, you have to refresh your Sencha Cmd project.
To do so, open a second terminal and execute the following command:

	$ cd /path/to/arsnova-mobile
	$ grunt refresh

Next, we continously build ARSnova:

	$ grunt run

`grunt run` will automatically inform you about code issues detected by JSCS and JSHint in files you modify.
You can also run both code checkers via `grunt lint`, or separately via `grunt jscs` and `grunt jshint`.


### Build Environments

For `production`, all JavaScript and CSS files are minified and put into the browser's cache.
This is good to make your changes ready for production, but you might want to have a faster build including proper stack traces while you are still coding your feature.
This is where the `testing` environment comes in.

By default, the `production` environment is used for `grunt build` while the `testing` environment is used for `grunt run`.
You can change this behavior by appending `:<environment>` to the task name where `<environment>` can be one of Sencha's environments or one of the shortcuts `prod` and `dev`.
