/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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
//@require lib/moment.de.min.js
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
	'Ext.Toast',
	'Ext.TitleBar',
	'Ext.field.Toggle',
	'Ext.dataview.List',
	'Ext.field.Spinner',
	'Ext.form.FieldSet',
	'Ext.viewport.Viewport',
	'Ext.chart.CartesianChart',
	'Ext.SegmentedButton',
	'Ext.data.JsonStore',
	'Ext.device.Device',
	'ARSnova.override.viewport.Default'
]);

Ext.application({

	requires: ['ARSnova.WebSocket', 'ARSnova.BrowserSupport', 'ARSnova.view.CustomMessageBox', 'ARSnova.utils.AsyncUtils', 'ARSnova.view.components.MotdMessageBox'],

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

	models: ['Answer', 'Feedback', 'LoggedIn', 'Question', 'Session', 'Statistics', 'Course', 'FeedbackQuestion', 'Motd'],

	views: ['MainTabPanel', 'MathJaxMarkDownPanel', 'QuestionPreviewBox', 'AnswerPreviewBox'],

	controllers: ['Auth', 'Application', 'Feedback', 'Lang', 'Feature', 'Questions', 'FlashcardQuestions', 'PreparationQuestions', 'RoundManagement', 'MathJaxMarkdown', 'Sessions', 'SessionImport', 'SessionExport', 'Statistics', 'Tracking', 'QuestionExport', 'QuestionImport', 'FlashcardExport', 'FlashcardImport', 'Motds', 'Version'],

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
	motdModel: null,

	/* proxy */
	restProxy: null,

	/* other*/
	projectorModeActive: false,
	isFeedbackLocked: false,
	timerStyleConfig: null,
	feedbackChartStyleConfig: null,
	statisticChartStyleConfig: null,
	socket: null,
	globalConfig: null,
	configLoaded: null,

	/**
	 * initialize models
	 */
	initModels: function () {
		this.answerModel = Ext.create('ARSnova.model.Answer');
		this.feedbackModel = Ext.create('ARSnova.model.Feedback');
		this.loggedInModel = Ext.create('ARSnova.model.LoggedIn');
		this.questionModel = Ext.create('ARSnova.model.Question');
		this.sessionModel = Ext.create('ARSnova.model.Session');
		this.statisticsModel = Ext.create('ARSnova.model.Statistics');
		this.courseModel = Ext.create('ARSnova.model.Course');
		this.motdModel = Ext.create('ARSnova.model.Motd');
	},

	/**
	 * This is called automatically when the page loads. Here we set up the main component on the page
	 */

	launch: function () {
		console.info("ARSnova.app.launch");
		this.configLoaded = new RSVP.Promise();

		var langVariation = Messages.variation;
		delete Messages.variation;
		Messages = Ext.Object.merge(Messages, langVariation);

		/* Workaround needed for Edge since ST recognizes it as WebKit */
		var detect = Ext.create("ARSnova.BrowserDetect");
		if (detect.browser === "Edge") {
			Ext.getBody().removeCls('x-webkit');
			Ext.getBody().removeCls('x-chrome');
		}

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
			me.mainTabPanel = Ext.create('ARSnova.view.MainTabPanel');
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
		console.log("onUpdated");
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

		if (typeof window.arsnovaConfig === 'object') {
			globalConfig.resolve(window.arsnovaConfig);
		} else {
			ARSnova.app.restProxy.getGlobalConfiguration({
				success: function (config) {
					globalConfig.resolve(config);
				},
				failure: function () {
					globalConfig.reject();
				}
			});
		}

		return globalConfig;
	},

	/**
	 * after user has logged in
	 * start some tasks and show the correct homepage to user
	 */
	afterLogin: function () {
		var mainTabPanel = ARSnova.app.mainTabPanel.tabPanel;
		var controller = ARSnova.app.getController('Sessions');
		var hTP = mainTabPanel.homeTabPanel;

		console.debug("Application: afterLogin");
		this.socket.connect();

		/* show diagnosis tab panel */
		mainTabPanel.diagnosisPanel.tab.show();

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

		/* check existing login in stored session */
		if (controller.checkExistingSessionLogin()) {
			controller.login({keyword: sessionStorage.getItem("keyword")});
		} else {
			mainTabPanel.animateActiveItem(hTP, 'slide');
		}

		Ext.create('Ext.util.DelayedTask', ARSnova.app.closeSplashScreen).delay(1500);
	},

	/**
	 * returns true if user is logged in a session
	 */
	checkSessionLogin: function () {
		return !!localStorage.getItem('sessionId');
	},

	/**
	 * returns true if device is a phone or a tablet
	 */
	checkMobileDeviceType: function () {
		return Ext.device.deviceType === 'Phone' || Ext.device.deviceType === 'Tablet';
	},

	closeSplashScreen: function () {
		var hasActiveLogin = !ARSnova.app.areLocalStorageLoginVarsUninitialized();
		if (!ARSnova.app.splashscreenDestroyed && (window.closeSplashScreen || hasActiveLogin)) {
			ARSnova.app.splashscreenDestroyed = true;
			Ext.fly('splashScreenContainer').destroy();
			window.document.body.style.overflow = 'initial';
			window.document.body.style.background = 'initial';
			window.document.body.classList.add('splashscreenClosed');
		}
		if (ARSnova.app.loggedIn !== true) {
			ARSnova.app.restProxy.getMotdsForAll({
				success: function (response) {
					var motds = Ext.decode(response.responseText);
					ARSnova.app.getController('Motds').showMotds(motds, 0);
				}
			});
		}
	},

	areLocalStorageLoginVarsUninitialized: function () {
		return localStorage.getItem('role') == null
			|| localStorage.getItem('loginMode') == null
			|| localStorage.getItem('login') == null;
	},

	checkPreviousLogin: function () {
		console.debug("Application: checkPreviousLogin");
		if (ARSnova.app.areLocalStorageLoginVarsUninitialized()) {
			return false;
		}
		if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
			localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
			localStorage.removeItem('lastVisitedRole');
			localStorage.removeItem('sessionId');
			sessionStorage.removeItem('keyword');
		}

		ARSnova.app.loggedIn = true;
		ARSnova.app.loginMode = localStorage.getItem('loginMode');
		ARSnova.app.userRole = localStorage.getItem('role');
		ARSnova.app.setWindowTitle();
		ARSnova.app.afterLogin();

		return true;
	},

	setWindowTitle: function (addition) {
		if (!addition) {
			addition = '';
		}

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

	showMask: function (mask, duration) {
		var minimumDuration =  800;

		Ext.Viewport.setMasked(mask);
		this.maskedMessage = mask.message;
		var hideLoadMask = Ext.Function.createDelayed(function (message) {
			if (this.maskedMessage === message) {
				Ext.Viewport.setMasked(false);
			}
		}, minimumDuration, this, [mask.message]);

		Ext.defer(hideLoadMask, (duration || 5000) - minimumDuration);
		return hideLoadMask;
	},

	/**
	 * Wrapper for an individual loading mask
	 */
	showLoadMask: function (message, duration) {
		return this.showMask({
			xtype: 'loadmask',
			message: message || ""
		}, duration);
	},

	/**
	 * Wrapper for an individual load indicator
	 */
	showLoadIndicator: function (message, duration) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var indicatorCls = 'x-loading-mask customLoadingIndicator ' +
			(screenWidth < 720 ? 'overlayLoadingIndicator' : 'toolbarLoadingIndicator');

		return this.showMask({
			xtype: 'loadmask',
			baseCls: '',
			top: 'initial',
			right: 'initial',
			cls: indicatorCls,
			message: message || '',
			bottom: screenWidth < 720 ? '60px' : '4px'
		}, duration);
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
		if (!this.getController('Application').checkForPrivacyMode()) {
			return;
		}

		if (!localStorage.getItem('lectureQuestionIds')) {
			localStorage.setItem('lectureQuestionIds', "[]");
		}

		if (!localStorage.getItem('preparationQuestionIds')) {
			localStorage.setItem('preparationQuestionIds', "[]");
		}

		if (!localStorage.getItem('loggedIn')) {
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
		if (tmp.length * 2 < sessionID.length) {
			tmp.push(sessionID[tmp.length * 2]);
		}
		return tmp.join(" ");
	}
});
