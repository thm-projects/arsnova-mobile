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
		clean: {
			build: buildPath
		},

		jscs: {
			all: {
				src: lintJs
			},
			options: {
				config: ".jscs.json"
			}
		},

		jshint: {
			all: {
				src: lintJs
			},
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
		},

		watch: {
			js: {
				files: [lintJs, ".jscs.json", ".jshintrc"],
				tasks: ["newer:jscs", "newer:jshint"]
			}
		}
	});

	function setSenchaEnv(env) {
		/* shortcuts */
		if ("prod" === env) {
			env = "production";
		} else if ("dev" === env) {
			env = "testing";
		}
		grunt.config("senchaEnv", env);
	}

	grunt.registerTask("build", function (env) {
		/* use prod env by default for build task */
		setSenchaEnv(env ? env : "prod");
		grunt.task.run("shell:build");
	});

	grunt.registerTask("run", function (env) {
		/* use dev env by default for run task */
		setSenchaEnv(env ? env : "dev");
		grunt.util.spawn({
			cmd: "sencha",
			args: ["app", "watch", "-e", grunt.config("senchaEnv")],
			opts: {
				cwd: appPath
			}
		});
		/* we want Grunt for this task to continue even if QA checks fail */
		grunt.option("force", true);
		grunt.task.run(["newer:jscs", "newer:jshint"]);
		grunt.task.run("watch");
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-shell");

	grunt.registerTask("lint", ["jscs", "jshint"]);
	grunt.registerTask("refresh", "shell:refresh");
	grunt.registerTask("default", ["lint", "build"]);
};
