/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * required classes
 */
//@require lib/moment.de.js
//@requrie lib/moment.min.js
//@requrie lib/rsvp.min.js
//@require utils/Ext.util.TaskRunner.js
//@require utils/Ext.util.ResizableTextArea.js
//@require utils/Ext.Array.js

//<if selenium>
// Fixes Selenium WebDriver's limitations by disabling certain animations
Ext.require(["ARSnova.test.Slide", "ARSnova.test.MessageBox", "ARSnova.test.Container"]);
//</if>

Ext.require([
	'Ext.Label',
	'Ext.TitleBar',
	'Ext.field.Toggle',
	'Ext.dataview.List',
	'Ext.field.Spinner',
	'Ext.form.FieldSet',
	'Ext.viewport.Viewport',
	'Ext.chart.CartesianChart',
	'Ext.SegmentedButton',
	'Ext.data.JsonStore',
	'Ext.device.Device'
]);

Ext.application({

	requires: ['ARSnova.WebSocket', 'ARSnova.BrowserSupport', 'ARSnova.view.CustomMessageBox', 'ARSnova.utils.AsyncUtils'],

	viewport: {
		autoMaximize: Ext.os.is.iOS && Ext.browser.is.webview
	},

	icon: {
		57: 'resources/icons/appicon_57x57px.png',
		72: 'resources/icons/appicon_72x72px.png',
		114: 'resources/icons/appicon_114x114px.png',
		144: 'resources/icons/appicon_144x144px.png'
	},

	name: "ARSnova",
	absoluteUrl: 'https://arsnova.eu/mobile/',

	fullscreen: true,

	/* const */
	WEBAPP: 'webapp',
	NATIVE: 'native',
	APP_URL: window.location.origin + window.location.pathname,
	WEBSERVICE_URL: "app/webservices/",

	LOGIN_GUEST: "guest",
	LOGIN_ARSNOVA: "arsnova",
	LOGIN_LDAP: "ldap",
	LOGIN_CAS: "cas",
	LOGIN_OPENID: "notimplemented",
	LOGIN_TWITTER: "twitter",
	LOGIN_FACEBOOK: "facebook",
	LOGIN_GOOGLE: "google",

	USER_ROLE_STUDENT: "0",
	USER_ROLE_SPEAKER: "1",

	isIconPrecomposed: true,

	models: ['Answer', 'Feedback', 'LoggedIn', 'Question', 'Session', 'Statistic', 'Course', 'Auth', 'FeedbackQuestion'],

	views: ['MainTabPanel', 'MathJaxMarkDownPanel', 'QuestionPreviewBox', 'AnswerPreviewBox'],

	controllers: ['Auth', 'Application', 'Feedback', 'Lang', 'Questions', 'FlashcardQuestions', 'PreparationQuestions', 'Sessions', 'SessionImport', 'SessionExport', 'Tracking'],

	/* items */
	mainTabPanel: null,
	tabPanel: null,
	loginPanel: null,
	taskManager: null,
	previousActiveItem: null,

	/* infos */
	loginMode: null,  /* ARSnova.app.LOGIN_GUEST, ... */
	appStatus: null,  /* ARSnova.app.WEBAPP || ARSnova.app.NATIVE */
	isSessionOwner: false, /* boolean */
	loggedIn: false, /* boolean */
	userRole: null,  /* ARSnova.app.USER_ROLE_STUDENT || ARSnova.app.USER_ROLE_SPEAKER */
	isNative: function () {return this.appStatus === this.NATIVE;},
	isWebApp: function () {return this.appStatus === this.WEBAPP;},

	/* models */
	answerModel: null,
	feedbackModel: null,
	loggedInModel: null,
	questionModel: null,
	sessionModel: null,
	statisticModel: null,
	courseModel: null,

	/* proxy */
	restProxy: null,

	/* other*/
	cardSwitchDuration: 500,
	socket: null,
	globalConfig: null,
	configLoaded: null,

	/**
	 * initialize models
	 */
	initModels: function () {
		this.answerModel = Ext.create('ARSnova.model.Answer');
		this.authModel = Ext.create('ARSnova.model.Auth');
		this.feedbackModel = Ext.create('ARSnova.model.Feedback');
		this.loggedInModel = Ext.create('ARSnova.model.LoggedIn');
		this.questionModel = Ext.create('ARSnova.model.Question');
		this.sessionModel = Ext.create('ARSnova.model.Session');
		this.statisticModel = Ext.create('ARSnova.model.Statistic');
		this.courseModel = Ext.create('ARSnova.model.Course');
	},

	/**
	 * This is called automatically when the page loads. Here we set up the main component on the page
	 */

	launch: function () {		
		console.info("ARSnova.app.launch");
		// Destroy the #appLoadingIndicator element
		Ext.fly('appLoadingIndicator').destroy();
		this.configLoaded = new RSVP.Promise();

		this.checkLocalStorage();
		this.checkBrowser();

		this.taskManager = new TaskRunner();

		this.initRestProxy();
		this.initSocket();
		this.initModels();

		var me = this;
		this.loadGlobalConfig().then(function (globalConfig) {
			console.debug("Configuration loaded");
			me.globalConfig = globalConfig;
			console.log(me.globalConfig);
			me.mainTabPanel = Ext.create('ARSnova.view.MainTabPanel');

			if(ARSnova.app.getController('Lang').activateTestRoutine) {
				ARSnova.app.getController('Lang').testRoutine(me.mainTabPanel.tabPanel);
			}
			
			me.configLoaded.resolve();
		}, function () {
			console.error("Could not load configuration");
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM, function () {
				setTimeout(function () {
					location.reload();
				}, 5000);
			});
			me.configLoaded.reject();
		});
	},
	
	/**
	 * reload application if manifest file is changed
	 */
	onUpdated: function () {
		Ext.Msg.confirm(Messages.NEW_VERSION_TITLE, Messages.NEW_VERSION_AVAILABLE,
			function (buttonId) {
				if (buttonId === 'yes') {
					window.location.reload();
				}
			}
		);
	},

	initRestProxy: function () {
		this.restProxy = Ext.create('ARSnova.proxy.RestProxy');
	},

	initSocket: function () {
		this.socket = Ext.create('ARSnova.WebSocket');
	},

	loadGlobalConfig: function () {
		var globalConfig = new RSVP.Promise();
		ARSnova.app.restProxy.getGlobalConfiguration({
			success: function (config) {
				globalConfig.resolve(config);
			},
			failure: function () {
				globalConfig.reject();
			}
		});

		return globalConfig;
	},

	/**
	 * after user has logged in
	 * start some tasks and show the correct homepage to user
	 */
	afterLogin: function () {
		var mainTabPanel = ARSnova.app.mainTabPanel.tabPanel;

		console.debug("Application: afterLogin");
		this.socket.connect();

		/* show diagnosis tab panel */
		mainTabPanel.diagnosisPanel.tab.show();

		mainTabPanel.animateActiveItem(mainTabPanel.homeTabPanel, 'slide');
		var hTP = mainTabPanel.homeTabPanel;
		switch (ARSnova.app.userRole) {
			case ARSnova.app.USER_ROLE_STUDENT:
				hTP.homePanel.checkLogin();
				hTP.setActiveItem(hTP.homePanel);
				break;
			case ARSnova.app.USER_ROLE_SPEAKER:
				hTP.setActiveItem(hTP.mySessionsPanel);
				break;
			default:
				break;
		}

		if (sessionStorage.getItem("keyword") !== null && sessionStorage.getItem("keyword") !== "") {
			return ARSnova.app.getController('Sessions').login({
				keyword: sessionStorage.getItem("keyword")
			});
		} else if (localStorage.getItem("keyword") !== null && localStorage.getItem("keyword") !== "") {
			return ARSnova.app.getController('Sessions').login({
				keyword: localStorage.getItem("keyword")
			});
		}
	},

	/**
	 * returns true if user is logged in a session
	 */
	checkSessionLogin: function () {
		if (localStorage.getItem('sessionId') == undefined || localStorage.getItem('sessionId') == "")
			return false;
		else
			return true;
	},

	/**
	 * returns true if device is a phone or a tablet
	 */
	checkMobileDeviceType: function () {
		if (Ext.device.deviceType == 'Phone' || Ext.device.deviceType == 'Tablet') {
			return true;
		} else
		return false;
	},

	checkPreviousLogin: function () {
		console.debug("Application: checkPreviousLogin");
		var isLocalStorageUninitialized = localStorage.getItem('role') == null
			|| localStorage.getItem('loginMode') == null
			|| localStorage.getItem('login') == null;
		if (isLocalStorageUninitialized) return false;

		ARSnova.app.loggedIn = true;
		ARSnova.app.loginMode = localStorage.getItem('loginMode');
		ARSnova.app.userRole = localStorage.getItem('role');
		ARSnova.app.setWindowTitle();
		ARSnova.app.afterLogin();

		return true;
	},

	setWindowTitle: function (addition) {
		if(!addition) addition = '';
		
		switch (ARSnova.app.userRole) {
			case ARSnova.app.USER_ROLE_SPEAKER:
				window.document.title = "ARSnova: " + Messages.SPEAKER + addition;
				break;
			case ARSnova.app.USER_ROLE_STUDENT:
				window.document.title = "ARSnova: " + Messages.STUDENT + addition;
				break;
			default:
				window.document.title = "ARSnova" + addition;
				break;
		}
	},

	/**
	 * Wrapper for an invidivudal LoadMask
	 */
	showLoadMask: function (message, duration) {
		var minimumDuration = 800;

		Ext.Viewport.setMasked({
			xtype: 'loadmask',
			message: message || ""
		});

		var hideLoadMask = Ext.Function.createDelayed(function () {
			Ext.Viewport.setMasked(false);
		}, minimumDuration);
		Ext.defer(hideLoadMask, (duration || 5000) - minimumDuration);

		return hideLoadMask;
	},

	/**
	 * clear local storage
	 */
	cleanLocalStorage: function () {
		localStorage.clear();
	},

	/**
	 * check if string is valid json
	 */
	isJsonString: function (str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	},

	/**
	 * make localStorage ready after checking availability of localStorage
	 */
	checkLocalStorage: function () {
		if(!this.getController('Application').checkForPrivacyMode()) {
			return;
		}
		
		if (localStorage.getItem('lastVisitedSessions') == null) {
			localStorage.setItem('lastVisitedSessions', "[]");
		}

		if (localStorage.getItem('lectureQuestionIds') == null) {
			localStorage.setItem('lectureQuestionIds', "[]");
		}

		if (localStorage.getItem('preparationQuestionIds') == null) {
			localStorage.setItem('preparationQuestionIds', "[]");
		}

		if (localStorage.getItem('loggedIn') == null) {
			localStorage.setItem('loggedIn', "[]");
		}

		if (localStorage.getItem('session')) {
			localStorage.removeItem('session');
		}

		localStorage.setItem('sessionId', "");
		return true;
	},

	checkBrowser: function () {
		var support = Ext.create('ARSnova.BrowserSupport');
		support.isBrowserSupported(function updateRequired(browserName, requiredVersion) {
			alert(Messages.UPDATE_BROWSER_MESSAGE.replace(/###/, browserName));
		}, function browserUnsupported(requiredBrowsers) {
			alert(Messages.BROWSER_NOT_SUPPORTED_MESSAGE.replace(/###/, requiredBrowsers.join(", ")));
		});
	},

	formatSessionID: function (sessionID) {
		var tmp = [];
		for (var i = 0; i < sessionID.length; i++) {
			if (i % 2) {
				tmp.push(sessionID.substr(i - 1, 2));
			}
		}
		if (tmp.length * 2 < sessionID.length) tmp.push(sessionID[tmp.length * 2]);
		return tmp.join(" ");
	},

	removeVisitedSession: function (sessionId) {
		var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
		for (var i = 0; i < sessions.length; i++) {
			var session = sessions[i];
			if (sessionId == session._id) {
				sessions.splice(i, 1);
			}
		}
		localStorage.setItem('lastVisitedSessions', Ext.encode(sessions));
	}
});

function clone(obj) {
	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		var copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		var copy = [];
		for (var i = 0; i < obj.length; ++i) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to copy obj! Its type isn't supported.");
}
