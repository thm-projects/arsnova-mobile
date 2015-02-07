/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	require("time-grunt")(grunt);

	/* Files matching the following patterns will be checked by JSHint and JSCS */
	var lintJs = [
		"Gruntfile.js",
		"src/main/webapp/app/**/*.js",
		"!src/main/webapp/app/utils/Ext.*.js"
	];

	grunt.initConfig({
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
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");

	grunt.registerTask("lint", ["jscs", "jshint"]);
	grunt.registerTask("default", ["lint"]);
};
