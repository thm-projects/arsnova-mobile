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

Ext.regApplication({
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
	
	CANTEEN_LOCATION: "THM Mensa Gießen",
	CANTEEN_DAY		: "01.03.2013",
    
    glossOnIcon: false,
    icon: 'resources/images/ARSnova_Grafiken/01_AppIcon_114x114px.png',

    /* items */
    mainTabPanel: null,
    tabPanel	: null,
    loginPanel	: null,
    loadingMask : null,
    taskManager	: null,
    previousActiveItem: null,
    
    /* infos */
    loginMode		: null,  /* ARSnova.LOGIN_GUEST, ... */
    appStatus		: null,	 /* ARSnova.WEBAPP || ARSnova.NATIVE */
    isSessionOwner	: false, /* boolean */
    loggedIn		: false, /* boolean */
    userRole		: null,  /* ARSnova.USER_ROLE_STUDENT || ARSnova.USER_ROLE_SPEAKER */
    isNative		: function () { return this.appStatus === this.NATIVE; },
    isWebApp		: function () { return this.appStatus === this.WEBAPP; },
    
    /* models */
    answerModel 	: null,
    feedbackModel	: null,
    foodVoteModel	: null,
    loggedInModel	: null,
    questionModel	: null,
    sessionModel 	: null,
    statisticModel 	: null,
    courseModel     : null,
    
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
				restProxy.loggedInTask();
			}
		},
		interval: 60000 //60 seconds
	},
	
	/**
	 * update every x seconds the owner of a session is logged in
	 */
	updateSessionActivityTask: {
		name: 'save that owner of a session is logged in',
		run: function(){
			restProxy.updateSessionActivityTask();
		},
		interval: 180000 //180 seconds
	},
    
    /**
     * This is called automatically when the page loads. Here we set up the main component on the page
     */
    launch: function(){
    	// Use native application update depending on manifest file changes on startup
		var appCache = window.applicationCache;
		if (appCache.status !== appCache.UNCACHED) {
			appCache.update();
		}
		
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
					Ext.Msg.doComponentLayout();
				}
			}, false);
		}, false);
    	
		if (!this.checkWebKit()) return;
		if (!this.checkLocalStorage()) return;
		this.checkEstudyURL();
		this.setupAppStatus();

		taskManager = new Ext.util.TaskRunner();
		
		this.initSocket();
		this.initModels();
		
		this.mainTabPanel = new ARSnova.views.MainTabPanel();
		if (localStorage.getItem("ARSnovaCon") !== "true") {
			this.checkPreviousLogin();
		}
	},

	setupAppStatus: function() {
		this.appStatus = (navigator.device == null) ? this.WEBAPP : this.NATIVE;
	},
    
    /**
     * initialize models
     */
    initModels: function(){
    	this.answerModel 		= new ARSnova.models.Answer();
    	this.feedbackModel 		= new ARSnova.models.Feedback();
    	this.foodVoteModel 		= new ARSnova.models.FoodVote();
    	this.loggedInModel 		= new ARSnova.models.LoggedIn();
    	this.questionModel		= new ARSnova.models.Question();
    	this.sessionModel 		= new ARSnova.models.Session();
    	this.statisticModel 	= new ARSnova.models.Statistic();
    	this.courseModel		= new ARSnova.models.Course();
    },
    
    initSocket: function() {
    	this.socket = new ARSnova.Socket();
    },
    
    /**
     * check browser-engine
     */
    checkWebKit: function() {
        var result = /AppleWebKit\/([\d.]+)/.exec(navigator.userAgent);
        if (!result) {
        	alert(Messages.SUPPORTED_BROWSERES);
        	return false;
        } else {
        	return true;
        }
    },
	
	/**
	 * after user has logged in
	 * start some tasks and show the correct homepage to user
	 */
	afterLogin: function(){
		taskManager.start(ARSnova.loggedInTask);
		taskManager.start(ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.updateCanteenBadgeIconTask);
		
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.homeTabPanel, 'slide');
		var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
		switch (ARSnova.userRole) {
			case ARSnova.USER_ROLE_STUDENT:
				hTP.homePanel.checkLogin();
				hTP.setActiveItem(hTP.homePanel);
				break;
			case ARSnova.USER_ROLE_SPEAKER:
				hTP.setActiveItem(hTP.mySessionsPanel);
				hTP.mySessionsPanel.fireEvent('activate');
				break;
			default:
				break;
		}
		
		if (localStorage.getItem("keyword") !== null && localStorage.getItem("keyword") !== "") {
			return Ext.dispatch({
				controller: "sessions",
				action: "login",
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
    
    getGetVariable: function(variable){
    	HTTP_GET_VARS = new Array();
    	strGET = document.location.search.substr(1,document.location.search.length);
    	if(strGET != ''){
    	    gArr = strGET.split('&');
    	    for(i = 0; i < gArr.length; ++i){
    	        v = '';
    	        vArr = gArr[i].split('=');
    	        if(vArr.length > 1){
    	        	v = vArr[1];
    	        }
    	        HTTP_GET_VARS[unescape(vArr[0])] = unescape(v);
	        }
	    }
    	
    	if(!HTTP_GET_VARS[variable]){
    		return 'undefined';
    	} else {
			return HTTP_GET_VARS[variable];
    	}
    },
	
	checkPreviousLogin: function(){
		var isLocalStorageUninitialized = localStorage.getItem('role') == null
									   || localStorage.getItem('loginMode') == null
									   || localStorage.getItem('login') == null;
		if (isLocalStorageUninitialized) return false;
		
		ARSnova.loggedIn = true;
		ARSnova.loginMode = localStorage.getItem('loginMode');
		ARSnova.userRole = localStorage.getItem('role');
		ARSnova.setWindowTitle();
		ARSnova.afterLogin();
	},

    setWindowTitle: function(){
		switch (ARSnova.userRole) {
			case ARSnova.USER_ROLE_SPEAKER:
				window.document.title = "ARSnova: Dozent/in";
				break;
			case ARSnova.USER_ROLE_STUDENT:
				window.document.title = "ARSnova: Zuhörer/in";
				break;
			default:
				window.document.title = "ARSnova";
				break;
		}
    },
    
    /**
     * Wrapper for an invidivudal LoadMask
     */
    showLoadMask: function(message){
    	this.loadingMask = new Ext.LoadMask(Ext.getBody(), {
    		msg: message || ""
    	});
    	this.loadingMask.show();
    	setTimeout("ARSnova.hideLoadMask()", 5000); // hide this mask after 5 seconds automatically
    },
    
    /**
     * Wrapper for an invidivudal LoadMask
     */
    hideLoadMask: function(){
    	if(this.loadingMask){
    		clearTimeout("ARSnova.hideLoadMask()", 5000);
    		this.loadingMask.hide();
	    	this.loadingMask.destroy();
    	}
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
     * for correct protocol, if arsnova is called inside estudy
     */
    checkEstudyURL: function(){
    	if (window.location.host.indexOf("estudy") != -1 && window.location.protocol == "http:"){
    		window.location = "https://" + window.location.hostname + "/arsnova";
    	}
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
    
    initFoodStore: function(){
    	var foodStore = Ext.getStore("Food");
    	if(ARSnova.config.menu1 != null && ARSnova.config.menu1 != "")
    		foodStore.add({
    			name: ARSnova.config.menu1,
    			value: 0
    		});
    	if(ARSnova.config.menu2 != null && ARSnova.config.menu2 != "")
    		foodStore.add({
    			name: ARSnova.config.menu2,
    			value: 0
    		});
    	if(ARSnova.config.menu3 != null && ARSnova.config.menu3 != "")
    		foodStore.add({
    			name: ARSnova.config.menu3,
    			value: 0
    		});
    	if(ARSnova.config.menu4 != null && ARSnova.config.menu4 != "")
    		foodStore.add({
    			name: ARSnova.config.menu4,
    			value: 0
    		});
    	if(ARSnova.config.menu5 != null && ARSnova.config.menu5 != "")
    		foodStore.add({
    			name: ARSnova.config.menu5,
    			value: 0
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