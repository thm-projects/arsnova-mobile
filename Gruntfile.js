/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	require("time-grunt")(grunt);

	var appPath = "src/main/webapp";
	var buildPath = appPath + "/build";

	/* Files matching the following patterns will be checked by JSHint and JSCS */
	var lintJs = [
		"Gruntfile.js",
		appPath + "/app/**/*.js",
		"!" + appPath + "/app/utils/Ext.*.js"
	];

	grunt.initConfig({
		senchaEnv: "production",

		clean: {
			build: buildPath
		},

		jscs: {
			src: lintJs,
			options: {
				config: ".jscs.json"
			}
		},

		jshint: {
			src: lintJs,
			options: {
				jshintrc: ".jshintrc"
			}
		},

		shell: {
			build: {
				command: "sencha app build <%= senchaEnv %>",
				options: {
					execOptions: {
						cwd: appPath
					}
				}
			},

			refresh: {
				command: "sencha app refresh",
				options: {
					execOptions: {
						cwd: appPath
					}
				}
			},

			watch: {
				command: "sencha app watch -e <%= senchaEnv %>",
				options: {
					execOptions: {
						cwd: appPath
					}
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-shell");

	grunt.registerTask("lint", ["jscs", "jshint"]);
	grunt.registerTask("default", ["lint"]);
};
