/* jshint browser: false, node: true */
"use strict";

module.exports = function (grunt) {
	require("time-grunt")(grunt);
	var parseXml = require("xml2js").parseString;

	var appPath = "src/main/webapp";
	var buildPath = appPath + "/build";
	var warPath = "target";
	var versionFilePath = appPath + "/resources";

	/* Files matching the following patterns will be checked by JSHint and JSCS */
	var lintJs = [
		"Gruntfile.js",
		appPath + "/*.js",
		appPath + "/app/**/*.js",
		/* Exclude third-party code */
		"!" + appPath + "/bootstrap.js",
		"!" + appPath + "/app/utils/Ext.*.js",
		"!" + appPath + "/app/Fileup.js"
	];

	grunt.initConfig({
		clean: {
			build: buildPath
		},

		connect: {
			server: {
				options: {
					base: buildPath + "/<%= senchaEnv %>/ARSnova",
					hostname: "<%= hostname %>",
					port: 8081,
					useAvailablePort: true,
					open: true,
					middleware: function (connect, options) {
						var proxy = require("grunt-connect-proxy/lib/utils").proxyRequest;

						return [
							["/", function (req, res, next) {
								if ("/" === req.url) {
									res.writeHead(301, {Location: "/mobile"});
									res.end();
								} else {
									/* Let the proxy middleware handle this request */
									next();
								}
							}],
							/* Serve static files */
							["/mobile", connect.static(options.base[0])],
							/* Proxy for backend API */
							proxy
						];
					}
				},
				proxies: [
					{
						context: ["/api", "/arsnova-config"],
						host: "localhost",
						port: 8080,
						ws: true,
						xforward: true,
						rewrite: {
							"^/api/": "/",
							"^/arsnova-config$": "/configuration/"
						}
					},
					{
						context: ["/socket.io"],
						host: "localhost",
						port: 8090,
						ws: true,
						xforward: true
					}
				]
			}
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

		war: {
			dist: {
				/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
				options: {
					war_dist_folder: warPath,
					war_name: "arsnova-mobile",
					webxml_display_name: "ARSnova Mobile"
				},
				/* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
				expand: true,
				cwd: buildPath + "/<%= senchaEnv %>/ARSnova",
				src: "**",
				dest: ""
			}
		},

		watch: {
			js: {
				files: [lintJs, ".jscs.json", ".jshintrc"],
				tasks: ["readpom", "genversionfile", "newer:jscs", "newer:jshint"]
			},
			pom: {
				files: "pom.xml",
				tasks: ["readpom", "genversionfile"]
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

	/* Simplify stream handling by splitting at new lines */
	function createChunkLineSplitter(cb) {
		var buffer = "";
		return function (chunk) {
			var start = 0, end;
			chunk = chunk.toString();
			while (-1 !== (end = chunk.indexOf("\n", start))) {
				cb(buffer + chunk.substring(start, end));
				start = end + 1;
				buffer = "";
			}
			buffer = chunk.substring(start);
		};
	}

	grunt.registerTask("build", function (env) {
		grunt.task.run("version");
		/* use prod env by default for build task */
		setSenchaEnv(env ? env : "prod");
		grunt.task.run("shell:build");
	});

	grunt.registerTask("run", function (env, host) {
		grunt.task.run("version");
		/* use dev env by default for run task */
		setSenchaEnv(env ? env : "dev");
		grunt.config("hostname", host || "localhost");
		var senchaProc = grunt.util.spawn({
			cmd: "sencha",
			args: ["app", "watch", "-e", grunt.config("senchaEnv")],
			opts: {
				cwd: appPath
			}
		}, function (err, result, code) {
			grunt.fail.fatal("Sencha build failed.");
		});
		var handleLines = createChunkLineSplitter(function (line) {
			var severity = line.substr(1, 3);
			switch (severity) {
			case "ERR":
			case "WRN":
				grunt.log.errorlns("Sencha: " + line);
				break;
			default:
				grunt.verbose.writeln("Sencha: " + line.substr(6));
				if (line === "[INF] waiting for changes...") {
					grunt.log.ok("Sencha build completed at " + new Date() + ".");
				}
			}
		});
		senchaProc.stdout.on("data", handleLines);
		/* we want Grunt for this task to continue even if QA checks fail */
		grunt.option("force", true);
		grunt.task.run([
			"newer:jscs",
			"newer:jshint",
			"configureProxies:server",
			"connect"
		]);
		grunt.task.run("watch");
	});

	grunt.registerTask("readpom", function () {
		var done = this.async();
		parseXml(grunt.file.read("pom.xml"), function (err, pom) {
			grunt.log.write("Version: " + pom.project.version[0]);
			grunt.config("pom", pom);
			done(true);
		});
	});

	grunt.registerTask("genversionfile", function () {
		grunt.task.requires("readpom");
		var done = this.async(),
			generate = function (dirty) {
				grunt.util.spawn({
					cmd: "git",
					args: ["log", "-n", "1", "--pretty=format:%H"]
				}, function (error, result, code) {
					var version = {
						productName: "arsnova-mobile",
						version: {
							string: grunt.config("pom").project.version[0],
							gitCommitId: result.stdout,
							gitDirty: dirty,
							buildTime: (new Date()).toISOString()
						}
					};
					grunt.file.write(versionFilePath + "/version.json", JSON.stringify(version) + "\n");
					done(true);
				});
			};
		grunt.util.spawn({
			cmd: "git",
			args: ["status", "--porcelain"]
		}, function (error, result, code) {
			var dirty = false;
			result.stdout.split("\n").forEach(function (line) {
				if (!/^$|^\?\?/.test(line)) {
					dirty = true;

					return;
				}
			});
			generate(dirty);
		});
	});

	grunt.loadNpmTasks("grunt-connect-proxy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-newer");
	grunt.loadNpmTasks("grunt-shell");
	grunt.loadNpmTasks("grunt-war");

	grunt.registerTask("lint", ["jscs", "jshint"]);
	grunt.registerTask("refresh", "shell:refresh");
	grunt.registerTask("version", ["readpom", "genversionfile"]);
	grunt.registerTask("package", ["refresh", "build", "war"]);
	grunt.registerTask("default", ["lint", "refresh", "build"]);
};
