/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app.js
 - Beschreibung: Einstiegsseite für ARSnova.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/

Ext.application({
	
	requires: [].concat(
			/* custom arsnova requires */
			['ARSnova.BrowserSupport', 'ARSnova.proxy.RestProxy', 'ARSnova.WebSocket', 'Ext.plugins.ResizableTextArea'],
			
			/* 
			 * sencha touch library requires 
			 */
			['Ext.Img', 'Ext.Label', 'Ext.TitleBar', 'Ext.data.JsonStore', 'Ext.dataview.List'],
			['Ext.SegmentedButton', 'Ext.field.Spinner', 'Ext.field.Toggle', 'Ext.field.TextArea'],
			
			/* chart requires */
			['Ext.chart.CartesianChart'],
			['Ext.draw.gradient.Linear']
	),

	startupImage: {
		'320x460' : 'resources/images/ARSnova_Grafiken/03_Launchimage_320x460px.png', // iPhone (3.5" non-retina)
		'640x920' : 'resources/images/ARSnova_Grafiken/03_Launchimage_640x920px.png', // iPhone (3.5" retina)
		'640x1096': 'resources/images/ARSnova_Grafiken/03_Launchimage_640x1096px.png', // iPhone (4" retina)
		'768x1004': 'resources/images/ARSnova_Grafiken/03_Launchimage_768x1004px.png', // iPad (portrait)
		'748x1024': 'resources/images/ARSnova_Grafiken/03_Launchimage_748x1024px.png' // iPad (landscape)
	},
	/*viewport: {
        autoMaximize: Ext.os.is.iOS && !Ext.browser.is.webview && Ext.browser.version.isGreaterThan(3) && Ext.browser.version.isLessThan(7)
    },*/
	icon: {
		57: 'resources/images/ARSnova_Grafiken/01_AppIcon_57x57px.png',
		72: 'resources/images/ARSnova_Grafiken/01_AppIcon_72x72px.png',
		114: 'resources/images/ARSnova_Grafiken/01_AppIcon_114x114px.png'
	},
	
    name: "ARSnova",
    /* const */
    WEBAPP			: 'webapp',
    NATIVE			: 'native',
    APP_URL			: window.location.origin + window.location.pathname,
    WEBSERVICE_URL	: "app/webservices/",
    PRESENTER_URL	: "/presenter/",
    
	LOGIN_GUEST		: "0",
	LOGIN_THM		: "1",
	LOGIN_OPENID	: "2",
	LOGIN_TWITTER	: "3",
	LOGIN_FACEBOOK	: "4",
	LOGIN_GOOGLE	: "5",
	
	USER_ROLE_STUDENT: "0",
	USER_ROLE_SPEAKER: "1",
    
    isIconPrecomposed: true,
    icon: 'resources/images/ARSnova_Grafiken/01_AppIcon_114x114px.png',

    models: [].concat(
    		['Answer', 'Feedback', 'LoggedIn', 'Question', 'Session', 'Statistic', 'Course'],
    		['Auth', 'FeedbackQuestion']),
    
    views: [].concat(
    		
    		/* app/view */
    		['Caption', 'LoginPanel', 'MainTabPanel', 'TabPanel', 'RolePanel', 'MathJaxField', 'CustomMask'], 
    		['CustomMessageBox', 'MultiBadgeButton', 'MatrixButton', 'NumericKeypad', 'FreetextAnswerPanel', 'FreetextDetailAnswer'],
    		['FreetextQuestion', 'Question', 'QuestionStatusButton', 'SessionStatusButton', 'TextCheckfield'],
    		
    		/* app/view/about */
    		['about.TabPanel'],
    		
    		/* app/view/diagnosis */
    		['diagnosis.DiagnosisPanel'],
    		['diagnosis.StatisticsPanel'],
    		['diagnosis.TabPanel'],
    		
    		/* app/view/feedback */
    		['feedback.AskPanel', 'feedback.StatisticPanel', 'feedback.TabPanel', 'feedback.VotePanel'],
    		
    		/* app/view/feedbackQuestions */
    		['feedbackQuestions.DetailsPanel', 'feedbackQuestions.QuestionsPanel', 'feedbackQuestions.TabPanel'],
    		
    		/* app/view/home */  
    		['home.HomePanel', 'home.MySessionsPanel', 'home.NewSessionPanel', 'home.TabPanel'],
    		
    		/* app/view/speaker */
    		['speaker.AudienceQuestionPanel', 'speaker.InClass', 'speaker.NewQuestionPanel', 'speaker.QuestionDetailsPanel'],
    		['speaker.QuestionStatisticChart', 'speaker.ShowcaseQuestionPanel', 'speaker.TabPanel'],
    		
    		/* app/view/user */
    		['user.InClass', 'user.QuestionPanel', 'user.TabPanel']),
	
    controllers: ['Auth', 'Feedback', 'Lang', 'Questions', 'FlashcardQuestions', 'PreparationQuestions', 'Sessions'],
    
    /* items */
    mainTabPanel: null,
    tabPanel	: null,
    loginPanel	: null,
    taskManager	: null,
    previousActiveItem: null,
    
    /* infos */
    loginMode		: null,  /* ARSnova.app.LOGIN_GUEST, ... */
    appStatus		: null,	 /* ARSnova.app.WEBAPP || ARSnova.app.NATIVE */
    isSessionOwner	: false, /* boolean */
    loggedIn		: false, /* boolean */
    userRole		: null,  /* ARSnova.app.USER_ROLE_STUDENT || ARSnova.app.USER_ROLE_SPEAKER */
    isNative		: function () { return this.appStatus === this.NATIVE; },
    isWebApp		: function () { return this.appStatus === this.WEBAPP; },
    
    /* models */
    answerModel 	: null,
    feedbackModel	: null,
    loggedInModel	: null,
    questionModel	: null,
    sessionModel 	: null,
    statisticModel 	: null,
    courseModel     : null,
    
    /* proxy */
	restProxy		: null,
	
    /* other*/
    cardSwitchDuration: 500,
    socket: null,
    
    /* tasks */
	/**
	 * update every x seconds the user timestamp
	 * important for all "who is online"-requests
	 */
	loggedInTask: {
		name: 'save that user is logged in',
		run: function() {
			if (localStorage.getItem('keyword')) {
				ARSnova.app.restProxy.loggedInTask();
			}
		},
		interval: 60000 //60 seconds
	},
	
	/**
	 * update every x seconds the owner of a session is logged in
	 */
	updateSessionActivityTask: {
		name: 'save that owner of a session is logged in',
		run: function() {
			if (localStorage.getItem('keyword')) {
				ARSnova.app.restProxy.updateSessionActivityTask();
			}
		},
		interval: 180000 //180 seconds
	},
	
    /**
     * initialize models
     */
    initModels: function() {
    	this.answerModel 		= Ext.create('ARSnova.model.Answer');
    	this.authModel			= Ext.create('ARSnova.model.Auth');
    	this.feedbackModel		= Ext.create('ARSnova.model.Feedback');
    	this.loggedInModel		= Ext.create('ARSnova.model.LoggedIn');
    	this.questionModel		= Ext.create('ARSnova.model.Question');
    	this.sessionModel		= Ext.create('ARSnova.model.Session');
    	this.statisticModel 	= Ext.create('ARSnova.model.Statistic');
    	this.courseModel		= Ext.create('ARSnova.model.Course');
    },
    
    /**
     * This is called automatically when the page loads. Here we set up the main component on the page
     */
    launch: function(){
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();
    	
    	// Use native application update depending on manifest file changes on startup
		/*var appCache = window.applicationCache;
		if (appCache.status !== appCache.UNCACHED) {
			appCache.update();
		}*/
		
		window.addEventListener('load', function(e) {
			window.applicationCache.addEventListener('updateready', function(e) {
				if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
					// New version of ARSnova detected, swap in new chache
					window.applicationCache.swapCache();
					Ext.Msg.confirm(Messages.NEW_VERSION_TITLE, Messages.NEW_VERSION_AVAILABLE, function(answer) {
						if (answer == 'yes') {
							window.location.reload();
						}
					});
				}
			}, false);
		}, false);
		
		this.checkLocalStorage();
		this.checkBrowser();
		
		taskManager = new TaskRunner();
		
		this.initSocket();
		this.initModels();
		this.restProxy = Ext.create('ARSnova.proxy.RestProxy'); 
		this.mainTabPanel = Ext.create('ARSnova.view.MainTabPanel');
		
		/* check previous login */
		ARSnova.app.getController('Auth').checkLogin();
	},

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },
	
	initSocket: function() {
		this.socket = Ext.create('ARSnova.WebSocket');
	},
	
	/**
	 * after user has logged in
	 * start some tasks and show the correct homepage to user
	 */
	afterLogin: function(){
		taskManager.start(ARSnova.app.loggedInTask);
		ARSnova.app.loggedInTask.run(); // fire immediately
		
		/* show diagnosis tab panel */
		ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.tab.show();
		
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.homeTabPanel, 'slide');
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
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
		
		if (localStorage.getItem("keyword") !== null && localStorage.getItem("keyword") !== "") {
			return ARSnova.app.getController('Sessions').login({
				keyword: localStorage.getItem("keyword")
			});
		}
    },
    
    /**
     * returns true if user is logged in a session
     */
    checkSessionLogin: function(){
    	if(localStorage.getItem('sessionId') == undefined || localStorage.getItem('sessionId') == "")
    		return false;
    	else
    		return true;
    },
    
	checkPreviousLogin: function(){
		var isLocalStorageUninitialized = localStorage.getItem('role') == null
									   || localStorage.getItem('loginMode') == null
									   || localStorage.getItem('login') == null;
		if (isLocalStorageUninitialized) return false;
		
		ARSnova.app.loggedIn = true;
		ARSnova.app.loginMode = localStorage.getItem('loginMode');
		ARSnova.app.userRole = localStorage.getItem('role');
		ARSnova.app.setWindowTitle();
		ARSnova.app.afterLogin();
	},

	setWindowTitle: function() {
		switch (ARSnova.app.userRole) {
			case ARSnova.app.USER_ROLE_SPEAKER:
				window.document.title = "ARSnova: " + Messages.SPEAKER;
				break;
			case ARSnova.app.USER_ROLE_STUDENT:
				window.document.title = "ARSnova: " + Messages.STUDENT;
				break;
			default:
				window.document.title = "ARSnova";
				break;
		}
	},
	
	/**
	 * Wrapper for an invidivudal LoadMask
	 */
	showLoadMask: function(message, duration) {
		var minimumDuration = 500;
		var loadingMask = new Ext.LoadMask({
			message: message || ""
		});
		Ext.Viewport.add(loadingMask);
		loadingMask.show();
		var hideLoadMask = Ext.Function.createDelayed(function() {
			loadingMask.hide();
			loadingMask.destroy();
		}, minimumDuration);
		Ext.defer(hideLoadMask, (duration || 5000) - minimumDuration);
		return hideLoadMask;
	},
    
    /**
     * clear local storage
     */
    cleanLocalStorage: function(){
    	localStorage.clear();
    },
    
    /**
     * check if string is valid json
     */
    isJsonString: function(str){
        try {
            JSON.parse(str);
        } catch (e){
            return false;
        }
        return true;
    },
	
	/**
	 * make localStorage ready 
	 */
	checkLocalStorage: function(){
		if (localStorage.getItem('lastVisitedSessions') == null){
			localStorage.setItem('lastVisitedSessions', "[]");
		}
		
		if (localStorage.getItem('questionIds') == null){
			localStorage.setItem('questionIds', "[]");
		}
		
		if (localStorage.getItem('loggedIn') == null){
			localStorage.setItem('loggedIn', "[]");
		}
		
		if (localStorage.getItem('user has voted')) {
			localStorage.removeItem('user has voted');
		}
		
		if (localStorage.getItem('session')) {
			localStorage.removeItem('session');
		}
		
		localStorage.setItem('sessionId', "");
		return true;
	},
	
	checkBrowser: function() {
		var support = Ext.create('ARSnova.BrowserSupport');
		support.isBrowserSupported(function updateRequired(browserName, requiredVersion) {
			alert(Messages.UPDATE_BROWSER_MESSAGE.replace(/###/, browserName));
		}, function browserUnsupported(requiredBrowsers) {
			alert(Messages.BROWSER_NOT_SUPPORTED_MESSAGE.replace(/###/, requiredBrowsers.join(", ")));
		});
	},

    formatSessionID: function(sessionID){
		var tmp = [];
		for(var i = 0; i < sessionID.length; i++){
			if(i % 2){
				tmp.push(sessionID.substr(i - 1, 2));
			}
		}
		if(tmp.length * 2 < sessionID.length) tmp.push(sessionID[tmp.length * 2]);
		return tmp.join(" ");
	},
	
	removeVisitedSession: function(sessionId){
		var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
		for ( var i = 0; i < sessions.length; i++){
			var session = sessions[i];
			if (sessionId == session._id){
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
};
