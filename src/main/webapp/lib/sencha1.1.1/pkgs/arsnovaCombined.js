Ext.regApplication({
    name: "ARSnova",
    /* const */
    WEBAPP			: 'webapp',
    NATIVE			: 'native',
    APP_URL			: window.location.origin + window.location.pathname,
    WEBSERVICE_URL	: "app/webservices/",
    
	LOGIN_GUEST		: "0",
	LOGIN_THM		: "1",
	LOGIN_OPENID	: "2",
	LOGIN_TWITTER	: "3",
	LOGIN_FACEBOOK	: "4",
	LOGIN_GOOGLE	: "5",
	
	USER_ROLE_STUDENT: "0",
	USER_ROLE_SPEAKER: "1",
    
    glossOnIcon: false,
    icon: 'resources/images/ARSnova_Grafiken/01_AppIcon_114x114px.png',
    phoneStartupScreen: 'resources/images/ARSnova_Grafiken/03_Launchimage_320x460px.png',
    tabletStartupScreen: 'resources/images/ARSnova_Grafiken/03_Launchimage_768x1004px.png',

    /* items */
    mainTabPanel: null,
    tabPanel	: null,
    loginPanel	: null,
    loadingMask : null,
    taskManager	: null,
    previousActiveItem: null,
    
    /* infos */
    loginMode		: null,  /* ARSnova.LOGIN_GUEST, ... */
    appStatus		: null,	 /* ARSnova.WEBAPP || ARSnova.WEBAPP */
    isSessionOwner	: false, /* boolean */
    loggedIn		: false, /* boolean */
    userRole		: null,  /* ARSnova.USER_ROLE_STUDENT || ARSnova.USER_ROLE_SPEAKER */
    
    /* models */
    answerModel 	: null,
    feedbackModel	: null,
    foodVoteModel	: null,
    loggedInModel	: null,
    questionModel	: null,
    sessionModel 	: null,
    statisticModel 	: null,
    userRankingModel: null,
    
    /* other*/
    cardSwitchDuration: 500,
    
    /* tasks */
    cleanFeedbackVotes: {
    	name: 'looking for feedbacks that have to be remove',
		run: function(){
			restProxy.cleanSessionFeedback();
		},
		interval: 60000, //60 seconds
	},
	
	loggedInTask: {
		name: 'save that user is logged in',
		run: function(){
			restProxy.loggedInTask();
		},
		interval: 60000, //60 seconds
	},
    
    /**
     * This is called automatically when the page loads. Here we set up the main component on the page
     */
    launch: function(){
    	if (!this.checkWebKit()) return;
    	if (!this.checkLocalStorage()) return;
    	this.checkEstudyURL();
    	
    	taskManager = new Ext.util.TaskRunner();
    	
    	this.initModels();
    	this.checkAppStatus();
    	
    	this.mainTabPanel = new ARSnova.views.MainTabPanel();
    	this.checkPreviousLogin();
    	this.checkFullscreen();
    	
   		this.initFoodStore();
    },
    
    initModels: function(){
    	this.answerModel 		= new ARSnova.models.Answer();
    	this.feedbackModel 		= new ARSnova.models.Feedback();
    	this.foodVoteModel 		= new ARSnova.models.FoodVote();
    	this.loggedInModel 		= new ARSnova.models.LoggedIn();
    	this.questionModel		= new ARSnova.models.Question();
    	this.sessionModel 		= new ARSnova.models.Session();
    	this.statisticModel 	= new ARSnova.models.Statistic();
    	this.userRankingModel 	= new ARSnova.models.UserRanking();    	
    },
    
    checkWebKit: function() {
        var result = /AppleWebKit\/([\d.]+)/.exec(navigator.userAgent);
        if (!result) {
        	alert("Für eine korrekte Darstellung von ARSnova benutzen Sie bitte einen WebKit-Browser, z.B. Apple Safari oder Google Chrome!");
        	return false;
        } else {
        	return true;
        }
    },
    
    /*
	 * Detect: If the application is not run in full screen mode on an apple
	 * device, notify user how to add app to home screen for full screen mode.
	 */ 
    checkFullscreen: function(){
		if (localStorage.getItem('html5 info readed') == null){
    		if (!this.popup){
    			this.popup = new ARSnova.views.CheckFullscreenPanel();
    		}
    		
    		this.popup.show('fade');
    	}
    },
    
    afterLogin: function(){
    	taskManager.start(ARSnova.loggedInTask);
    	taskManager.start(ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.updateCanteenBadgeIconTask);
    	
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
		};
		ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, 'slide');
    },
    
    checkAppStatus: function(){
    	if (navigator.device == null){
    		this.appStatus = this.WEBAPP;
    	} else {
    		this.appStatus = this.NATIVE;
    	}
    },
    
    isNative: function(){
    	return this.appStatus == this.NATIVE;
    },
    
    /**
     * returns true if logged in
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
    	if (localStorage.getItem('role') == null || localStorage.getItem('loginMode') == null || localStorage.getItem('login') == null) return false;
    	
    	ARSnova.loggedIn = true;
    	ARSnova.loginMode = localStorage.getItem('loginMode');
    	ARSnova.userRole = localStorage.getItem('role');
    	ARSnova.afterLogin();
    },
    
    /* Individual global LoadMask */
    showLoadMask: function(message){
    	this.loadingMask = new Ext.LoadMask(Ext.getBody(), {
    		msg: message
    	});
    	this.loadingMask.show();
    	setTimeout("ARSnova.hideLoadMask()", 5000); // hide this mask after 5 seconds automatically
    },
    
    hideLoadMask: function(){
    	if(this.loadingMask){
    		clearTimeout("ARSnova.hideLoadMask()", 5000);
    		this.loadingMask.hide();
	    	this.loadingMask.destroy();
    	}
    },
    
    sync: function(){
    	database.getNewData();
    },
    
    cleanLocalStorage: function(){
    	localStorage.clear();
    },
    
    isJsonString: function(str){
        try {
            JSON.parse(str);
        } catch (e){
            return false;
        }
        return true;
    },
    
    checkEstudyURL: function(){
    	if (window.location.host.indexOf("estudy") != -1 && window.location.protocol == "http:"){
    		window.location = "https://" + window.location.hostname + "/arsnova";
    	}
    },
    
    checkLocalStorage: function(){
//    	try {
    		if (localStorage.getItem('lastVisitedSessions') == null){
    			localStorage.setItem('lastVisitedSessions', "[]");
    		}
    		if (localStorage.getItem('questionIds') == null){
    			localStorage.setItem('questionIds', "[]");
    		}
    		if (localStorage.getItem('loggedIn') == null){
    			localStorage.setItem('loggedIn', "[]");
    		}
    		localStorage.setItem('sessionId', "");
    		
    		if (localStorage.getItem('user has voted'))
    			localStorage.removeItem('user has voted');
//		} catch (e) {
//			 if (e.name == "QUOTA_EXCEEDED_ERR") {
//				 console.log("Quota_Exceeded_Error");
//				 Ext.Msg.alert("Hinweis", "Ihr Browser meldet einen Fehler: <br>\"Quota_Exceeded_Error\"<br> ARSnova kann nicht ausgeführt werden.");
//				 Ext.Msg.doComponentLayout();
//				 return false;
//			}
//		}
    	
		return true;
    },
    
    initFoodStore: function(){
    	var foodStore = Ext.getStore("Food");
    	if(ARSnova.config.menu1 != null && ARSnova.config.menu1 != "")
    		foodStore.add({
    			name: ARSnova.config.menu1,
    			value: 0,
    		});
    	if(ARSnova.config.menu2 != null && ARSnova.config.menu2 != "")
    		foodStore.add({
    			name: ARSnova.config.menu2,
    			value: 0,
    		});
    	if(ARSnova.config.menu3 != null && ARSnova.config.menu3 != "")
    		foodStore.add({
    			name: ARSnova.config.menu3,
    			value: 0,
    		});
    	if(ARSnova.config.menu4 != null && ARSnova.config.menu4 != "")
    		foodStore.add({
    			name: ARSnova.config.menu4,
    			value: 0,
    		});
    },
    
    formatSessionID: function(sessionID){
		var tmp = [];
		for(var i = 0; i < sessionID.length; i++){
			if(i % 2){
				tmp.push(sessionID.substr(i - 1, 2));
			}
		}
		if(tmp.length * 2 < sessionID.length) tmp.push(sessionID[tmp.length * 2])
		return tmp.join(" ");
	},
	
	saveLastVisitedSession: function(sessionObj){
		//save session as one of five lastVisitedSessions in localStorage
		var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
		var alreadyCreated = false;
		for ( var i = 0; i < sessions.length; i++){
			var session = sessions[i];
			if (sessionObj._id == session._id){
				alreadyCreated = i;
				break;
			}
		}
		if (sessions.length == 5){
			if (alreadyCreated !== false){
				sessions.splice(alreadyCreated, 1);
			} else {
				sessions.pop();
			}
			sessions.unshift(sessionObj);
		} else {
			if (alreadyCreated !== false){
				sessions.splice(alreadyCreated, 1);
			}
			sessions.unshift(sessionObj);
		}
		localStorage.setItem('lastVisitedSessions', Ext.encode(sessions));
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
	},
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
/**
 * The routes.js file connects local urls (e.g. http://mydomain.com/#someUrl) to a controller action.
 * This allows the application to reinitialize itself if it is refreshed, and provides in-application
 * history support. Sample usage:
 * 
 * We only need a single route in the Twitter application - this always goes through to the show search
 * action and enables the application to restore the application state when the user refreshes.
 * 
 */

Ext.Router.draw(function(map) {
	 map.connect(':controller/:action/:username');
	 
	 map.connect('canteen', {controller: 'canteen', action: 'show'});
	 map.connect('canteenVote', {controller: 'canteen', action: 'showVotePanel'});
});

Ext.util.TaskRunner = function(interval) {
    interval = interval || 10;
    var tasks = [],
    removeQueue = [],
    id = 0,
    running = false,
    debug = false,

    //private
    stopThread = function() {
        running = false;
        clearInterval(id);
        id = 0;
    },

    // private
    startThread = function() {
        if (!running) {
            running = true;
            id = setInterval(runTasks, interval);
        }
    },

    // private
    removeTask = function(t) {
    	/*
    	 * removeQueue.push(t);
    	 */       
    	Ext.Array.remove(tasks, t);
    	
        if (t.onStop) {
            t.onStop.apply(t.scope || t);
        }
    },

    // private
    runTasks = function() {
        var rqLen = removeQueue.length,
            now = new Date().getTime(),
            i;

        if (rqLen > 0) {
            for (i = 0; i < rqLen; i++) {
                Ext.Array.remove(tasks, removeQueue[i]);
            }
            removeQueue = [];
            if (tasks.length < 1) {
                stopThread();
                return;
            }
        }
        i = 0;
        var t,
            itime,
            rt,
            len = tasks.length;
        for (; i < len; ++i) {
            t = tasks[i];
            itime = now - t.taskRunTime;
            if (t.interval <= itime) {
                rt = t.run.apply(t.scope || t, t.args || [++t.taskRunCount]);
                t.taskRunTime = now;
                if (rt === false || t.taskRunCount === t.repeat) {
                    removeTask(t);
                    return;
                }
            }
            if (t.duration && t.duration <= (now - t.taskStartTime)) {
                removeTask(t);
            }
        }
    };
    
    this.start = function(task) {
    	if(debug) console.log("starting task: " + task.name);
    	if(Ext.Array.contains(tasks, task)) return false;
        tasks.push(task);
        task.taskStartTime = new Date().getTime();
        task.taskRunTime = 0;
        task.taskRunCount = 0;
        startThread();
        return task;
    };

    this.stop = function(task) {
    	if(debug) console.log("stopping task: " + task.name);
        removeTask(task);
        return task;
    };

    this.stopAll = function() {
        stopThread();
        for (var i = 0, len = tasks.length; i < len; i++) {
            if (tasks[i].onStop) {
                tasks[i].onStop();
            }
        }
        tasks = [];
        removeQueue = [];
    };
    
    this.getTasks = function() {
    	console.log(tasks);
    };
};
/**
 * @class Ext.plugins.ResizableTextArea
 * @extends Ext.form.TextArea
 *
 */

Ext.plugins.ResizableTextArea = Ext.extend(Ext.form.TextArea, {

	/**
	 * @cfg {Integer} maxHeight
	 * Maximum height of TextArea.
	 */
	maxHeight: -1,
	
	constructor: function (config) {
		Ext.plugins.ResizableTextArea.superclass.constructor.call(this, config);
		this.on('afterrender', function () {
			this.onKeyUp(null, Ext.DomQuery.select('textarea', this.el.dom)[0]);
		});
	},
	
	/**
	 * Resizes the textArea whenever the content is larger than than it's height
	 */
	onKeyUp: function(event, textarea) {
		//console.log('keyup', arguments);
		/* Default max height */
		/* Don't let it grow over the max height */
		if ((this.maxHeight > -1) && (textarea.scrollHeight > this.maxHeight)) {
			/* Add the scrollbar back and bail */
			if (textarea.style.overflowY != 'scroll') {
				textarea.style.overflowY = 'scroll';
			}
			return;
		}
		/* Make sure element does not have scroll bar to 
		prevent jumpy-ness */
		if (textarea.style.overflowY != 'hidden') {
			textarea.style.overflowY = 'hidden';
		}
		/* Now reset and adjust the height */
		textarea.style.height = 0;
		
		var scrollH = textarea.scrollHeight;
		
		if (scrollH > textarea.style.height.replace(/[^0-9]/g, '')) {
			textarea.style.height = scrollH+'px';
		}
	}

});
/**
 * @class Ext.Array
 * @singleton
 * @author Jacky Nguyen <jacky@sencha.com>
 * @docauthor Jacky Nguyen <jacky@sencha.com>
 *
 * A set of useful static methods to deal with arrays; provide missing methods for older browsers.
 */
(function() {

    var arrayPrototype = Array.prototype,
        slice = arrayPrototype.slice,
        supportsSplice = function () {
            var array = [],
                lengthBefore,
                j = 20;

            if (!array.splice) {
                return false;
            }

            // This detects a bug in IE8 splice method:
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");

            lengthBefore = array.length; //41
            array.splice(13, 0, "XXX"); // add one element

            if (lengthBefore+1 != array.length) {
                return false;
            }
            // end IE8 bug

            return true;
        }(),
        supportsForEach = 'forEach' in arrayPrototype,
        supportsMap = 'map' in arrayPrototype,
        supportsIndexOf = 'indexOf' in arrayPrototype,
        supportsEvery = 'every' in arrayPrototype,
        supportsSome = 'some' in arrayPrototype,
        supportsFilter = 'filter' in arrayPrototype,
        supportsSort = function() {
            var a = [1,2,3,4,5].sort(function(){ return 0; });
            return a[0] === 1 && a[1] === 2 && a[2] === 3 && a[3] === 4 && a[4] === 5;
        }(),
        supportsSliceOnNodeList = true,
        ExtArray;

    try {
        // IE 6 - 8 will throw an error when using Array.prototype.slice on NodeList
        if (typeof document !== 'undefined') {
            slice.call(document.getElementsByTagName('body'));
        }
    } catch (e) {
        supportsSliceOnNodeList = false;
    }

    function fixArrayIndex (array, index) {
        return (index < 0) ? Math.max(0, array.length + index)
                           : Math.min(array.length, index);
    }

    /*
    Does the same work as splice, but with a slightly more convenient signature. The splice
    method has bugs in IE8, so this is the implementation we use on that platform.

    The rippling of items in the array can be tricky. Consider two use cases:

                  index=2
                  removeCount=2
                 /=====\
        +---+---+---+---+---+---+---+---+
        | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
        +---+---+---+---+---+---+---+---+
                         /  \/  \/  \/  \
                        /   /\  /\  /\   \
                       /   /  \/  \/  \   +--------------------------+
                      /   /   /\  /\   +--------------------------+   \
                     /   /   /  \/  +--------------------------+   \   \
                    /   /   /   /+--------------------------+   \   \   \
                   /   /   /   /                             \   \   \   \
                  v   v   v   v                               v   v   v   v
        +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
        | 0 | 1 | 4 | 5 | 6 | 7 |       | 0 | 1 | a | b | c | 4 | 5 | 6 | 7 |
        +---+---+---+---+---+---+       +---+---+---+---+---+---+---+---+---+
        A                               B        \=========/
                                                 insert=[a,b,c]

    In case A, it is obvious that copying of [4,5,6,7] must be left-to-right so
    that we don't end up with [0,1,6,7,6,7]. In case B, we have the opposite; we
    must go right-to-left or else we would end up with [0,1,a,b,c,4,4,4,4].
    */
    function replaceSim (array, index, removeCount, insert) {
        var add = insert ? insert.length : 0,
            length = array.length,
            pos = fixArrayIndex(array, index);

        // we try to use Array.push when we can for efficiency...
        if (pos === length) {
            if (add) {
                array.push.apply(array, insert);
            }
        } else {
            var remove = Math.min(removeCount, length - pos),
                tailOldPos = pos + remove,
                tailNewPos = tailOldPos + add - remove,
                tailCount = length - tailOldPos,
                lengthAfterRemove = length - remove,
                i;

            if (tailNewPos < tailOldPos) { // case A
                for (i = 0; i < tailCount; ++i) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } else if (tailNewPos > tailOldPos) { // case B
                for (i = tailCount; i--; ) {
                    array[tailNewPos+i] = array[tailOldPos+i];
                }
            } // else, add == remove (nothing to do)

            if (add && pos === lengthAfterRemove) {
                array.length = lengthAfterRemove; // truncate array
                array.push.apply(array, insert);
            } else {
                array.length = lengthAfterRemove + add; // reserves space
                for (i = 0; i < add; ++i) {
                    array[pos+i] = insert[i];
                }
            }
        }

        return array;
    }

    function replaceNative (array, index, removeCount, insert) {
        if (insert && insert.length) {
            if (index < array.length) {
                array.splice.apply(array, [index, removeCount].concat(insert));
            } else {
                array.push.apply(array, insert);
            }
        } else {
            array.splice(index, removeCount);
        }
        return array;
    }

    function eraseSim (array, index, removeCount) {
        return replaceSim(array, index, removeCount);
    }

    function eraseNative (array, index, removeCount) {
        array.splice(index, removeCount);
        return array;
    }

    function spliceSim (array, index, removeCount) {
        var pos = fixArrayIndex(array, index),
            removed = array.slice(index, fixArrayIndex(array, pos+removeCount));

        if (arguments.length < 4) {
            replaceSim(array, pos, removeCount);
        } else {
            replaceSim(array, pos, removeCount, slice.call(arguments, 3));
        }

        return removed;
    }

    function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }

    var erase = supportsSplice ? eraseNative : eraseSim,
        replace = supportsSplice ? replaceNative : replaceSim,
        splice = supportsSplice ? spliceNative : spliceSim;

    // NOTE: from here on, use erase, replace or splice (not native methods)...

    ExtArray = Ext.Array = {
        /**
         * Iterates an array or an iterable value and invoke the given callback function for each item.
         *
         *     var countries = ['Vietnam', 'Singapore', 'United States', 'Russia'];
         *
         *     Ext.Array.each(countries, function(name, index, countriesItSelf) {
         *         console.log(name);
         *     });
         *
         *     var sum = function() {
         *         var sum = 0;
         *
         *         Ext.Array.each(arguments, function(value) {
         *             sum += value;
         *         });
         *
         *         return sum;
         *     };
         *
         *     sum(1, 2, 3); // returns 6
         *
         * The iteration can be stopped by returning false in the function callback.
         *
         *     Ext.Array.each(countries, function(name, index, countriesItSelf) {
         *         if (name === 'Singapore') {
         *             return false; // break here
         *         }
         *     });
         *
         * {@link Ext#each Ext.each} is alias for {@link Ext.Array#each Ext.Array.each}
         *
         * @param {Array/NodeList/Object} iterable The value to be iterated. If this
         * argument is not iterable, the callback function is called once.
         * @param {Function} fn The callback function. If it returns false, the iteration stops and this method returns
         * the current `index`.
         * @param {Object} fn.item The item at the current `index` in the passed `array`
         * @param {Number} fn.index The current `index` within the `array`
         * @param {Array} fn.allItems The `array` itself which was passed as the first argument
         * @param {Boolean} fn.return Return false to stop iteration.
         * @param {Object} scope (Optional) The scope (`this` reference) in which the specified function is executed.
         * @param {Boolean} reverse (Optional) Reverse the iteration order (loop from the end to the beginning)
         * Defaults false
         * @return {Boolean} See description for the `fn` parameter.
         */
        each: function(array, fn, scope, reverse) {
            array = ExtArray.from(array);

            var i,
                ln = array.length;

            if (reverse !== true) {
                for (i = 0; i < ln; i++) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }
            else {
                for (i = ln - 1; i > -1; i--) {
                    if (fn.call(scope || array[i], array[i], i, array) === false) {
                        return i;
                    }
                }
            }

            return true;
        },

        /**
         * Iterates an array and invoke the given callback function for each item. Note that this will simply
         * delegate to the native Array.prototype.forEach method if supported. It doesn't support stopping the
         * iteration by returning false in the callback function like {@link Ext.Array#each}. However, performance
         * could be much better in modern browsers comparing with {@link Ext.Array#each}
         *
         * @param {Array} array The array to iterate
         * @param {Function} fn The callback function.
         * @param {Object} fn.item The item at the current `index` in the passed `array`
         * @param {Number} fn.index The current `index` within the `array`
         * @param {Array}  fn.allItems The `array` itself which was passed as the first argument
         * @param {Object} scope (Optional) The execution scope (`this`) in which the specified function is executed.
         */
        forEach: function(array, fn, scope) {
            if (supportsForEach) {
                return array.forEach(fn, scope);
            }

            var i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                fn.call(scope, array[i], i, array);
            }
        },

        /**
         * Get the index of the provided `item` in the given `array`, a supplement for the
         * missing arrayPrototype.indexOf in Internet Explorer.
         *
         * @param {Array} array The array to check
         * @param {Object} item The item to look for
         * @param {Number} from (Optional) The index at which to begin the search
         * @return {Number} The index of item in the array (or -1 if it is not found)
         */
        indexOf: function(array, item, from) {
            if (supportsIndexOf) {
                return array.indexOf(item, from);
            }

            var i, length = array.length;

            for (i = (from < 0) ? Math.max(0, length + from) : from || 0; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        },

        /**
         * Checks whether or not the given `array` contains the specified `item`
         *
         * @param {Array} array The array to check
         * @param {Object} item The item to look for
         * @return {Boolean} True if the array contains the item, false otherwise
         */
        contains: function(array, item) {
            if (supportsIndexOf) {
                return array.indexOf(item) !== -1;
            }

            var i, ln;

            for (i = 0, ln = array.length; i < ln; i++) {
                if (array[i] === item) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Converts any iterable (numeric indices and a length property) into a true array.
         *
         *     function test() {
         *         var args = Ext.Array.toArray(arguments),
         *             fromSecondToLastArgs = Ext.Array.toArray(arguments, 1);
         *
         *         alert(args.join(' '));
         *         alert(fromSecondToLastArgs.join(' '));
         *     }
         *
         *     test('just', 'testing', 'here'); // alerts 'just testing here';
         *                                      // alerts 'testing here';
         *
         *     Ext.Array.toArray(document.getElementsByTagName('div')); // will convert the NodeList into an array
         *     Ext.Array.toArray('splitted'); // returns ['s', 'p', 'l', 'i', 't', 't', 'e', 'd']
         *     Ext.Array.toArray('splitted', 0, 3); // returns ['s', 'p', 'l', 'i']
         *
         * {@link Ext#toArray Ext.toArray} is alias for {@link Ext.Array#toArray Ext.Array.toArray}
         *
         * @param {Object} iterable the iterable object to be turned into a true Array.
         * @param {Number} start (Optional) a zero-based index that specifies the start of extraction. Defaults to 0
         * @param {Number} end (Optional) a zero-based index that specifies the end of extraction. Defaults to the last
         * index of the iterable value
         * @return {Array} array
         */
        toArray: function(iterable, start, end){
            if (!iterable || !iterable.length) {
                return [];
            }

            if (typeof iterable === 'string') {
                iterable = iterable.split('');
            }

            if (supportsSliceOnNodeList) {
                return slice.call(iterable, start || 0, end || iterable.length);
            }

            var array = [],
                i;

            start = start || 0;
            end = end ? ((end < 0) ? iterable.length + end : end) : iterable.length;

            for (i = start; i < end; i++) {
                array.push(iterable[i]);
            }

            return array;
        },

        /**
         * Plucks the value of a property from each item in the Array. Example:
         *
         *     Ext.Array.pluck(Ext.query("p"), "className"); // [el1.className, el2.className, ..., elN.className]
         *
         * @param {Array/NodeList} array The Array of items to pluck the value from.
         * @param {String} propertyName The property name to pluck from each element.
         * @return {Array} The value from each item in the Array.
         */
        pluck: function(array, propertyName) {
            var ret = [],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                ret.push(item[propertyName]);
            }

            return ret;
        },

        /**
         * Creates a new array with the results of calling a provided function on every element in this array.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Object} scope Callback function scope
         * @return {Array} results
         */
        map: function(array, fn, scope) {
            if (supportsMap) {
                return array.map(fn, scope);
            }

            var results = [],
                i = 0,
                len = array.length;

            for (; i < len; i++) {
                results[i] = fn.call(scope, array[i], i, array);
            }

            return results;
        },

        /**
         * Executes the specified function for each array element until the function returns a falsy value.
         * If such an item is found, the function will return false immediately.
         * Otherwise, it will return true.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Object} scope Callback function scope
         * @return {Boolean} True if no false value is returned by the callback function.
         */
        every: function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            if (supportsEvery) {
                return array.every(fn, scope);
            }

            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
        },

        /**
         * Executes the specified function for each array element until the function returns a truthy value.
         * If such an item is found, the function will return true immediately. Otherwise, it will return false.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Object} scope Callback function scope
         * @return {Boolean} True if the callback function returns a truthy value.
         */
        some: function(array, fn, scope) {
            //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
            //</debug>
            if (supportsSome) {
                return array.some(fn, scope);
            }

            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Filter through an array and remove empty item as defined in {@link Ext#isEmpty Ext.isEmpty}
         *
         * See {@link Ext.Array#filter}
         *
         * @param {Array} array
         * @return {Array} results
         */
        clean: function(array) {
            var results = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (!Ext.isEmpty(item)) {
                    results.push(item);
                }
            }

            return results;
        },

        /**
         * Returns a new array with unique items
         *
         * @param {Array} array
         * @return {Array} results
         */
        unique: function(array) {
            var clone = [],
                i = 0,
                ln = array.length,
                item;

            for (; i < ln; i++) {
                item = array[i];

                if (ExtArray.indexOf(clone, item) === -1) {
                    clone.push(item);
                }
            }

            return clone;
        },

        /**
         * Creates a new array with all of the elements of this array for which
         * the provided filtering function returns true.
         *
         * @param {Array} array
         * @param {Function} fn Callback function for each item
         * @param {Object} scope Callback function scope
         * @return {Array} results
         */
        filter: function(array, fn, scope) {
            if (supportsFilter) {
                return array.filter(fn, scope);
            }

            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
        },

        /**
         * Converts a value to an array if it's not already an array; returns:
         *
         * - An empty array if given value is `undefined` or `null`
         * - Itself if given value is already an array
         * - An array copy if given value is {@link Ext#isIterable iterable} (arguments, NodeList and alike)
         * - An array with one item which is the given value, otherwise
         *
         * @param {Object} value The value to convert to an array if it's not already is an array
         * @param {Boolean} newReference (Optional) True to clone the given array and return a new reference if necessary,
         * defaults to false
         * @return {Array} array
         */
        from: function(value, newReference) {
            if (value === undefined || value === null) {
                return [];
            }

            if (Ext.isArray(value)) {
                return (newReference) ? slice.call(value) : value;
            }

            if (value && value.length !== undefined && typeof value !== 'string') {
                return Ext.toArray(value);
            }

            return [value];
        },

        /**
         * Removes the specified item from the array if it exists
         *
         * @param {Array} array The array
         * @param {Object} item The item to remove
         * @return {Array} The passed array itself
         */
        remove: function(array, item) {
            var index = ExtArray.indexOf(array, item);

            if (index !== -1) {
                erase(array, index, 1);
            }

            return array;
        },

        /**
         * Push an item into the array only if the array doesn't contain it yet
         *
         * @param {Array} array The array
         * @param {Object} item The item to include
         */
        include: function(array, item) {
            if (!ExtArray.contains(array, item)) {
                array.push(item);
            }
        },

        /**
         * Clone a flat array without referencing the previous one. Note that this is different
         * from Ext.clone since it doesn't handle recursive cloning. It's simply a convenient, easy-to-remember method
         * for Array.prototype.slice.call(array)
         *
         * @param {Array} array The array
         * @return {Array} The clone array
         */
        clone: function(array) {
            return slice.call(array);
        },

        /**
         * Merge multiple arrays into one with unique items.
         *
         * {@link Ext.Array#union} is alias for {@link Ext.Array#merge}
         *
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} merged
         */
        merge: function() {
            var args = slice.call(arguments),
                array = [],
                i, ln;

            for (i = 0, ln = args.length; i < ln; i++) {
                array = array.concat(args[i]);
            }

            return ExtArray.unique(array);
        },

        /**
         * Merge multiple arrays into one with unique items that exist in all of the arrays.
         *
         * @param {Array} array1
         * @param {Array} array2
         * @param {Array} etc
         * @return {Array} intersect
         */
        intersect: function() {
            var intersect = [],
                arrays = slice.call(arguments),
                i, j, k, minArray, array, x, y, ln, arraysLn, arrayLn;

            if (!arrays.length) {
                return intersect;
            }

            // Find the smallest array
            for (i = x = 0,ln = arrays.length; i < ln,array = arrays[i]; i++) {
                if (!minArray || array.length < minArray.length) {
                    minArray = array;
                    x = i;
                }
            }

            minArray = ExtArray.unique(minArray);
            erase(arrays, x, 1);

            // Use the smallest unique'd array as the anchor loop. If the other array(s) do contain
            // an item in the small array, we're likely to find it before reaching the end
            // of the inner loop and can terminate the search early.
            for (i = 0,ln = minArray.length; i < ln,x = minArray[i]; i++) {
                var count = 0;

                for (j = 0,arraysLn = arrays.length; j < arraysLn,array = arrays[j]; j++) {
                    for (k = 0,arrayLn = array.length; k < arrayLn,y = array[k]; k++) {
                        if (x === y) {
                            count++;
                            break;
                        }
                    }
                }

                if (count === arraysLn) {
                    intersect.push(x);
                }
            }

            return intersect;
        },

        /**
         * Perform a set difference A-B by subtracting all items in array B from array A.
         *
         * @param {Array} arrayA
         * @param {Array} arrayB
         * @return {Array} difference
         */
        difference: function(arrayA, arrayB) {
            var clone = slice.call(arrayA),
                ln = clone.length,
                i, j, lnB;

            for (i = 0,lnB = arrayB.length; i < lnB; i++) {
                for (j = 0; j < ln; j++) {
                    if (clone[j] === arrayB[i]) {
                        erase(clone, j, 1);
                        j--;
                        ln--;
                    }
                }
            }

            return clone;
        },

        /**
         * Returns a shallow copy of a part of an array. This is equivalent to the native
         * call "Array.prototype.slice.call(array, begin, end)". This is often used when "array"
         * is "arguments" since the arguments object does not supply a slice method but can
         * be the context object to Array.prototype.slice.
         *
         * @param {Array} array The array (or arguments object).
         * @param {Number} begin The index at which to begin. Negative values are offsets from
         * the end of the array.
         * @param {Number} end The index at which to end. The copied items do not include
         * end. Negative values are offsets from the end of the array. If end is omitted,
         * all items up to the end of the array are copied.
         * @return {Array} The copied piece of the array.
         */
        // Note: IE6 will return [] on slice.call(x, undefined).
        slice: ([1,2].slice(1, undefined).length ?
            function (array, begin, end) {
                return slice.call(array, begin, end);
            } :
            // at least IE6 uses arguments.length for variadic signature
            function (array, begin, end) {
                // After tested for IE 6, the one below is of the best performance
                // see http://jsperf.com/slice-fix
                if (typeof begin === 'undefined') {
                    return slice.call(array);
                }
                if (typeof end === 'undefined') {
                    return slice.call(array, begin);
                }
                return slice.call(array, begin, end);
            }
        ),

        /**
         * Sorts the elements of an Array.
         * By default, this method sorts the elements alphabetically and ascending.
         *
         * @param {Array} array The array to sort.
         * @param {Function} sortFn (optional) The comparison function.
         * @return {Array} The sorted array.
         */
        sort: function(array, sortFn) {
            if (supportsSort) {
                if (sortFn) {
                    return array.sort(sortFn);
                } else {
                    return array.sort();
                }
            }

            var length = array.length,
                i = 0,
                comparison,
                j, min, tmp;

            for (; i < length; i++) {
                min = i;
                for (j = i + 1; j < length; j++) {
                    if (sortFn) {
                        comparison = sortFn(array[j], array[min]);
                        if (comparison < 0) {
                            min = j;
                        }
                    } else if (array[j] < array[min]) {
                        min = j;
                    }
                }
                if (min !== i) {
                    tmp = array[i];
                    array[i] = array[min];
                    array[min] = tmp;
                }
            }

            return array;
        },

        /**
         * Recursively flattens into 1-d Array. Injects Arrays inline.
         *
         * @param {Array} array The array to flatten
         * @return {Array} The 1-d array.
         */
        flatten: function(array) {
            var worker = [];

            function rFlatten(a) {
                var i, ln, v;

                for (i = 0, ln = a.length; i < ln; i++) {
                    v = a[i];

                    if (Ext.isArray(v)) {
                        rFlatten(v);
                    } else {
                        worker.push(v);
                    }
                }

                return worker;
            }

            return rFlatten(array);
        },

        /**
         * Returns the minimum value in the Array.
         *
         * @param {Array/NodeList} array The Array from which to select the minimum value.
         * @param {Function} comparisonFn (optional) a function to perform the comparision which determines minimization.
         * If omitted the "<" operator will be used. Note: gt = 1; eq = 0; lt = -1
         * @return {Object} minValue The minimum value
         */
        min: function(array, comparisonFn) {
            var min = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(min, item) === 1) {
                        min = item;
                    }
                }
                else {
                    if (item < min) {
                        min = item;
                    }
                }
            }

            return min;
        },

        /**
         * Returns the maximum value in the Array.
         *
         * @param {Array/NodeList} array The Array from which to select the maximum value.
         * @param {Function} comparisonFn (optional) a function to perform the comparision which determines maximization.
         * If omitted the ">" operator will be used. Note: gt = 1; eq = 0; lt = -1
         * @return {Object} maxValue The maximum value
         */
        max: function(array, comparisonFn) {
            var max = array[0],
                i, ln, item;

            for (i = 0, ln = array.length; i < ln; i++) {
                item = array[i];

                if (comparisonFn) {
                    if (comparisonFn(max, item) === -1) {
                        max = item;
                    }
                }
                else {
                    if (item > max) {
                        max = item;
                    }
                }
            }

            return max;
        },

        /**
         * Calculates the mean of all items in the array.
         *
         * @param {Array} array The Array to calculate the mean value of.
         * @return {Number} The mean.
         */
        mean: function(array) {
            return array.length > 0 ? ExtArray.sum(array) / array.length : undefined;
        },

        /**
         * Calculates the sum of all items in the given array.
         *
         * @param {Array} array The Array to calculate the sum value of.
         * @return {Number} The sum.
         */
        sum: function(array) {
            var sum = 0,
                i, ln, item;

            for (i = 0,ln = array.length; i < ln; i++) {
                item = array[i];

                sum += item;
            }

            return sum;
        },

        //<debug>
        _replaceSim: replaceSim, // for unit testing
        _spliceSim: spliceSim,
        //</debug>

        /**
         * Removes items from an array. This is functionally equivalent to the splice method
         * of Array, but works around bugs in IE8's splice method and does not copy the
         * removed elements in order to return them (because very often they are ignored).
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index.
         * @return {Array} The array passed.
         * @method
         */
        erase: erase,

        /**
         * Inserts items in to an array.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Array} items The array of items to insert at index.
         * @return {Array} The array passed.
         */
        insert: function (array, index, items) {
            return replace(array, index, 0, items);
        },

        /**
         * Replaces items in an array. This is functionally equivalent to the splice method
         * of Array, but works around bugs in IE8's splice method and is often more convenient
         * to call because it accepts an array of items to insert rather than use a variadic
         * argument list.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index (can be 0).
         * @param {Array} insert (optional) An array of items to insert at index.
         * @return {Array} The array passed.
         * @method
         */
        replace: replace,

        /**
         * Replaces items in an array. This is equivalent to the splice method of Array, but
         * works around bugs in IE8's splice method. The signature is exactly the same as the
         * splice method except that the array is the first argument. All arguments following
         * removeCount are inserted in the array at index.
         *
         * @param {Array} array The Array on which to replace.
         * @param {Number} index The index in the array at which to operate.
         * @param {Number} removeCount The number of items to remove at index (can be 0).
         * @return {Array} An array containing the removed items.
         * @method
         */
        splice: splice
    };

    /**
     * @method
     * @member Ext
     * @alias Ext.Array#each
     */
    Ext.each = ExtArray.each;

    /**
     * @method
     * @member Ext.Array
     * @alias Ext.Array#merge
     */
    ExtArray.union = ExtArray.merge;

    /**
     * Old alias to {@link Ext.Array#min}
     * @deprecated 4.0.0 Use {@link Ext.Array#min} instead
     * @method
     * @member Ext
     * @alias Ext.Array#min
     */
    Ext.min = ExtArray.min;

    /**
     * Old alias to {@link Ext.Array#max}
     * @deprecated 4.0.0 Use {@link Ext.Array#max} instead
     * @method
     * @member Ext
     * @alias Ext.Array#max
     */
    Ext.max = ExtArray.max;

    /**
     * Old alias to {@link Ext.Array#sum}
     * @deprecated 4.0.0 Use {@link Ext.Array#sum} instead
     * @method
     * @member Ext
     * @alias Ext.Array#sum
     */
    Ext.sum = ExtArray.sum;

    /**
     * Old alias to {@link Ext.Array#mean}
     * @deprecated 4.0.0 Use {@link Ext.Array#mean} instead
     * @method
     * @member Ext
     * @alias Ext.Array#mean
     */
    Ext.mean = ExtArray.mean;

    /**
     * Old alias to {@link Ext.Array#flatten}
     * @deprecated 4.0.0 Use {@link Ext.Array#flatten} instead
     * @method
     * @member Ext
     * @alias Ext.Array#flatten
     */
    Ext.flatten = ExtArray.flatten;

    /**
     * Old alias to {@link Ext.Array#clean}
     * @deprecated 4.0.0 Use {@link Ext.Array#clean} instead
     * @method
     * @member Ext
     * @alias Ext.Array#clean
     */
    Ext.clean = ExtArray.clean;

    /**
     * Old alias to {@link Ext.Array#unique}
     * @deprecated 4.0.0 Use {@link Ext.Array#unique} instead
     * @method
     * @member Ext
     * @alias Ext.Array#unique
     */
    Ext.unique = ExtArray.unique;

    /**
     * Old alias to {@link Ext.Array#pluck Ext.Array.pluck}
     * @deprecated 4.0.0 Use {@link Ext.Array#pluck Ext.Array.pluck} instead
     * @method
     * @member Ext
     * @alias Ext.Array#pluck
     */
    Ext.pluck = ExtArray.pluck;

    /**
     * @method
     * @member Ext
     * @alias Ext.Array#toArray
     */
    Ext.toArray = function() {
        return ExtArray.toArray.apply(ExtArray, arguments);
    };
})();
ARSnova.models.Config = Ext.regModel('Config', {
	fields: [
         'title', 
         'logo', 
         'logoheight', 
         'departure', 
         'departurelogo', 
         'departurelogoheight', 
         'day',
         'location',
         'menu1', 
         'menu2', 
         'menu3', 
         'menu4'
     ]
});



Ext.regStore('Config', {
	model: 'Config',
	proxy: {
		type: 'ajax',
		url : 'config.xml',
		reader: {
			type: 'xml',
			record: 'config'
		}
	}
});
Ext.getStore("Config").load({
	callback: function(records){
		ARSnova.config = records[0].data;
	}
});
Ext.regController("archive", {

	index: function(options){
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.archiveTabPanel, {
			type: 'slide',
		});
	},
	
	showArchive: function(options){
		var aTP = ARSnova.mainTabPanel.tabPanel.archiveTabPanel;
		aTP.questionPanel.courseId = options.courseId;
		aTP.setActiveItem(aTP.questionPanel, {
			type: 'slide',
		});
	},
});
Ext.regController("auth", {
	
	roleSelect: function(options){
		ARSnova.userRole = options.mode;
		localStorage.setItem('role', options.mode);
		
		ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.loginPanel, 'slide');
	},

	login: function(options){
		ARSnova.loginMode = options.mode;
		localStorage.setItem('loginMode', options.mode);

		switch(options.mode){
			case ARSnova.LOGIN_GUEST:
				if (localStorage.getItem('login') === null) {
					var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
					var string_length = 5;
					var randomstring = 'Guest';
					for (var i=0; i<string_length; i++){
						var rnum = Math.floor(Math.random() * chars.length);
						randomstring += chars.substring(rnum,rnum+1);
					}
					localStorage.setItem('login', randomstring);
				}
				break;
			case ARSnova.LOGIN_THM:
				var url = window.location.href
				var developerURL = url.indexOf("developer.html");
				if(developerURL == -1)
					return window.location = window.location.href + "app/webservices/doCasLogin.php";
				else 
					return window.location = url.substring(0, developerURL) + "app/webservices/doCasLogin.php";
				
				break;
			case ARSnova.LOGIN_TWITTER:
				Ext.Msg.alert("Hinweis", "Twitter ist noch nicht freigeschaltet.");
				Ext.Msg.doComponentLayout();
				return;
				break;
			case ARSnova.LOGIN_FACEBOOK:
				Ext.Msg.alert("Hinweis", "Facebook ist noch nicht freigeschaltet.");
				Ext.Msg.doComponentLayout();
				return;
				break;
			case ARSnova.LOGIN_GOOGLE:
				Ext.Msg.alert("Hinweis", "Google ist noch nicht freigeschaltet.");
				Ext.Msg.doComponentLayout();
				return;
				break;
			case ARSnova.LOGIN_OPENID:
				Ext.Msg.alert("Hinweis", "OpenID ist noch nicht freigeschaltet.");
				Ext.Msg.doComponentLayout();
				return;
				break;
			default:
				Ext.Msg.alert("Hinweis", options.mode + " wurde nicht gefunden.");
				Ext.Msg.doComponentLayout();
				return;
				break;
		}
		
		ARSnova.afterLogin(); 	
    },
    
    checkCasLogin: function(params){
    	ARSnova.loggedIn = true;
    	localStorage.setItem('login', params.username);
    	window.location = window.location.protocol + "//" + window.location.hostname + window.location.pathname; 
    },
    
    logout: function(){
    	taskManager.stop(ARSnova.loggedInTask);
    	localStorage.removeItem('sessions');
    	localStorage.removeItem('role');
    	localStorage.removeItem('loginMode');
    	
    	if (ARSnova.loginMode == ARSnova.LOGIN_THM) {
    		localStorage.removeItem('login');
    		window.location = "https://cas.thm.de/cas/logout?url=http://" + window.location.hostname + window.location.pathname + "#auth/doLogout";
    	} else {
    		ARSnova.mainTabPanel.layout.setActiveItem(ARSnova.mainTabPanel.rolePanel, {
    			type: 'slide',
    			direction: 'right',
    		})
    	}
    }
});
Ext.regController("canteen", {
    vote: function(options){
    	ARSnova.foodVoteModel.getUserFoodVote(ARSnova.config.day, localStorage.getItem("login"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				if (responseObj.length == 0) {
					//create
					var foodVote = Ext.ModelMgr.create({
						type : 'food_vote',
						user : localStorage.getItem('login'), 
						name : options.value,
						day	 : ARSnova.config.day,
					}, 'FoodVote');
				} else {
					//update
					var foodVote = Ext.ModelMgr.create(responseObj[0].value, "FoodVote");
					foodVote.set('name', options.value);
				}
				
				foodVote.save({
					success: function() {
						var cP = ARSnova.mainTabPanel.tabPanel.canteenTabPanel;
						cP.setActiveItem(cP.statisticPanel, {
				    		type		: 'slide',
				    		direction	: 'up',
				    		duration	: 700,
				    		after		: function(){
				    			ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
				    		}
						});
					},
					failure: function(response, opts) {
						console.log(response);
		    			console.log(opts);
		    	  		console.log('server-side error, foodVote save');
		    	  		Ext.Msg.alert("Hinweis!", "Die Antwort konnte leider nicht gespeichert werden");
		    	  		Ext.Msg.doComponentLayout();
					}
				});
			},
			failure: function(){
    			console.log('server-side error foodVote getUserFoodVote');
    		},
		});
    	
    	return;
    	
    	canteenVote.save({
    		success: function(){
    			ARSnova.mainTabPanel.layout.activeItem.switchBack();
    		}
    	})    	
    },
    
    show: function(){
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenPanel, {
			type: 'slide',
		});
    },
    
    showVotePanel: function(){
    	ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenPanel);
    	ARSnova.previousActiveItem = ARSnova.mainTabPanel.tabPanel;
		ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, {
				type: 'slide',
				direction: 'down',
				duration: 700,
			}
		);
    },
});
Ext.regController("feedback", {

	index: function(options){
		var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
		fP.setActiveItem(fP.votePanel, 'slide');
    },
    
    vote: function(options){
    	if (!ARSnova.checkSessionLogin()){
    		Ext.Msg.alert('Hinweis', 'Bitte loggen Sie sich erst in einen Kurs ein, bevor Sie diese Funktion nutzen!');
    		Ext.Msg.doComponentLayout();
    		var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
    		fP.setActiveItem(fP.statisticPanel, {
    			type		: 'slide',
    			direction	: 'right',
    		});
    		return;
    	}
    	
    	ARSnova.feedbackModel.getUserFeedback(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
    		success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				var ts = new Date().getTime();
				if (responseObj.length == 0){
					var feedback = Ext.ModelMgr.create({
						type	 : 'understanding',
						user	 : localStorage.getItem("login"),
						sessionId: localStorage.getItem("sessionId"),
						value	 : options.value,
						timestamp: ts,
					}, "Feedback");
				} else {
					var feedback = Ext.ModelMgr.create(responseObj[0].value, "Feedback");
					feedback.set('value', options.value);
					feedback.set('timestamp', ts);
				}
					
				feedback.save({
					success: function(){
						localStorage.setItem('user has voted', '');
						var feedbackButton = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
						
						feedbackButton.badgeEl.remove();
						feedbackButton.badgeEl = null;
						
						switch (options.value){
							case "Bitte schneller":
								feedbackButton.badgeCls = "badgeicon feedbackGood";
								break;
							case "Kann folgen":
								feedbackButton.badgeCls = "badgeicon feedbackMedium";
								break;
							case "Zu schnell":
								feedbackButton.badgeCls = "badgeicon feedbackBad";
								break;
							case "Nicht mehr dabei":
								feedbackButton.badgeCls = "badgeicon feedbackNone";
								break;	
							case "cancel":
								break;
							default:
								break;
						}
						
						feedbackButton.setBadge(".");
						
						var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
						fP.setActiveItem(fP.statisticPanel, {
							type		: 'slide',
							direction	: 'up',
						});
					},
					failure: function(){
						console.log('server-side error feedbackModel save');
					}
				})
    		},
    		failure: function(){
    			console.log('server-side error feedbackModel getUserFeedback');
    		},
    	});
    },
    
    showVotePanel: function(){
    	tP = ARSnova.mainTabPanel.tabPanel;
    	fP = tP.feedbackTabPanel;
    	
    	if(fP.rendered){
    		fP.setActiveItem(fP.votePanel);
    	} else {
    		fP.activeItem = 1;
    	}
    	tP.setActiveItem(fP);
    },
    
    statistic: function(){
    	ARSnova.showLoadMask("Erzeuge die Grafik...");
    	fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
    	fP.statisticPanel.backButton.show();
    	ARSnova.mainTabPanel.tabPanel.setActiveItem(fP);
    	
    	ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.addListener('deactivate', function(panel){
    		panel.statisticPanel.backButton.hide();
    	}, this, {single: true});
    },
});
Ext.regController("questions", {

	index: function(options){
		ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.backButton.show();
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
		ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.addListener('deactivate', function(panel){
    		panel.backButton.hide();
    	}, this, {single: true});
    },
    
    listAudienceQuestions: function(){
    	var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.audienceQuestionPanel, 'slide');
    },
    
    listFeedbackQuestions: function(){
    	ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.backButton.show();
    	ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel, 'slide');
    	ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.addListener('deactivate', function(panel){
    		panel.questionsPanel.backButton.hide();
    	}, this, {single: true});
    },
    
    add: function(options){
    	var question = Ext.ModelMgr.create({
			type	 	: options.type,
			questionType: options.questionType,
			sessionId	: options.sessionId,
			subject		: options.subject.toUpperCase(),
			text 		: options.text,
			active		: options.active,
			number		: options.number,
			releasedFor	: options.releasedFor,
			courses		: options.courses,
			possibleAnswers: options.possibleAnswers,
			noCorrect	: options.noCorrect,
		}, 'Question');
    	
    	var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	panel.query('textfield').forEach(function(el){
    		el.removeCls("required");
    	});

    	var error = false;
    	var validation = question.validate();
    	if (!validation.isValid()){
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.field + ']').addCls("required")
				error = true;
			});
    	}
    	switch(question.get('questionType')){
			case 'vote':
				panel.voteQuestion.query('textfield').forEach(function(el){
					if(el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'school':
				panel.schoolQuestion.query('textfield').forEach(function(el){
					if(el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'mc':
				panel.multipleChoiceQuestion.query('textfield').forEach(function(el){
					if(!el.hidden && el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
		}
    	if(error){
    		Ext.Msg.alert('Hinweis', 'Ihre Eingaben sind unvollständig');
    		Ext.Msg.doComponentLayout();
    		return;
    	}
    	
		question.save({
			success: options.successFunc,
			failure: options.failureFunc,
		});
    },
    
    details: function(options){
    	var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
    	sTP.questionDetailsPanel = new ARSnova.views.speaker.QuestionDetailsPanel(options.question);
		sTP.setActiveItem(sTP.questionDetailsPanel, 'slide');
    },
    
    detailsFeedbackQuestion: function(options){
    	var session = Ext.ModelMgr.getModel("Question").load(options.question.id, {
    		success: function(records, operation){
    			var question = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Question');
    			question.set('formattedTime', options.question.formattedTime);
    			question.set('fullDate', options.question.fullDate);
    			
				var newPanel = new ARSnova.views.feedbackQuestions.DetailsPanel(question.data);
		    	ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.setActiveItem(newPanel, 'slide');
    		},
    		failure: function(records, operation){
				console.log(operation);
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    	  		Ext.Msg.doComponentLayout();
			},
    	});
    },
    
    setActive: function(options){
    	var session = Ext.ModelMgr.getModel("Question").load(options.questionId, {
			success: function(records, operation){
				var question = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Question');
				question.set('active', options.active);
				
				question.save({
					success: function(response){
						var panel  = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						panel.questionObj._rev = response.rev;
						
		    	  		var questionStatus = panel.questionStatusButton;
		    	  		
		    	  		if(options.active == 1){
		    	  			questionStatus.questionOpenedSuccessfully();
		    	  			panel.down('textfield[label=Status]').setValue("Freigegeben");
		    	  		} else {
		    	  			questionStatus.questionClosedSuccessfully();
		    	  			panel.down('textfield[label=Status]').setValue("Nicht Freigegeben");
		    	  		}
					},
					failure: function(records, operation){
						console.log(operation);
		    	  		Ext.Msg.alert("Hinweis!", "Session speichern war nicht erfolgreich");
		    	  		Ext.Msg.doComponentLayout();
					},
				});
			},
			failure: function(records, operation){
				console.log(operation);
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    	  		Ext.Msg.doComponentLayout();
			},
		});
    },
    
    adHoc: function(){
    	var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		
		sTP.setActiveItem(sTP.newQuestionPanel, {
			type: 'slide',
			duration: 700,
		});
		
		/* change the backButton-redirection to inClassPanel,
		 * but only for one function call */
		var backButton = sTP.newQuestionPanel.down('button[ui=back]');
		backButton.handler = function(){
			var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.setActiveItem(sTP.inClassPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700,
			});
		};
		backButton.setText("Home");
		sTP.newQuestionPanel.on('deactivate', function(panel){
			panel.backButton.handler = function(){
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			};
			panel.backButton.setText("Fragen");
		}, this, {single:true});
		
    	ARSnova.hideLoadMask();
    },
    
//    allStatistics: function(options){
//    	console.log(options.questions);
//    	var questionTabPanel = new Ext.TabPanel();
//    	for ( var i = 0; i < options.questions.length; i++) {
//			var question = options.questions[i];
//			questionTabPanel.add(new ARSnova.views.QuestionStatisticChart(question.value, this));
//		}
//    	ARSnova.mainTabPanel.setActiveItem(questionTabPanel, 'slide');
//    },
});
Ext.regController("quiz", {

	index: function(options){
		ARSnova.mainTabPanel.setActiveItem(new ARSnova.views.user.QuizPanel(), 'slide');
    },
});
Ext.regController("ranking", {

	index: function(options){		
		ARSnova.mainTabPanel.setActiveItem(new ARSnova.views.user.RankingPanel, 'slide');
    },
});
Ext.regController("sessions", {
    model: 'Session',
    
    login: function(options){
    	/* do login stuff */
    	var res = ARSnova.sessionModel.checkSessionLogin(options.keyword, {
    		success: function(response){
    			var responseObj = Ext.decode(response.responseText);
    			
    			//check if session exists
    			if(responseObj.rows.length == 0){
    				Ext.Msg.alert("Hinweis", "Diese Session existiert nicht.");
    				Ext.Msg.doComponentLayout();
    				return;
    			}
    			
    			var obj = responseObj.rows[0].value;
    			
    			//check if user is creator of this session
    			if (obj.creator == localStorage.getItem('login')){
    				ARSnova.isSessionOwner = true;
    			} else {
    				//check if session is open
    				if(obj.active == 0){
    					Ext.Msg.alert("Hinweis", "Die Session \"" + obj.name +"\” ist momentan geschlossen.");
    					Ext.Msg.doComponentLayout();
    					return;
    				}
    				ARSnova.isSessionOwner = false;
    				
    			}
    			
    			//save session as one of five lastVisitedSessions in localStorage
    			ARSnova.saveLastVisitedSession(obj);
    			
    			//set local variables
    			localStorage.setItem('sessionId', obj._id);
    	    	localStorage.setItem('name', obj.name);
    	    	localStorage.setItem('keyword', obj.keyword);
    	    	localStorage.setItem('shortName', obj.shortName);
    	    	localStorage.setItem('active', obj.active);
    	    	
    	    	//save that im a logged in this session
    	    	restProxy.loggedInTask();
    	    	//start feedback-votes-cleaning-up-task
    	    	taskManager.start(ARSnova.cleanFeedbackVotes);
    	    	//start task to update the feedback tab in tabBar
    	    	taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
    	    	
    	    	Ext.dispatch({
	    			controller	: 'sessions',
	    			action		: 'reloadData',
	    		});
    		},
    		failure: function(records, operation){
    			console.log(operation);
    			Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    			Ext.Msg.doComponentLayout();
    		}
    	});
    },

	logout: function(){
		//remove "user has voted"-flag
		if (localStorage.getItem('user has voted'))
			localStorage.removeItem('user has voted');
		
		//stop feedback-votes-cleaning-up-task
    	taskManager.stop(ARSnova.cleanFeedbackVotes);
    	//stop task to update the feedback tab in tabBar
    	taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
    	
		localStorage.removeItem("sessionId");
		localStorage.removeItem("name");
		localStorage.removeItem("keyword");
		localStorage.removeItem("short_name");
		localStorage.removeItem("active");
		
		//save that user is not in this session anymore
		restProxy.loggedInTask();
		
		var tabPanel = ARSnova.mainTabPanel.tabPanel;
		/* show home Panel */
		tabPanel.homeTabPanel.tab.show();
		tabPanel.setActiveItem(tabPanel.homeTabPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
		
		/* show archive Panel */
//		tabPanel.archiveTabPanel.tab.show();

		if(ARSnova.isSessionOwner){
			/* hide speaker tab panel and destroy listeners */
			tabPanel.speakerTabPanel.tab.hide();
			tabPanel.speakerTabPanel.inClassPanel.destroyListeners();
			
			/* hide feedback statistic panel */
			tabPanel.feedbackTabPanel.tab.hide();
			
			/* hide feedback questions panel */
			tabPanel.feedbackQuestionsPanel.tab.hide();
		} else {
			/* hide user tab panel and destroy listeners */
			tabPanel.userTabPanel.tab.hide();
			tabPanel.userTabPanel.inClassPanel.destroyListeners();
			
			/* hide feedback statistic panel */
			tabPanel.feedbackTabPanel.tab.hide();
			
			/* hide feedback questions panel */
			tabPanel.userQuestionsPanel.tab.hide();
		}
		
		/* set window title */
		window.document.title = "ARSnova";
		
		ARSnova.mainTabPanel.tabPanel.doComponentLayout();
	},
	
	reloadData: function(){
		/* hide homeTabPanel and archivePanel */
		var tabPanel = ARSnova.mainTabPanel.tabPanel;
		tabPanel.homeTabPanel.tab.hide();
//		tabPanel.archiveTabPanel.tab.hide();
		
		if(ARSnova.isSessionOwner){
			/* add speaker in class panel */
				if(!tabPanel.speakerTabPanel){
					tabPanel.speakerTabPanel = new ARSnova.views.speaker.TabPanel();
					tabPanel.insert(1, tabPanel.speakerTabPanel);
				} else {
					ARSnova.showLoadMask("Login...");
					tabPanel.speakerTabPanel.tab.show();
					tabPanel.speakerTabPanel.renew();
					
					/* don't know what's going on here, try to fix it */
					setTimeout("ARSnova.mainTabPanel.tabPanel.speakerTabPanel.doComponentLayout();", 1000);
					setTimeout("ARSnova.mainTabPanel.tabPanel.layout.layout();", 2000);
					setTimeout("ARSnova.hideLoadMask();", 3000);
				}
				tabPanel.setActiveItem(tabPanel.speakerTabPanel, {
					type: 'slide',
					duration: 700
				});
				tabPanel.speakerTabPanel.inClassPanel.registerListeners();

			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = new ARSnova.views.feedback.TabPanel();
					tabPanel.insert(2, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
			
			/* add feedback questions panel*/
				if(!tabPanel.feedbackQuestionsPanel){
					tabPanel.feedbackQuestionsPanel = new ARSnova.views.feedbackQuestions.TabPanel();
					if(!tabPanel.userTabPanel)
						tabPanel.insert(3, tabPanel.feedbackQuestionsPanel);
					else
						tabPanel.insert(4, tabPanel.feedbackQuestionsPanel);
				} else {
					tabPanel.feedbackQuestionsPanel.tab.show();
				}
				
			/* set window title */
				window.document.title = "ARSnova: Dozent/in";
		} else {
			/* add user in class panel */
				if(!tabPanel.userTabPanel){
					tabPanel.userTabPanel = new ARSnova.views.user.TabPanel();
					tabPanel.insert(0, tabPanel.userTabPanel);
				} else {
					ARSnova.showLoadMask("Login...");
					tabPanel.userTabPanel.tab.show();
					tabPanel.userTabPanel.renew();
					setTimeout("ARSnova.mainTabPanel.tabPanel.userTabPanel.doComponentLayout()", 1000);
					setTimeout("ARSnova.hideLoadMask();", 1500);
				}
				tabPanel.setActiveItem(tabPanel.userTabPanel, {
					type: 'slide',
					duration: 700
				});
				tabPanel.userTabPanel.inClassPanel.registerListeners();
				
			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = new ARSnova.views.feedback.TabPanel();
					tabPanel.insert(1, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
				
			/* add skill questions panel*/
				var questionsPanel = new ARSnova.views.user.QuestionPanel();
				tabPanel.userQuestionsPanel = questionsPanel;
				if(!tabPanel.speakerTabPanel)
					tabPanel.insert(3, questionsPanel);
				else
					tabPanel.insert(4, questionsPanel);
				
			/* set window title */
				window.document.title = "ARSnova: Zuhörer/in";
		}
	},
	
	create: function(options){
		var session = Ext.ModelMgr.create({
			type	 : 'session',
			name	 : options.name, 
			shortName: options.shortName,
			keyword	 : options.keyword,
			creator	 : localStorage.getItem('login'),
			active	 : 1,
		}, 'Session');
		
		var validation = session.validate();
		if (!validation.isValid()) {
			Ext.Msg.alert('Hinweis', 'Bitte alle markierten Felder ausfüllen.');
			Ext.Msg.doComponentLayout();
			var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
			panel.down('fieldset').items.items.forEach(function(el){
				if(el.xtype == 'textfield')
					el.removeCls("required");
			});
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.field + ']').addCls("required")
			});
			return;
		}
		
		session.save({
			success: function(response){
    	  		localStorage.setItem('sessionId', response.id);
    	    	localStorage.setItem('name', session.data.name);
    	    	localStorage.setItem('keyword', session.data.keyword);
    	    	localStorage.setItem('shortName', session.data.shortName);
    	    	localStorage.setItem('active', session.data.active);
				ARSnova.isSessionOwner = true;
    	    	
    	    	//start feedback-votes-cleaning-up-task
    	    	taskManager.start(ARSnova.cleanFeedbackVotes);
    	    	
    	    	ARSnova.saveLastVisitedSession(session.data);
    	    	
    	    	var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
    	    	panel.setActiveItem(panel.mySessionsPanel);
    	    	
    	    	
    	    	ARSnova.showLoadMask("Login");
    	    	Ext.dispatch({
    	    		controller	: 'sessions',
    	    		action		: 'reloadData'
    	    	});
			},
			failure: function(records, operation){
				console.log(operation);
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
				Ext.Msg.doComponentLayout();
			},
		});
	},
	
	setActive: function(options){
		var session = Ext.ModelMgr.getModel("Session").load(localStorage.getItem("sessionId"), {
			success: function(records, operation){
				var session = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Session');
				session.set('active', options.active);
				var validation = session.validate();
				if (!validation.isValid()){
					Ext.Msg.alert('Hinweis', 'Leider konnte die Session nicht gespeichert werden');
					Ext.Msg.doComponentLayout();					
				}
				
				session.save({
					success: function(){
						//update this session in localStorage
						var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
						sessions.forEach(function(el){
							if(el._id == session.data._id)
								el.active = session.data.active;
						});
						localStorage.setItem('lastVisitedSessions', Ext.encode(sessions));
						
		    	  		var sessionStatus = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton;
		    	  		
		    	  		if(options.active == 1){
		    	  			sessionStatus.sessionOpenedSuccessfully();
		    	  		} else {
		    	  			sessionStatus.sessionClosedSuccessfully();
		    	  		}
					},
					failure: function(records, operation){
						console.log(operation);
		    	  		Ext.Msg.alert("Hinweis!", "Session speichern war nicht erfolgreich");
		    	  		Ext.Msg.doComponentLayout();
					},
				});
			},
			failure: function(records, operation){
				console.log(operation);
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    	  		Ext.Msg.doComponentLayout();
			},
		});
    },
});
Ext.regController("user", {

	index: function(options){
		var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
		hTP.setActiveItem(hTP.mySessionsPanel, {
			type: 'slide',
		});
    },
});
var restProxy = new Ext.data.RestProxy({
	url : '/couchdb/arsnova',
	appendId: true,
	noCache: false,
	
	writer: {
		writeRecords: function(request, data){
			request.jsonData = data[0];
			return request;
		}
	},
	
	listeners: {
		exception: function(proxy, response, operation){
			operation.exceptionReason = response.status;
		},
	},
	
	create: function(operation, callback, scope) {
		var callbackFn = operation.callback,
	        successFn  = operation.success,
	        failureFn  = operation.failure;
		
		callback = function(operation){			
            if (operation.wasSuccessful()) {
            	record = Ext.decode(operation.response.responseText);
            	this.set('_id', record.id);
            	this.set('_rev', record.rev);
            	
	            if (typeof successFn == 'function') {
	                successFn.call(scope, record, operation);
		        }
            } else {
	            if (typeof failureFn == 'function') {
	                failureFn.call(scope, operation);
	            }
	        }
	            
	        if (typeof callbackFn == 'function') {
	            callbackFn.call(scope, record, operation);
	        } 
		};
		
		request = this.buildRequest(operation, callback, scope);
		
		this.doRequest(operation, callback, scope, request);	                
	},
	
	read: function(operation, callback, scope) {
	 	var callbackFn = operation.callback,
            successFn  = operation.success,
            failureFn  = operation.failure;
		
		callback = function(operation) {
	        if (operation.wasSuccessful()) {
            	record = operation.getRecords()[0];
                if (typeof successFn == 'function') {
                    successFn.call(scope, record, operation);
                }
            } else {
                if (typeof failureFn == 'function') {
                    failureFn.call(scope, record, operation);
                }
            }
	            
            if (typeof callbackFn == 'function') {
                callbackFn.call(scope, record, operation);
            }
       	};
		
		Ext.data.RestProxy.superclass.read.apply(this, arguments);
	},
	
	buildUrl: function(request) {
        var records = request.operation.records || [],
            record  = records[0],
            format  = this.format,
            url     = request.url || this.url;
        	id      = record ? record.getId() : request.operation.id; // FIX
        
        
        	if (this.appendId && id) { // FIX
        		if (!url.match(/\/$/)) {
                url += '/';
            }
            
            url += id; // FIX
        }
        
        if (format) {
            if (!url.match(/\.$/)) {
                url += '.';
            }
            
            url += format;
        }
        
        request.url = url;
        
        return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);
    },
    
    /**
     * Search for a session with specified keyword
     * @param keyword of session
     * @param object with success- and failure-callbacks
     * @return session-object, if found
     * @return false, if nothing found 
     */
    checkSessionLogin: function(keyword, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/by_keyword',
    		method: 'GET',
    		params: {
    			key: "\"" + keyword + "\""
    		},
    		success: function(response, opts) {
    			callbacks.success.call(this, response, opts);    			
    		},
    		failure: function(response, opts) {
    			callbacks.failure.call(this, response, opts);
    		},
    	})
    },
    
    /**
     * Get the sessions where user is creator
     * @param login from user
     * @param object with success- and failure-callbacks
     * @return session-objects, if found
     * @return false, if nothing found 
     */
    getMySessions: function(login, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/by_creator',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + login + "\"]",
    			endkey	: "[\"" + login + "\", {}]",
    		},
    		success: function(response, opts) {
    			callbacks.success.call(this, response, opts);    			
    		},
    		failure: function(response, opts) {
    			callbacks.failure.call(this, response, opts);
    		},
    	})
    },
    
    getQuestionById: function(id, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/by_id',
    		method: 'GET',
    		params: {
    			key: "\"" + id + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    /**
     * Get skill questions for this session, sorted by subject
     * @param sessionId
     * @param object with success- and failure-callbacks
     * @return session-objects, if found
     * @return false, if nothing found 
     */
    getSkillQuestionsSortBySubject: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/by_session',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + sessionId + "\"]",
    			endkey	: "[\"" + sessionId + "\", {}]",
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    countSkillQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/count_by_session',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    /**
     * Get interposed questions for this session
     * @param sessionId
     * @param object with success- and failure-callbacks
     * @return session-objects, if found
     * @return false, if nothing found 
     */
    getInterposedQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/interposed_question/_view/by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    countFeedbackQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/interposed_question/_view/count_by_session',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    delQuestion: function(queObj, callbacks){
    	restProxy.removeEntry(queObj._id, queObj._rev, callbacks); 	//delete Question
    	restProxy.delAnswers(queObj._id, callbacks);				//delete Answers
    },
    
    delAnswers: function(questionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/cleanup',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + questionId + "\""
    		},
    		
    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			if (resRows.length > 0) {
					for ( var i = 0; i < resRows.length; i++) {
						el = resRows[i];
						restProxy.removeEntry(el.id, el.value, callbacks);
					}
				}
    		},
    		failure: callbacks.failure,
    	})
    },
    
    delSession: function(sessionId, creator, callbacks){
    	Ext.ModelMgr.getModel("Session").load(sessionId, {
    		success: function(record, operation) {
    			var sessionObj = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Session');
    			if(sessionObj.data.creator != creator){
    				console.log('unauthorized');
    				return;
    			}
		    	restProxy.getSkillQuestionsForDelete(sessionId, {
		    		success: function(response){
		    			var skillQuestions = Ext.decode(response.responseText).rows;
		    			if (skillQuestions.length > 0) {
							for ( var i = 0; i < skillQuestions.length; i++) {
								skillQuestion = skillQuestions[i];
								restProxy.delQuestion(skillQuestion.value, {
									success: function(){}, //nothing to do
									failure: function(){}, //nothing to do
								});
							}
						}
						restProxy.removeEntry(sessionObj.data._id, sessionObj.data._rev, callbacks);
					}
				})
    		},
    		failure: function(){console.log('failure')},
    	});
    },
    
//    delLoggedIn: function(callbacks){
//    	Ext.Ajax.request({
//    		url: this.url + '/_design/logged_in/_view/all',
//    		method: 'GET',
//    		
//    		success: function(response){
//    			var resRows = Ext.decode(response.responseText).rows;
//    			if (resRows.length > 0) {
//					for ( var i = 0; i < resRows.length; i++) {
//						el = resRows[i];
//						console.log(el.value);
//						restProxy.removeEntry(el.id, el.value._rev, callbacks);
//					}
//				}
//    		},
//    	})
//    },
    
    getSkillQuestionsForDelete: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/for_delete',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getAnswerByUserAndSession: function(userLogin, sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_user_and_session',
    		method: 'GET',
    		params: {
    			key: "[\"" + userLogin + "\", \"" + sessionId + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getAnsweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/unanswered',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			var questions = [];
    			var answeredQuestions = [];
    			var retQuestions = [];
    			
    			resRows.forEach(function(element){
    				if (element.value.type == 'skill_question') {
						questions.push(element);
					} else {
						if (element.value.user == userLogin)
							answeredQuestions.push(element.value.questionId);
					}
    			});
    			
    			questions.forEach(function(element){
    				if (element.value.active && element.value.active == 1) {
						if (answeredQuestions.indexOf(element.id) != -1) {
							unansweredQuestions.push(element.value);
						}
    				}
    			});
    			callbacks.success(retQuestions);
    		},
    		failure: callbacks.failure,
    	})
    },
    
    /**
     * First fetch all answered skill_questions of this user.
     * Then fetch all skill_questions for this session and check each question if it is active and not in the answered questions array.
     */
    getUnansweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + userLogin + "\", \"" + sessionId + "\"]",
    		},

    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			var answered = [];
    			
    			resRows.forEach(function(question){
    				answered.push(question.value);
    			})
    			
    			restProxy.getSkillQuestionsOnlyId(sessionId, {
    				success: function(response){
    					var allQuestions = Ext.decode(response.responseText).rows;
    					var unanswered = [];
    					
    					allQuestions.forEach(function(question){
    						if(answered.indexOf(question.id) == -1)
    							unanswered.push(question.id);
    					});
    					callbacks.success(unanswered);
    				},
    				failure: callbacks.failure,
    			});
    		},
    		failure: callbacks.failure,
    	})
    },
    
    getSkillQuestionsOnlyId: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/by_session_only_id',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},
    		
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    
    
    getUserAnswer: function(questionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_question_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + questionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },

    countAnswers: function(questionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/count_answers?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + questionId + "\"]",
    			endkey	: "[\"" + questionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getSessionFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/by_session?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + sessionId + "\"]",
    			endkey	: "[\"" + sessionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    /**
     * Remove all feedback votes older than 'timeLimit'
     * default: 10 minutes
     */
    cleanSessionFeedback: function() {
    	var timeLimit = 10; //min
    	var time = new Date().getTime() - (timeLimit * 60 * 1000);
    	
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/cleanup',
    		method: 'GET',
    		params: {
    			startkey: "null",
    			endkey	: time,
    		},

    		success: function(response){
    			var responseObj = Ext.decode(response.responseText).rows;
    			if (responseObj.length > 0){
    				for ( var i = 0; i < responseObj.length; i++) {
						var el = responseObj[i];
						restProxy.removeEntry(el.id, el.value, {
							success: function(){},
							failure: function(){console.log('error - clean session feedback')},
						});
					}
    			}
    		},
    		failure: function(){
    			console.log('server-side error cleanSessionFeedback');
    		}
    	})
    },
    
//    cleanLoggedIn: function() {
//    	Ext.Ajax.request({
//    		url: this.url + '/_design/logged_in/_view/cleanup',
//    		method: 'GET',
//
//    		success: function(response){
//    			var responseObj = Ext.decode(response.responseText).rows;
//    			if (responseObj.length > 0){
//    				for ( var i = 0; i < responseObj.length; i++) {
//						var el = responseObj[i];
//						restProxy.removeEntry(el.id, el.value, {
//							success: function(){},
//							failure: function(){console.log('error - clean logged in')},
//						});
//					}
//    			}
//    		},
//    		failure: function(){
//    			console.log('server-side error cleanLoggedIn');
//    		}
//    	})
//    },
    
    removeEntry: function(id, rev, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/' + id + '?rev=' + rev,
    		method: 'DELETE',
    		
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getUserFeedback: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/by_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getAverageSessionFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/avg_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    countFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/count_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getUserRanking: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/by_session_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getUserRankingStatistic: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/count_by_session_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getSessionRankingStatistic: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/count_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getSessionIds: function(callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/getIds',
    		method: 'GET',

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },

    getSession: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/by_id',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    isActive: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/is_active',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    getUserFoodVote: function(day, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/get_user_vote',
    		method: 'GET',
    		params: {
    			key: "[\"" + day + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    countFoodVote: function(day, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/count_by_day?group=false',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + day + "\"]",
    			endkey	: "[\"" + day + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    countFoodVoteGrouped: function(day, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/count_by_day?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + day + "\"]",
    			endkey	: "[\"" + day + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    /**
     * save every minute that i'm online
     */
    loggedInTask: function() {
    	var loggedInLocal = JSON.parse(localStorage.getItem("loggedIn"));
    	var ts = new Date().getTime();
    	
    	if(loggedInLocal.type == undefined){
    		var loggedIn = Ext.ModelMgr.create({
				type	 : 'logged_in',
				user	 : localStorage.getItem("login"),
				sessionId: localStorage.getItem("sessionId"),
				timestamp: ts,
			}, "LoggedIn");
    	} else {
    		var loggedIn = Ext.ModelMgr.create(loggedInLocal, "LoggedIn");
			loggedIn.set('timestamp', ts);
			loggedIn.set('sessionId', localStorage.getItem("sessionId"));
    	}
    	loggedIn.save({
			success: function(response){
				localStorage.setItem("loggedIn", JSON.stringify(loggedIn.data));
			},
			failure: function(operation){
				switch(operation.exceptionReason){
					case 409:
						/* document update conflict:
						 * fetch the new logged in data and save it in localStorage */
						Ext.ModelMgr.getModel("LoggedIn").load(loggedIn.data._id, {
							success: function(record, operation) {
								var newLoggedIn = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'LoggedIn');
								localStorage.setItem("loggedIn", JSON.stringify(newLoggedIn.data));
							}
						})
						break;
					default:
						break;
				}
				console.log('server-side error loggedIn.save');
			}
		});
    },
    
    countActiveUsersBySession: function(sessionId, callbacks) {
    	var ts = new Date().getTime() - (3 * 60 * 1000);
    	Ext.Ajax.request({
    		url: this.url + '/_design/logged_in/_view/count',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + sessionId + "\", " + ts + "]",
    			endkey: "[\"" + sessionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    /* STATISTICS */
	    countActiveUsers: function(callbacks) {
	    	var ts = new Date().getTime() - (3 * 60 * 1000);
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_active_users',
	    		method: 'GET',
	    		params: {
	    			startkey: ts,
	    		},
	
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	})
	    },
	    
	    countSessions: function(callbacks) {
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_sessions?group=true',
	    		method: 'GET',
	
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	})
	    },
	    
    getSkillQuestionsForUser: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/by_session_for_user',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    maxNumberInSession: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/max_number_in_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
    
    releasedByCourseId: function(courseId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/released_by_course_id',
    		method: 'GET',
    		params: {
    			key: "\"" + courseId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	})
    },
});
ARSnova.models.Answer = Ext.regModel('Answer', {
	proxy: restProxy,
	
	getUserAnswer: function(questionId, userLogin, callbacks){
		return this.proxy.getUserAnswer(questionId, userLogin, callbacks);
	},
	
	getAnswerByUserAndSession: function(userLogin, sessionId, callbacks){
		return this.proxy.getAnswerByUserAndSession(userLogin, sessionId, callbacks);
	},
});
ARSnova.models.Feedback = Ext.regModel('Feedback', {
	proxy: restProxy,
	
	getSessionFeedback: function(sessionId, callbacks){
		return this.proxy.getSessionFeedback(sessionId, callbacks);
	},
	
	getUserFeedback: function(sessionId, userLogin, callbacks){
		return this.proxy.getUserFeedback(sessionId, userLogin, callbacks);
	},
	
	getAverageSessionFeedback: function(sessionId, callbacks){
		return this.proxy.getAverageSessionFeedback(sessionId, callbacks);
	},
	
	countFeedback: function(sessionId, callbacks){
		return this.proxy.countFeedback(sessionId, callbacks);
	},
});
ARSnova.models.FoodVote = Ext.regModel('FoodVote', {
	proxy: restProxy,
	
	getUserFoodVote: function(day, userLogin, callbacks){
		return this.proxy.getUserFoodVote(day, userLogin, callbacks);
	},
	
	countFoodVote: function(day, callbacks){
		return this.proxy.countFoodVote(day, callbacks);
	},
	
	countFoodVoteGrouped: function(day, callbacks){
		return this.proxy.countFoodVoteGrouped(day, callbacks);
	},
});
ARSnova.models.LoggedIn = Ext.regModel('LoggedIn', {
	proxy: restProxy,
	
	countActiveUsersBySession: function(sessionId, callbacks){
		return this.proxy.countActiveUsersBySession(sessionId, callbacks);
	},
});
ARSnova.models.Question = Ext.regModel('Question', {
    proxy: restProxy,
    
    fields: [
      'type',
   	  'text',
   	  'subject',
   	  'sessionId',  
    ],
           
   	validations: [
      {type: 'presence', field: 'type'},
      {type: 'presence', field: 'text'},
      {type: 'presence', field: 'subject'},
      {type: 'presence', field: 'sessionId'},
    ],
    
    destroy: function(queObj, callbacks) {
    	return this.proxy.delQuestion(queObj, callbacks);
    },
    
    deleteAnswers: function(questionId, callbacks) {
    	return this.proxy.delAnswers(questionId, callbacks);
    },
    
    getQuestionById: function(id, callbacks){
    	return this.proxy.getQuestionById(id, callbacks);
    },
    
    getSkillQuestionsSortBySubject: function(sessionId, callbacks) {
    	return this.proxy.getSkillQuestionsSortBySubject(sessionId, callbacks);
    },
    
    getSkillQuestionsForDelete: function(sessionId, callbacks) {
    	return this.proxy.getSkillQuestionsForDelete(sessionId, callbacks);
    },
    
    getAnsweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	return this.proxy.getAnsweredSkillQuestions(sessionId, userLogin, callbacks);
    },
    
    getUnansweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	return this.proxy.getUnansweredSkillQuestions(sessionId, userLogin, callbacks);
    },
    
    countSkillQuestions: function(sessionId, callbacks) {
    	return this.proxy.countSkillQuestions(sessionId, callbacks);
    },
    
    getInterposedQuestions: function(sessionId, callbacks) {
    	return this.proxy.getInterposedQuestions(sessionId, callbacks);
    },
    
    countFeedbackQuestions: function(sessionId, callbacks) {
    	return this.proxy.countFeedbackQuestions(sessionId, callbacks);
    },
    
    changeQuestionType: function(sessionId, callbacks) {
    	return this.proxy.changeQuestionType(sessionId, callbacks);
    },
    
    countAnswers: function(questionId, callbacks) {
    	return this.proxy.countAnswers(questionId, callbacks);
    },
    
    getSkillQuestionsForUser: function(sessionId, callbacks) {
    	return this.proxy.getSkillQuestionsForUser(sessionId, callbacks);
    },
    
    maxNumberInSession: function(sessionId, callbacks) {
    	return this.proxy.maxNumberInSession(sessionId, callbacks);
    },
    
    releasedByCourseId: function(courseId, callbacks) {
    	return this.proxy.releasedByCourseId(courseId, callbacks);
    },
});
ARSnova.models.Session = Ext.regModel('Session', {
	proxy: restProxy,
	
    fields: [
	  'type', 
	  'name', 
	  'shortName',  
	  'creator',  
    ],
    
	validations: [
      {type: 'presence', field: 'type'},
      {type: 'presence', field: 'name', min: 1, max: 50},
      {type: 'length', field: 'shortName', min: 1, max: 5},
      {type: 'presence', field: 'creator'},
    ],
    
    destroy: function(sessionId, creator, callbacks) {
    	return this.proxy.delSession(sessionId, creator, callbacks);
    },
    
    checkSessionLogin: function(keyword, callbacks){
    	return this.proxy.checkSessionLogin(keyword, callbacks);
    },
    
    getMySessions: function(keyword, callbacks){
    	return this.proxy.getMySessions(keyword, callbacks);
    },
    
    getSessionIds: function(callbacks){
    	return this.proxy.getSessionIds(callbacks);
    },
    
    getSession: function(sessionId, callbacks){
    	return this.proxy.getSession(sessionId, callbacks);
    },
    
    isActive: function(sessionId, callbacks){
    	return this.proxy.isActive(sessionId, callbacks);
    } 
});
ARSnova.models.Statistic = Ext.regModel('Statistic', {
	proxy: restProxy,
	
    fields: [
	  'category', 
	  'counter', 
    ],
    
    countSessions: function(callbacks){
    	return this.proxy.countSessions(callbacks);
    },
    
//    countQuestions: function(callbacks){
//    	return this.proxy.countQuestions(callbacks);
//    },
//    
//    countArchives: function(callbacks){
//    	return this.proxy.countArchives(callbacks);
//    },
    
    countActiveUsers: function(callbacks){
    	return this.proxy.countActiveUsers(callbacks);
    },
    
//    countMaxUserInSession: function(callbacks){
//    	return this.proxy.countMaxUserInSession(callbacks);
//    },
//    
//    countMaxUserOnline: function(callbacks){
//    	return this.proxy.countMaxUserOnline(callbacks);
//    },
});
ARSnova.models.UserRanking = Ext.regModel('UserRanking', {
	proxy: restProxy,
	
	getUserRanking: function(sessionId, userLogin, callbacks){
		return this.proxy.getUserRanking(sessionId, userLogin, callbacks);
	},

	getUserRankingStatistic: function(sessionId, userLogin, callbacks){
		return this.proxy.getUserRankingStatistic(sessionId, userLogin, callbacks);
	},
	
	getSessionRankingStatistic: function(sessionId, callbacks){
		return this.proxy.getSessionRankingStatistic(sessionId, callbacks);
	},
});
Ext.regStore('Answers', {
	model: 'Answer',

	data : [
        /* Welches Pattern gehört zu GRASP? */
        {id: 4, 	answer: 'Controller', 	question_id: 1, correct: true},
        {id: 13, 	answer: 'Creator', 		question_id: 1, correct: true},
        {id: 14, 	answer: 'Indirection', 	question_id: 1, correct: true},
        {id: 1, 	answer: 'Observer', 	question_id: 1, correct: false},
        {id: 2, 	answer: 'Bridge', 		question_id: 1, correct: false},
        {id: 3, 	answer: 'Flyweight', 	question_id: 1, correct: false},
        {id: 15, 	answer: 'State', 		question_id: 1, correct: false},
        {id: 16, 	answer: 'Visitor', 		question_id: 1, correct: false},
        
        /* Wer war nicht Mitglied der Gang of Four? */
        {id: 6, 	answer: 'Ivar Jacobson', 		question_id: 2, correct: true},
        {id: 9, 	answer: 'Christian Weber', 		question_id: 2, correct: true},
        {id: 11, 	answer: 'Michael Jackson', 		question_id: 2, correct: true},
        {id: 12, 	answer: 'Franz Beckenbauer',	question_id: 2, correct: true},
        {id: 5, 	answer: 'Erich Gamma', 			question_id: 2, correct: false},
        {id: 7, 	answer: 'Richard Helm', 		question_id: 2, correct: false},
        {id: 8, 	answer: 'Ralph Johnson', 		question_id: 2, correct: false},
        {id: 10, 	answer: 'John Vlissides', 		question_id: 2, correct: false},
    ],
});
Ext.regStore('Food', {
	fields: ['name', 'value'],
});

Ext.regStore('Questions', {
	model: 'Question',

	data : [
        {id: 1, title: 'GRASP', question: 'Welches Pattern gehört zu GRASP?'},
        {id: 2, title: 'GOF', question: 'Wer war nicht Mitglied der Gang of Four?'},
    ],
});
Ext.regStore('Sessions', {
	model: 'Session',

//	proxy: {
//        type: 'localstorage',
//        id  : 'sessions'
//    }
	proxy: restProxy,
});

ARSnova.views.CheckFullscreenPanel = Ext.extend(Ext.Panel, {
	floating: true,
	modal: true,
	centered: true,
	width: 300,
	styleHtmlContent: true,
	
	items: [{
		html: '<center>ARSnova ist eine HTML5-App.<br>Bitte benutzen Sie nur die Navigationslemente in der App und <b>nicht</b> die Vor- oder Zurück-Buttons Ihres Browsers.</center>',
	}, {
		xtype: 'button',
		ui: 'confirm',
		style: {
			width: '50%',
			margin: '0pt auto',
			marginTop: '10px',
		},
		text: 'okay',
		handler: function(){
			this.up('panel').hide();
		}
	}],
	
	constructor: function(){
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			title: 'Hinweis zu ARSnova',
		}];
		
		ARSnova.views.CheckFullscreenPanel.superclass.constructor.call(this);
	},

	initComponent: function(){		
		this.on('hide', function(){
			localStorage.setItem('html5 info readed', '');
			this.destroy();
		});
		
		ARSnova.views.CheckFullscreenPanel.superclass.initComponent.call(this);
	},
});
ARSnova.views.LoginPanel = Ext.extend(Ext.Panel, {
	fullscreen: true,
	scroll: 'vertical',
	
	layoutOnOrientationChange: false,
    monitorOrientation: false,
	
	constructor: function(){
		this.defaults = {
			xtype	: 'button',
			handler	: function(b) {
				Ext.dispatch({
					controller	: 'auth',
					action		: 'login',
					mode		: b.value,
				});
			},
		};
		
		var threeButtons = [];
		if (window.innerWidth > 600) {
			threeButtons = [{
				text	: 'Facebook',
				cls		: 'three-login-button facebook-wide',
				value	: ARSnova.LOGIN_FACEBOOK,
			}, {
				text	: 'Twitter',
				cls		: 'three-login-button twitter-wide',
				value	: ARSnova.LOGIN_TWITTER,
			}, {
				text	: 'Google',
				cls		: 'three-login-button google-wide',
				value	: ARSnova.LOGIN_GOOGLE,
			}, {
				xtype: 'panel',
				style: {
					clear: 'both',
				}
			}];
		} else {
			threeButtons = [{
				cls		: 'three-login-button facebook',
				value	: ARSnova.LOGIN_FACEBOOK,
			}, {
				cls		: 'three-login-button twitter',
				value	: ARSnova.LOGIN_TWITTER,
			}, {
				cls		: 'three-login-button google',
				value	: ARSnova.LOGIN_GOOGLE,
			}, {
				xtype: 'panel',
				style: {
					clear: 'both',
				}
			}];
		}
		
		this.items = [{
			xtype	: 'panel',
			cls		: null,
			style	: { marginTop: '20px'},
			html	: "<div class='arsnova-logo' style=\"background: url('" + ARSnova.config.logo + "') no-repeat center; height:" + ARSnova.config.logoheight + "\"></div>",
		}, {
			xtype	: 'panel',
			cls		: 'gravure',
			style	: { marginTop: '0px'},
			html	: 'Wählen Sie Ihren Zugang:',
		}, {
			text	: 'Gast',
			style	: { marginTop: '10px'},
			cls		: 'login-button login-label-guest',
			value	: ARSnova.LOGIN_GUEST,
//		}, {
//			xtype: 'panel',
//			style: {
//				padding: '10px',
//			},
//			defaults : {
//				xtype	: 'button',
//				handler	: function(b) {
//					Ext.dispatch({
//						controller	: 'auth',
//						action		: 'login',
//						mode		: b.value,
//					});
//				},
//			},
//			items: threeButtons,
		}, {
			text	: ARSnova.config.departure,
			cls		: 'login-button',
			ui		: 'confirm',
			value	: ARSnova.LOGIN_THM,
			handler : function(b) {
				
				/* PhoneGap TEST */
				if (ARSnova.isNative()) {
					var options = new ContactFindOptions();
			        options.filter = "Christian"; 
			        var fields = ["displayName", "name"];
			        navigator.contacts.find(fields, function(contacts) {
			            for (var i = 0; i < contacts.length; i++) {
			                console.log("Display Name = " + contacts[i].displayName);
			            }
			        }, function(contactError) {
			            alert('onError!');
			        }, options);
				} else {
					Ext.dispatch({
						controller	: 'auth',
						action		: 'login',
						mode		: b.value,
					});
				}
			}
		}, {
			xtype	: 'panel',
			style	: { marginTop: '30px'},
			html	: "<div class='thm-logo' style=\"background: url('" + ARSnova.config.departurelogo + "') no-repeat center; height:" + ARSnova.config.departurelogoheight + "\"></div>",
			cls		: null,
		}, {
			xtype: 'button',
			text: 'Rolle wechseln', 
			cls: 'backToRole',
			handler: function(){
				ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.rolePanel, {
					type: 'slide',
					direction: 'right',
					duration: 500,
				})
			}
		}];
		
		ARSnova.views.LoginPanel.superclass.constructor.call(this);
	},
});
ARSnova.views.MainTabPanel = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
    tabBar: {
    	hidden: true,
    },
    
    /* items */
    rolePanel	: null,
    loginPanel	: null,
    tabpanel	: null,

	constructor: function(){
		this.loginPanel = new ARSnova.views.LoginPanel();
		this.rolePanel = new ARSnova.views.RolePanel();
		this.tabPanel = new ARSnova.views.TabPanel();

		this.items = [
			this.rolePanel,
			this.loginPanel,
			this.tabPanel,
		],
		
		ARSnova.views.MainTabPanel.superclass.constructor.call(this);
	},
	
	setActiveItem: function(card, animation){
		if (typeof(animation) == 'object')
			animation.duration = ARSnova.cardSwitchDuration;
		else
			animation = {
				type: animation,
				duration: ARSnova.cardSwitchDuration,
			};
		
		ARSnova.views.TabPanel.superclass.setActiveItem.apply(this, arguments);
	}
});
ARSnova.views.NumericKeypad = Ext.extend(Ext.form.Text, {
    ui: 'number',
    inputType: 'text',
    minValue : undefined,
    maxValue : undefined,
    stepValue : undefined,
    renderTpl: [
        '<tpl if="label"><div class="x-form-label"><span>{label}</span></div></tpl>',
        '<tpl if="fieldEl"><div class="x-form-field-container">',
            '<input id="{inputId}" type="{inputType}" name="{name}" pattern="[0-9]*" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="minValue != undefined">min="{minValue}" </tpl>',
                '<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
                '<tpl if="maxLength != undefined">maxlength="{maxLength}" </tpl>',
                '<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
                '<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
            '/>',
            '<tpl if="useMask"><div class="x-field-mask"></div></tpl>',
            '</div></tpl>',
        '<tpl if="useClearIcon"><div class="x-field-clear-container"><div class="x-field-clear x-hidden-visibility">&#215;</div><div></tpl>'
    ],
    // @private
    onRender : function() {
        Ext.apply(this.renderData, {
            maxValue 	: this.maxValue,
            maxLength 	: this.maxLength,
            minValue 	: this.minValue,
            stepValue 	: this.stepValue,
            placeHolder	: this.placeHolder,
        });
        
        ARSnova.views.NumericKeypad.superclass.onRender.apply(this, arguments);
    }
});

Ext.reg('numericKeypad', ARSnova.views.NumericKeypad);
ARSnova.views.Question = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	questionObj: null,
	
	constructor: function(questionObj){
		var answerStore = new Ext.data.Store({model: 'Answer'});
		this.questionObj = questionObj;
		
		if (questionObj.questionType && (questionObj.questionType == 'yesno' || questionObj.questionType == 'mc'))
			questionObj.possibleAnswers.shuffle();
		
		answerStore.add(questionObj.possibleAnswers);
		
		this.items = [{
			cls: 'roundedBox',
			html: 
				'<p class="title">' + questionObj.subject + '<p/>' + 
				'<p>' + questionObj.text + '</p>',
		}, {
			xtype	: 'list',
			store	: answerStore,
			
			cls: 'roundedBox',
			scroll: 'vertical',
			
			itemTpl	: '{text}',
			listeners: {
				'itemtap': function(list, index, element, e) {
					var answerObj 	= questionObj.possibleAnswers[index];
					
					/* for use in Ext.Msg.confirm */
					answerObj.selModel = list.selModel;
					answerObj.target = e.target;
					
					Ext.Msg.confirm(
						'Antwort "' + answerObj.data.text + '"', 
						'Sind sie sicher?', 
						function(button, index) {
							if(button == 'yes') {
								/**
								 * firstly check if user has answered the question in a session or in an archive
								 */
								if(ARSnova.mainTabPanel.tabPanel.layout.activeItem == ARSnova.mainTabPanel.tabPanel.archiveTabPanel){
									/* in archive */
									if (answerObj.target.className == "x-list-item-body")
										answerObj.target = answerObj.target.parentElement;
									
									if (questionObj.showAnswer) {
										if (answerObj.data.correct && (answerObj.data.correct == 1 || answerObj.data.correct == true)) {
											answerObj.target.className = "x-list-item x-list-item-correct";
										} else {
											for ( var i = 0; i < questionObj.possibleAnswers.length; i++) {
												var answer = questionObj.possibleAnswers[i].data;
												if(answer.correct && (answer.correct == 1 || answer.correct == true)){
													list.el.dom.childNodes[0].childNodes[i].className = "x-list-item x-list-item-correct";
												}
											}
										}
									} else {
										if(questionObj.questionType == "yesno" || questionObj.questionType == "mc" || questionObj.questionType == "abcd")
										setTimeout('Ext.Msg.alert("Hinweis", "Der Dozent hat die richtige Antwort noch nicht freigegeben.");Ext.Msg.doComponentLayout();', 800);
									}
									list.up("panel").disable();
								} else {
									/* in session */
									var tab = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.tab;
									tab.setBadge(tab.badgeText - 1);
									var button = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton;
									button.setBadge(button.badgeText - 1);
									
									if (answerObj.target.className == "x-list-item-body")
										answerObj.target = answerObj.target.parentElement;
									
									if (questionObj.showAnswer) {
										if (answerObj.data.correct && (answerObj.data.correct == 1 || answerObj.data.correct == true)) {
											answerObj.target.className = "x-list-item x-list-item-correct";
										} else {
											for ( var i = 0; i < questionObj.possibleAnswers.length; i++) {
												var answer = questionObj.possibleAnswers[i].data;
												if(answer.correct && (answer.correct == 1 || answer.correct == true)){
													list.el.dom.childNodes[0].childNodes[i].className = "x-list-item x-list-item-correct";
												}
											}
										}
									}
									
									ARSnova.answerModel.getUserAnswer(questionObj._id, localStorage.getItem("login"), {
										success: function(response){
							    			var panel = ARSnova.mainTabPanel.layout.activeItem;
											var responseObj = Ext.decode(response.responseText).rows;
											if (responseObj.length == 0) {
												//create
												var answer = Ext.ModelMgr.create({
													type	 	: "skill_question_answer",
													sessionId	: localStorage.getItem("sessionId"),
													questionId	: questionObj._id,
													answerText	: answerObj.data.text,
													user		: localStorage.getItem("login"),
												}, 'Answer');
											} else {
												//update
												var answer = Ext.ModelMgr.create(responseObj[0].value, "Answer");
												answer.set('answerText', answerObj.data.text);
											}
											
											answer.save({
												success: function() {
								    				var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
								    				if (questionsArr.indexOf(questionObj._id) == -1)
								    					questionsArr.push(questionObj._id);
								    				localStorage.setItem('questionIds', Ext.encode(questionsArr));							    				
								    				
													list.up("panel").disable();
													Ext.Msg.alert(answerObj.data.text, "Ihre Antwort ist gespeichert.");
													Ext.Msg.doComponentLayout();
													setTimeout("Ext.Msg.hide()", 2000);
												},
												failure: function(response, opts) {
													console.log(response);
									    			console.log(opts);
									    	  		console.log('server-side error');
									    	  		Ext.Msg.alert("Hinweis!", "Die Antwort konnte nicht gespeichert werden");
									    	  		Ext.Msg.doComponentLayout();
												}
											});
										},
										failure: function(){
							    			console.log('server-side error');
							    		},
									});
								}
							} else {
								answerObj.selModel.deselect(answerObj.selModel.selected.items[0]);
							}
						}
					);
					Ext.Msg.doComponentLayout();
				},
			},
		}];
		
		ARSnova.views.Question.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			/*
			 * Bugfix, because panel is normally disabled (isDisabled == true),
			 * but is not rendered as 'disabled'
			 */
			if(this.isDisabled()) this.disable();
		});
		
		ARSnova.views.Question.superclass.initComponent.call(this);
	},
});


function arrayShuffle(){
  var tmp, rand;
  for(var i =0; i < this.length; i++){
    rand = Math.floor(Math.random() * this.length);
    tmp = this[i]; 
    this[i] = this[rand]; 
    this[rand] =tmp;
  }
};
Array.prototype.shuffle = arrayShuffle;

ARSnova.views.QuestionStatusButton = Ext.extend(Ext.Panel, {
	cls	: 'threeButtons left',
	handler: null,
	isOpen: false,
	
	questionObj: null,
	
	questionIsOpenButton: null,
	questionIsClosedButton: null,
	
	constructor: function(questionObj){
		this.questionObj = questionObj;
		
		this.questionIsClosedButton = new Ext.Button({
			cls			: 'closedSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionStatusButton.changeStatus();
			},
		});
		
		this.questionIsClosedText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: 'Frage freigeben',
		});
		
		this.questionIsOpenButton = new Ext.Button({
			cls			: 'openSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionStatusButton.changeStatus();
			},
		});
		
		this.questionIsOpenText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: 'Frage sperren',
		});

		this.items = [this.questionIsClosedButton, this.questionIsClosedText, this.questionIsOpenButton, this.questionIsOpenText];
		
		if(this.questionObj.active == 1){
			this.isOpen = true;
			this.questionIsClosedButton.hide();
			this.questionIsClosedText.hide();
		} else {
			this.isOpen = false;
			this.questionIsOpenButton.hide();
			this.questionIsOpenText.hide();
		}

		ARSnova.views.QuestionStatusButton.superclass.constructor.call(this);
	},
	
	changeStatus: function(){
		var id = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.questionObj._id;
		
		if(this.isOpen){
			/* close this question */
			Ext.dispatch({
				controller	: 'questions',
				action		: 'setActive',
				questionId	: id, 
				active		: 0,
				callback	: this.questionClosedSuccessfully
			})
		} else {
			/* open this question */
			Ext.dispatch({
				controller	: 'questions',
				action		: 'setActive',
				questionId	: id,
				active		: 1,
				callback	: this.questionOpenedSuccessfully
			})
		}
	},
	
	checkInitialStatus: function(){
		if(this.isRendered) return;
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		ARSnova.mainTabPanel.layout.activeItem.doLayout();
		this.isRendered = true;
	},
	
	questionClosedSuccessfully: function(){
		this.isOpen = false;
		this.questionIsClosedButton.show();
		this.questionIsClosedText.show();
		this.questionIsOpenButton.hide();
		this.questionIsOpenText.hide();
		ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.editButton.show();
	},
	
	questionOpenedSuccessfully: function(){
		this.isOpen = true;
		this.questionIsOpenButton.show();
		this.questionIsOpenText.show();
		this.questionIsClosedButton.hide();
		this.questionIsClosedText.hide();
		ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.editButton.hide()
	},
}); 
ARSnova.views.RolePanel = Ext.extend(Ext.Panel, {
	fullscreen: true,
	scroll: 'vertical',
	
	constructor: function(){
		this.defaults = {
			xtype	: 'button',
			handler	: function(b) {
				Ext.dispatch({
					controller	: 'auth',
					action		: 'roleSelect',
					mode		: b.value,
				});
			},
		};
		
		this.items = [{
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo' style=\"background: url('" + ARSnova.config.logo + "') no-repeat center; height:" + ARSnova.config.logoheight + "\"></div>",
			style	: { marginTop: '35px'},
		}, {
			xtype	: 'panel',
			cls		: 'gravure',
			html	: 'Wählen Sie Ihre Rolle:',	
		}, {	
			text	: 'Zuhörer/in',
			cls		: 'login-button role-label-student',
			value	: ARSnova.USER_ROLE_STUDENT,
		}, {
			text	: 'Dozent/in',
			cls		: 'login-button role-label-speaker',
			value	: ARSnova.USER_ROLE_SPEAKER,
		}, {
			xtype	: 'panel',
			style	: { marginTop: '30px'},
			html	: "<div class='thm-logo' style=\"background: url('" + ARSnova.config.departurelogo + "') no-repeat center; height:" + ARSnova.config.departurelogoheight + "\"></div>",
			cls		: null,
		}];
		
		ARSnova.views.RolePanel.superclass.constructor.call(this);
	},
});
ARSnova.views.SessionStatusButton = Ext.extend(Ext.Panel, {
	cls	: 'threeButtons left',
	handler: null,
	isOpen: false,
	
	sessionIsOpenButton: null,
	sessionIsClosedButton: null,
	
	constructor: function(){
		this.sessionIsClosedButton = new Ext.Button({
			cls			: 'closedSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			},
		});
		
		this.sessionIsClosedText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: 'Session freigeben',
		});
		
		this.sessionIsOpenButton = new Ext.Button({
			cls			: 'openSession',
			handler		: function(){
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton.changeStatus();
			},
		});
		
		this.sessionIsOpenText = new Ext.Panel({
			cls	: 'centerTextSmall',
			html: 'Session sperren',
		});

		this.items = [this.sessionIsClosedButton, this.sessionIsClosedText, this.sessionIsOpenButton, this.sessionIsOpenText];
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
			this.sessionIsClosedButton.hide();
			this.sessionIsClosedText.hide();
		} else {
			this.isOpen = false;
			this.sessionIsOpenButton.hide();
			this.sessionIsOpenText.hide();
		}

		ARSnova.views.SessionStatusButton.superclass.constructor.call(this);
	},
	
	changeStatus: function(){
		if(this.isOpen){
			/* close this session */
			Ext.dispatch({
				controller	: 'sessions',
				action		: 'setActive',
				active		: 0,
				callback	: this.sessionClosedSuccessfully
			})
		} else {
			/* open this session */
			Ext.dispatch({
				controller	: 'sessions',
				action		: 'setActive',
				active		: 1,
				callback	: this.sessionOpenedSuccessfully
			})
		}
	},
	
	checkInitialStatus: function(){
		if(this.isRendered) return;
		
		if(localStorage.getItem('active') == 1){
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.inClassActions.doLayout();
		this.isRendered = true;
	},
	
	sessionClosedSuccessfully: function(){
		this.isOpen = false;
		this.sessionIsClosedButton.show();
		this.sessionIsClosedText.show();
		this.sessionIsOpenButton.hide();
		this.sessionIsOpenText.hide();
	},
	
	sessionOpenedSuccessfully: function(){
		this.isOpen = true;
		this.sessionIsOpenButton.show();
		this.sessionIsOpenText.show();
		this.sessionIsClosedButton.hide();
		this.sessionIsClosedText.hide();
	},
}); 
ARSnova.views.TabPanel = Ext.extend(Ext.TabPanel, {
	fullscreen: true,
    tabBar: {
    	dock: 'bottom',
	    layout: {
	    	pack: 'center'
	    },
    },
	scroll: false,
	
    /* items */
	homeTabPanel 	: null,
    settingsPanel 	: null,
    canteenTabPanel : null,

    /* panels will be created in  sessions/reloadData */
    userQuizPanel	  	: null,
    feedbackTabPanel	: null,
    
    /**
     * task for everyone in a session
	 * count every 15 seconds the session feedback and adapt the icon
	 * 
	 */
	updateFeedbackTask: {
		name: 'update the feedback icon and badge in tabbar',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.updateFeedbackBadge();
			ARSnova.mainTabPanel.tabPanel.updateFeedbackIcon();
		},
		interval: 15000, //15 seconds
	},
	
	constructor: function(){		
		this.homeTabPanel 	= new ARSnova.views.home.TabPanel();
		this.canteenTabPanel= new ARSnova.views.canteen.TabPanel();
//		this.archiveTabPanel= new ARSnova.views.archive.TabPanel();
		this.infoTabPanel 	= new ARSnova.views.about.TabPanel();
		
		this.items = [
			this.homeTabPanel,
			this.canteenTabPanel,
//			this.archiveTabPanel,
			this.infoTabPanel,
		],
		
		ARSnova.views.TabPanel.superclass.constructor.call(this);
	},
	
	setActiveItem: function(card, animation){
		this.tabBar.activeTab = card.tab; //for correct animation direction
		
		if (typeof(animation) == 'object')
			animation.duration = ARSnova.cardSwitchDuration;
		else {
			animation = {
				type: animation,
				direction: 'left',
				duration: ARSnova.cardSwitchDuration,
			};
		}
		ARSnova.views.TabPanel.superclass.setActiveItem.apply(this, arguments);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.TabPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		if(ARSnova.checkSessionLogin()){
			/* only start task if user/speaker is not(!) on feedbackTabPanel/statisticPanel (feedback chart)
			 * because there is a own function which will check for new feedbacks and update the tab bar icon */
			if(ARSnova.mainTabPanel.tabPanel.layout.activeItem != ARSnova.mainTabPanel.tabPanel.feedbackTabPanel)
				taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		}
	},

	onDeactivate: function(){
		if(ARSnova.checkSessionLogin()){
			if(ARSnova.mainTabPanel.tabPanel.layout.activeItem != ARSnova.mainTabPanel.tabPanel.feedbackTabPanel)
				taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		}
	},
	
	updateFeedbackIcon: function(){
		ARSnova.feedbackModel.getAverageSessionFeedback(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
				
				var responseObj = Ext.decode(response.responseText).rows;
				
				if (responseObj.length > 0){
					switch (responseObj[0].value){
					case 4:
						panel.tab.setIconClass("feedbackGood");
						break;
					case 3:
						panel.tab.setIconClass("feedbackMedium");
						break;
					case 2:
						panel.tab.setIconClass("feedbackBad");
						break;
					case 1:
						panel.tab.setIconClass("feedbackNone");
						break;	
					default:
						break;
					}
				} else {
					panel.tab.setIconClass("feedbackARSnova");
				}
			}, 
			failure: function(){
				console.log('server-side error');
			}
		})
	},
	
	updateFeedbackBadge: function(){
		ARSnova.feedbackModel.countFeedback(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				
				ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadge(value);
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});
Ext.namespace('ARSnova.views.about');

ARSnova.views.about.AboutPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Info',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Über ARSnova',
			items: [
		        this.backButton,
			]
		});
		
		this.infoPanel = new Ext.form.FormPanel({
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton',
			},
		
			items: [{
				text	: 'Was bedeutet \u201eARS\u201f?',
				handler	: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.arsPanel = new ARSnova.views.about.ARSPanel();
					me.setActiveItem(me.arsPanel, 'slide');
				},
			}, {
				text	: 'ARSnova ist \u201eSocial Software\u201f',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.socialSoftwarePanel = new ARSnova.views.about.SocialSoftwarePanel();
					me.setActiveItem(me.socialSoftwarePanel, 'slide');
				},
			}, {
				text	: 'Bedienungshilfen',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpMainPanel = new ARSnova.views.about.HelpMainPanel();
					me.setActiveItem(me.helpMainPanel, 'slide');
				},
			}, {
				text	: 'ARS in der Lehre',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.ARSinLessonPanel = new ARSnova.views.about.ARSinLessonPanel();
					me.setActiveItem(me.ARSinLessonPanel, 'slide');
				},
			}],
		});
		
		
		this.dockedItems = [this.toolbar];
		this.items 		 = [this.infoPanel];
		
		ARSnova.views.about.AboutPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.AboutPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.ARSPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Über',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: '"ARS"',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>ARS steht für Audience Response System, siehe <a href="http://en.wikipedia.org/wiki/Audience_response" class="external" target="_blank">Wikipedia</a>.</p><br>' +
					'<p>Die didaktischen Probleme von Großveranstaltungen sind hinlänglich bekannt: fehlende Interaktion zwischen Auditorium und Lehrperson, schwierige Aktivierung der Studierenden, ängstliche Studierende melden sich nicht zu Wort. Dennoch kann aus Kapazitätsgründen nicht auf große Vorlesungen verzichtet werden.</p><br>' +
					'<p>Um das Verständnis der Zuhörer/innen einfach und schnell einzuholen, können Fragen anonym auf dem Smartphone oder Laptop beantwortet werden – ähnlich wie bei der Publikumsfrage in der Quizshow von Günther Jauch. Das Ergebnis wird als Balkendiagramm visualisiert und kann direkt von der Lehrperson kommentiert werden. Die Feedback-Funktion von ARSnova erlaubt es, das Tempo der Vorlesung vom Auditorium zeitnah bewerten zu lassen.</p>', 
		}];
		
		ARSnova.views.about.ARSPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.ARSPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.ARSinLessonPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Über',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'ARS in der Lehre',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: '<p>Text folgt in Kürze...</p>', 
		}];
		
		ARSnova.views.about.ARSinLessonPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.ARSinLessonPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.HelpHomePanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Zurück',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Hilfe: Startseite',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>Nach der Anmeldung als Gast oder Mitglied der THM wird die Startseite von ARSnova angezeigt. Hier gibt es zwei Möglichkeiten, eine Session zu besuchen:</p><br>' +
					'<ol class="standardList">' +
						'<li>Man tritt einer Session durch Eingabe der 8-stelligen Session-ID bei oder</li>' +
						'<li>man tippt auf den \u201eSessions\u201f-Button, um eine kürzlich besuchte Session ohne Eingabe der Session-ID erneut zu besuchen.</li>' +
					'</ol><br>' +
					'<p>Will man eine neue Session anlegen, tippt man auf den \u201eSessions\u201f-Button, um auf der folgenden Seite über das \u201ePlus\u201f-Icon oben rechts oder den gleichnamigen Button eine neue Session anzulegen. Eigene Sessions können dort direkt angesprungen werden.</p><br>' +
					'<p>Eine Session in grüner Schrift ist geöffnet, sonst gesperrt.</p>',
		}];
		
		ARSnova.views.about.HelpHomePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpHomePanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.HelpFeedbackPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Zurück',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Hilfe: Feedback',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: '<p>Eine Hilfe zum Feedback kommt in Kürze...</p>',
		}];
		
		ARSnova.views.about.HelpFeedbackPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpFeedbackPanel.superclass.initComponent.call(this);
	}
});
Ext.namespace('ARSnova.views.about');

ARSnova.views.about.HelpMainPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Über',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Hilfe',
			items: [
		        this.backButton,
			]
		});
		
		this.helpPanel = new Ext.form.FormPanel({
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton',
			},
		
			items: [{
				text	: 'Hilfe zu Home',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpHomePanel = new ARSnova.views.about.HelpHomePanel();
					me.setActiveItem(me.helpHomePanel, 'slide');
				},
			}, {
				text	: 'Hilfe zu Feedback',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpFeedbackPanel = new ARSnova.views.about.HelpFeedbackPanel();
					me.setActiveItem(me.helpFeedbackPanel, 'slide');
				},
			}, {
				text	: 'Hilfe zu Fragen',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpQuestionsPanel = new ARSnova.views.about.HelpQuestionsPanel();
					me.setActiveItem(me.helpQuestionsPanel, 'slide');
				},
			}, {
				text	: 'Hilfe zu Mensa',
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpCanteenPanel = new ARSnova.views.about.HelpCanteenPanel();
					me.setActiveItem(me.helpCanteenPanel, 'slide');
				},
			}],
		});
		
		
		this.dockedItems = [this.toolbar];
		this.items 		 = [this.helpPanel];
		
		ARSnova.views.about.HelpMainPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpMainPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.HelpQuestionsPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Zurück',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Hilfe: Fragen',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: '<p>Eine Hilfe zu den Fragen kommt in Kürze...</p>',
		}];
		
		ARSnova.views.about.HelpQuestionsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpQuestionsPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.HelpCanteenPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Zurück',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.helpMainPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Hilfe: Mensa',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: '<p>Eine Hilfe zur Mensa kommt in Kürze...</p>',
		}];
		
		ARSnova.views.about.HelpCanteenPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.HelpCanteenPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.ImpressumPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Info',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
					after		: function(){
//						this.up('panel').destroy();
					}
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Impressum',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>ARSnova ist ein Produkt der Fachgruppe WebMedia des Fachbereichs MNI der TH Mittelhessen.</p><br>' + 
					'<p>Die erste Version entwickelte Christian Thomas Weber im Rahmen seiner Masterarbeit.</p><br>' + 
					'<p>ARSnova ist Open Source unter der GNU General Public License v3.<br /><a href="https://scm.thm.de/redmine/projects/arsnova" class="external" target="_blank">Projekt-Site</a></p><br>' + 
					'<p>Projektleiter: Prof. Dr. Klaus Quibeldey-Cirkel <br />THM, Wiesenstr. 14, D-35390 Gießen<br />Tel.: 0641 / 309 - 24 50<br /><a href="mailto:klaus.quibeldey-cirkel@mni.thm.de">E-Mail</a></p>', 
		}];
		
		ARSnova.views.about.ImpressumPanel.superclass.constructor.call(this);
	},
});
ARSnova.views.about.InfoPanel = Ext.extend(Ext.Panel, {
	constructor: function(){
		this.toolbar = new Ext.Toolbar({
			title: 'Info',
			items: []
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			xtype: 'form',
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton',
			},
			
			items: [{
				text		: 'Über ARSnova',
				handler: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.aboutPanel = new ARSnova.views.about.AboutPanel();
					me.setActiveItem(me.aboutPanel, 'slide');
				},
			}, {
				text		: 'Statistik',
				handler		: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.statisticPanel = new ARSnova.views.about.StatisticPanel();
					me.setActiveItem(me.statisticPanel, 'slide');
				},
			}, {
				text		: 'Lob & Tadel',
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("https://scm.thm.de/redmine/projects/arsnova/boards/6");
						}
					}
				}
			}, {
				text		: 'Impressum',
				handler: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.impressumPanel = new ARSnova.views.about.ImpressumPanel();
					me.setActiveItem(me.impressumPanel, 'slide');
				},
			}]
		}];
		
		ARSnova.views.about.InfoPanel.superclass.constructor.call(this);
	},
});
ARSnova.views.about.SocialSoftwarePanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Über',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Social Software',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			cls: 'roundedBox fontNormal',
			html: 	'<p>Das Neue an ARSnova ist seine Konzeption als \u201eSocial Software\u201f:</p><br>' +
					'<ul class="standardList">' +
						'<li>Jeder kann ad hoc Sessions anlegen oder Sessions aufsuchen, eine App für beide Seiten: Dozent/in und Auditorium.</li>' +
						'<li>Anonymität wird garantiert. Keine Registrierung erforderlich.</li>' +
						'<li>Sessions und Session-Fragen können auf Gruppen beschränkt werden:' +
							'<ul class="innerList">' +
								'<li>alle Mitglieder der THM</li>' +
								'<li>alle Mitglieder eines Moodle-Kurses: <a class="external" href="https://moodle.thm.de" target="_blank">https://moodle.thm.de</a></li>' +
								'<li>alle Mitglieder eines eCollab-Projekts: <a class="external" href="https://ecollab.thm.de" target="_blank">https://ecollab.thm.de</a></li>' +
							'</ul>' +
						'</li>' +
					'</ul>', 
		}];
		
		ARSnova.views.about.SocialSoftwarePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.SocialSoftwarePanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.about.StatisticPanel = Ext.extend(Ext.Panel, {
//	layout: 'fit',
	scroll: 'vertical',
	gridPanel: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/**
	 * update the statistics table
	 */
	updateDataTask: {
		name: 'update the statistic table',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel.updateData();
		},
		interval: 30000,
	},
	
	constructor: function(){
		this.gridPanel = new Ext.DataView({
	        store: new Ext.data.Store({
	            model: 'Statistic',
	        }),
	        tpl: new Ext.XTemplate(
        		'<table class="statistic">',
	        		'<tr><thead><th>Kategorie</th><th>Anzahl</th></thead></tr>',
	        	    '<tpl for=".">',
	        	    	'<tr><td>{category}</td><td>{counter}</td></tr>',
		            '</tpl>',
	            '<table></div>'
	        ),
	        itemSelector: 'div',
	        scroll: false,
	    });
		
		this.backButton = new Ext.Button({
			text	: 'Info',
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.statisticPanel.on('deactivate', function(panel){
					panel.destroy();
				}, this, {single:true});
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
				})
				
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Statistik',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.gridPanel];
		
		ARSnova.views.about.StatisticPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.about.StatisticPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		taskManager.start(this.updateDataTask);
	},
	
	onDeactivate: function(){
		taskManager.stop(this.updateDataTask);
	},
	
	countActiveUsers: function(){
		ARSnova.statisticModel.countActiveUsers({
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;		
				if (res.length > 0){
					value = res[0].value;
				}
				var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
				me.gridPanel.store.add({category: "User online", counter: value})
				me.gridPanel.store.sort([{
					property : 'category',
					direction: 'DESC'
				}]);
			},
			failure: function(response){
				console.log('server-side error, countActiveUsers');
			},
		})
	},
	
	countSessions: function(){
		ARSnova.statisticModel.countSessions({
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				
				var closed 		= 0,
					open		= 0,
					questions 	= 0,
					answers		= 0;
				
				for (var i = 0; i < res.length; i++) {
					var el = res[i];
					switch (el.key) {
						case "closedSessions":
							closed = el.value;
							break;
						case "openSessions":
							open = el.value;
							break;
						case "questions":
							questions = el.value;
							break;
						case "answers":
							answers = el.value;
							break;
						default:
							break;
					}
				};
				var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel.statisticPanel;
				me.gridPanel.store.add({category: "Offene Sessions", counter: open});
				me.gridPanel.store.add({category: "Geschlossene Sessions", counter: closed});
				me.gridPanel.store.add({category: "Fragen", counter: questions});
				me.gridPanel.store.add({category: "Antworten", counter: answers});
				me.gridPanel.store.sort([{
					property : 'category',
					direction: 'DESC'
				}]);
				me.doComponentLayout();
				setTimeout("ARSnova.hideLoadMask()", 500);
			},
			failure: function(response){
				console.log('server-side error, countOpenSessions');
			},
		})
	},
	
	updateData: function(){
		ARSnova.showLoadMask('Aktualisiere die Daten...');
		this.gridPanel.store.clearData();
		this.countActiveUsers();
		this.countSessions();
	},
});
ARSnova.views.about.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Info',
	iconCls	: 'tabBarIconInfo',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.infoPanel = new ARSnova.views.about.InfoPanel();
		
		this.items = [
		    this.infoPanel,
        ];
		ARSnova.views.about.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', function(){
			this.layout.activeItem.fireEvent('deactivate');
		});
		
		this.on('activate', function(){
			this.layout.activeItem.fireEvent('activate');
		});
		
		ARSnova.views.about.TabPanel.superclass.initComponent.call(this);
	},
});
Ext.ns('ARSnova.views.archive');

ARSnova.views.archive.CoursePanel = Ext.extend(Ext.Panel, {
	selectField: null,
	
	/* toolbar items */
	toolbar				: null,
	backButton			: null,
	
	constructor: function(){
		this.toolbar = new Ext.Toolbar({
			title: 'Archiv',
		});
		
		this.dockedItems = [this.toolbar];
		
		this.courseForm = new Ext.form.FormPanel({
			cls: 'standardForm',
		});
		
		this.normalForm = new Ext.form.FormPanel({
			cls: 'standardForm',
			items: [{
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Alle Archiv-Fragen',
				cls			: 'forwardListButton',
				courseId	: 'all',
				handler		: function(obj){
					Ext.dispatch({
						controller: 'archive',
						action: 'showArchive',
						courseId: obj.courseId,
					})
				}
			}, {
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Fragen für THM-Mitglieder',
				cls			: 'forwardListButton',
				courseId	: 'thm',
				handler		: function(obj){
					Ext.dispatch({
						controller: 'archive',
						action: 'showArchive',
						courseId: obj.courseId,
					})
				}
			}]
		});
		
		this.items = [{
			cls: 'gravure',
			html: 'Welche Fragen möchten Sie sehen:',
		}, this.normalForm, {
			cls: 'gravure',
			html: 'Fragen meiner eStudy-Kurse:',
		}, this.courseForm];
		
		ARSnova.views.archive.CoursePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);

		ARSnova.views.archive.CoursePanel.superclass.initComponent.call(this);
	},
	
	getCourses: function(){
		ARSnova.showLoadMask("Suche Ihre Kurse...");
		if (ARSnova.loggedIn){
			Ext.Ajax.request({
	    		url: ARSnova.WEBSERVICE_URL + 'estudy/getUserCourses.php',
	    		params: {
	    			login: localStorage.getItem('login'),
	    		},
	    		success: function(response, opts){
	    	  		var obj = Ext.decode(response.responseText).courselist;
	    	  		var panel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.coursePanel;
	    	  		
	    	  		/* Build new options array */
	    	  		var coursesObj = new Array();
	    	  		for ( var i = 0; i < obj.count; i++){
						var course = obj.course[i];
						panel.courseForm.add({
							xtype		: 'button',
							ui			: 'normal',
							text		: course.name,
							cls			: 'forwardListButton',
							courseId	: course.id,
							handler		: function(obj){
								Ext.dispatch({
									controller: 'archive',
									action: 'showArchive',
									courseId: obj.courseId,
								})
							},
						});
					}
	    	  		panel.doComponentLayout();
	    	  		ARSnova.hideLoadMask();
	    		},
	    		failure: function(response, opts){
	    	  		console.log('getcourses server-side failure with status code ' + response.status);
	    	  		Ext.Msg.alert("Hinweis!", "Es konnten keine Kurse überprüft werden.");
	    	  		Ext.Msg.doComponentLayout();
	    		},
	    	});
		} else {
			Ext.Ajax.request({
	    		url: ARSnova.WEBSERVICE_URL + 'estudy/getAllCourses.php',
	    		success: function(response, opts){
	    	  		var obj = Ext.decode(response.responseText).courselist;
	    	  		
	    	  		/* Build new options array */
	    	  		var coursesObj = new Array();
	    	  		for ( var i = 0; i < obj.count; i++){
						var course = obj.course[i];
						coursesObj.push({
							text	: course.name,
							value	: course.id,
							name	: course.id
						});
					}
	    	  		/* get archivePanel and append (!) new options */
	    	  		var archivePanel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.archivePanel;
	    	  		archivePanel.selectField.setOptions(coursesObj, true);
	    	  		archivePanel.setLoading(false);
	    		},
	    		failure: function(response, opts){
	    	  		console.log('getcourses server-side failure with status code ' + response.status);
	    	  		Ext.Msg.alert("Hinweis!", "Es konnten keine Kurse überprüft werden.");
	    	  		Ext.Msg.doComponentLayout();
	    		},
	    	});
		}
	},
	
	onActivate: function(){
		this.courseForm.removeAll();
		this.getCourses();
	},
});
ARSnova.views.archive.QuestionPanel = Ext.extend(Ext.Carousel, {
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	courseId: null,
	questionCounter: 0,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			handler	: function() {
				var aTP = ARSnova.mainTabPanel.tabPanel.archiveTabPanel;
				aTP.setActiveItem(aTP.coursePanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    	});
			},
		});
		
		this.listeners = {
			cardswitch: function(panel, newCard, oldCard, index, animated){
				//update toolbar with question number
				var questionNumber = "Archiv-Frage";
				if(newCard.questionObj.number)
					questionNumber += " " + newCard.questionObj.number;
				panel.toolbar.setTitle(questionNumber);
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = index + 1;
				counterEl.update(counter.join("/"));
			}				
		};
		
		this.questionCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Archiv-Frage',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.questionCounter
	        ]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.archive.QuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', this.beforeActivate);
		this.on('activate', this.onActivate);
		
		ARSnova.views.archive.QuestionPanel.superclass.initComponent.call(this);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
	},
	
	onActivate: function(){
		ARSnova.showLoadMask("Suche Fragen...");
		this.getCourseQuestions();
	},
	
	getCourseQuestions: function(){
		ARSnova.questionModel.releasedByCourseId(this.courseId, {
			success: function(response){
				var questionPanel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.questionPanel;
				var questions = Ext.decode(response.responseText).rows;
				var questionsArr = [];
				var questionIds = [];
				
				if (questions.length == 0){
					//no questions found
					questionPanel.questionCounter.hide();
					questionPanel.add({
						cls: 'centerText',
						html: 'Es wurden noch keine Fragen freigegeben.',
					});
					questionPanel.indicator.hide();
					questionPanel.doLayout();
					ARSnova.hideLoadMask();
					return;
				} else {
					//update question counter in toolbar
					var counterEl = questionPanel.questionCounter;
					var counter = counterEl.el.dom.innerHTML.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.update(counter.join("/"));
				}
				
				if (questions.length == 1){
					questionPanel.indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
					questionPanel.addQuestion(question);
				});
				questionPanel.doComponentLayout();
				ARSnova.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
		
	addQuestion: function(question){
		this.add(new ARSnova.views.Question(question.value));
	},
});
ARSnova.views.archive.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Archiv',
	iconCls	: 'time',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.coursePanel = new ARSnova.views.archive.CoursePanel();
		this.questionPanel = new ARSnova.views.archive.QuestionPanel();
		
		this.items = [
            this.coursePanel,
            this.questionPanel,
        ];
		ARSnova.views.archive.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){		
		
		ARSnova.views.archive.TabPanel.superclass.initComponent.call(this);
	}
});
Ext.namespace('ARSnova.views.canteen');

canteenChartColors = ['url(#v1)', 'url(#v2)', 'url(#v3)', 'url(#v4)'],

ARSnova.views.canteen.StatisticPanel = Ext.extend(Ext.Panel, {
	title	: 'Mensa',
	iconCls	: 'tabBarIconCanteen',
	layout	: 'fit',
	
	canteenChart: null,
	
	/* toolbar items */
	toolbar				: null,
	canteenVoteButton	: null,
	
	renewChartDataTask: {
		name: 'renew chart data at canteen panel',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000,
	},
	
	updateCanteenBadgeIconTask: {
		name: 'update the badge of the canteen tab',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.updateCanteenBadgeIcon();
		},
		interval: 30000,
	},
	
	constructor: function(){
		this.canteenVoteButton = new Ext.Button({
			text	: 'Ich empfehle ...',
			ui		: 'confirm',
			scope	: this,
			handler	: function() {
				taskManager.stop(this.renewChartDataTask);
				ARSnova.mainTabPanel.tabPanel.canteenTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenTabPanel.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700,
					}
				);
			},
		});
		
		this.casLoginButton = new Ext.Button({
			text	: 'Login',
			ui		: 'action',
			scope	: this,
			hidden	: true,
			handler	: function() {

			},
		});
		
		this.toolbar = new Ext.Toolbar({
			items: [
	            {xtype: 'spacer'},
	            this.canteenVoteButton,
	            {xtype: 'spacer'},
			]
		});
		
		this.canteenChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: 'Food',

		    animate: {
		        easing: 'bounceOut',
		        duration: 1000
		    },
		    
		    interactions: [{
		        type: 'reset'
		    }, {
		        type: 'panzoom'
		    }],
		    
		    gradients: [{
		    	'id': 'v1',
		        'angle': 0,
		        stops: {
		            0:   { color: '#660099' },
		            100: { color: '#9932CC' }
		        }
		    },
		    {
		        'id': 'v2',
		        'angle': 0,
		        stops: {
		            0:   { color: '#BB4B20' },
		            100: { color: '#FF7F50' }
		        }
		    },
		    {
		        'id': 'v3',
		        'angle': 0,
		        stops: {
		            0:   { color: '#786332' },
		            100: { color: '#AB9665' }
		        }
		    },
		    {
		        'id': 'v4',
		        'angle': 0,
		        stops: {
		            0:   { color: '#855308' },
		            100: { color: '#B8860B' }
		        }
		    }],
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        title: ARSnova.config.day,
		        minimum: 0,
		        maximum: 100,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        },
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['name'],
		        label: {
		        	rotate: {
		        		degrees: 315,
		        	}
		        }
		    }, {
	            type    : 'Category',
	            position: 'top',
	            label   : {
	            	renderer: function(){
	            		return "";
	            	}
            	},
	            title   : ARSnova.config.location,
	            dashSize: 0
	        }],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = canteenChartColors[i % canteenChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: 'value'
		        },
		        xField: 'name',
		        yField: 'value'
		    }],
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.canteenChart];
		
		this.doLayout();
		
		ARSnova.views.canteen.StatisticPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		
		ARSnova.views.canteen.StatisticPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function() {
		this.canteenChart.axes.items[2].axis.attr.stroke = "#0E0E0E";
		this.canteenChart.redraw();
	},
	
	renewChartData: function() {
		ARSnova.foodVoteModel.countFoodVoteGrouped(ARSnova.config.day, {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				var panel = ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel;
				var chart = panel.canteenChart;
				var store = chart.store;
				
				var maxValue = 10;
				var tmp = [];
				var sum = 0;
				
				for (var i = 0; i < store.data.items.length; i++) {
					var el = store.data.items[i];
					tmp.push(el.data.name);
				}
				
				for (var i = 0; i < responseObj.length; i++) {
					var el = responseObj[i];
					var record = store.findRecord('name', el.key[1]);
					record.data.value = el.value;
					sum += el.value;
					
					if (el.value > maxValue) {
						maxValue = Math.ceil(el.value / 10) * 10;
					}
					
					var idx = tmp.indexOf(el.key[1]); // Find the index
					if(idx!=-1) tmp.splice(idx, 1); // Remove it if really found!
				}
				for ( var i = 0; i < tmp.length; i++) {
					var el = tmp[i];
					var record = store.findRecord('name', el);
					record.data.value = 0;
				}
				
				ARSnova.mainTabPanel.tabPanel.canteenTabPanel.tab.setBadge(sum);
				
				chart.axes.items[0].maximum = maxValue;
				
				// renew the chart-data
				chart.redraw();
			},
			failure: function() {
				console.log('server-side error');
			},
		})
	},
	
	updateCanteenBadgeIcon: function(){
		ARSnova.foodVoteModel.countFoodVote(ARSnova.config.day, {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				
				ARSnova.mainTabPanel.tabPanel.canteenTabPanel.tab.setBadge(value);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},
});
ARSnova.views.canteen.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Mensa',
	iconCls	: 'tabBarIconCanteen',
	layout	: 'fit',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.statisticPanel = new ARSnova.views.canteen.StatisticPanel();
		this.votePanel = new ARSnova.views.canteen.VotePanel();
		
		this.items = [
            this.statisticPanel,
            this.votePanel,
        ];
		ARSnova.views.canteen.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			taskManager.start(this.statisticPanel.renewChartDataTask);
		});
		
		this.on('deactivate', function(){
			this.setActiveItem(this.statisticPanel);
			taskManager.stop(this.statisticPanel.renewChartDataTask);
		});
		
		ARSnova.views.canteen.TabPanel.superclass.initComponent.call(this);
	}
});
ARSnova.views.canteen.VotePanel = Ext.extend(Ext.Panel, {
	
	VOTE_1: null,
	VOTE_2: null,
	VOTE_3: null,
	VOTE_4: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	foodOptions	: false,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Mensa',
			handler : function(){
				ARSnova.mainTabPanel.tabPanel.canteenTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel, {
		    		type		: 'slide',
		    		direction	: 'up',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			ARSnova.mainTabPanel.tabPanel.canteenTabPanel.statisticPanel.renewChartData();
		    		}
		    	});
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Speiseplan',
			items: [
		        this.backButton,
			]
		});
		
		this.defaults = {
			xtype	: 'button',
			handler	: function(button) {
				Ext.dispatch({
					controller	: 'canteen',
					action		: 'vote',
					value		: button.value,
					panel		: this,
				});
			},
		};
		
		this.dockedItems = [this.toolbar];
		this.items = [{
			xtype: 'panel',
			cls: 'gravure',
			html: 'Ich empfehle ...',
		}];
		
		ARSnova.views.canteen.VotePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			this.addFoodOptions();
		})
		
		ARSnova.views.canteen.VotePanel.superclass.initComponent.call(this);
	},
	
	addFoodOptions: function() {
		if(this.foodOptions) return;
		
		/* Get the store with the meals */
		var meals = Ext.getStore("Food").data.items;
		
		for ( var i = 0; i < meals.length; i++) {
			var el = meals[i];
			this.add({
				text	: el.data.name,
				value	: el.data.name,
				cls		: 'login-button menu' + i,
			});
		}
		this.foodOptions = true;
		this.doLayout();
	},
});
Ext.namespace('ARSnova.views.feedback');

feedbackChartColors = ['url(#v-3)', 'url(#v-2)', 'url(#v-1)', 'url(#v-4)'],

ARSnova.views.feedback.StatisticPanel = Ext.extend(Ext.Panel, {
	layout: 'fit',
	feedbackChart: null,
	
	/* toolbar items */
	toolbar: null,
	
	renewChartDataTask: {
		name: 'renew chart data at feedback panel',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartData();
		},
		interval: 10000, //10 seconds
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			},
		});
		
		this.feedbackVoteButton = new Ext.Button({
			text	: 'Feedback geben',
			ui		: 'confirm',
			scope	: this,
			hidden	: true,
			handler	: function() {
				taskManager.stop(this.renewChartDataTask);
				var fP = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
				fP.setActiveItem(fP.votePanel, {
						type: 'slide',
						direction: 'down',
						duration: 700,
					}
				);
			},
		});
		
		this.feedbackCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
			getText: function(){
				if(this.rendered)
					return this.el.dom.innerHTML;
				else
					return this.html;
			},
		});
		
		this.toolbar = new Ext.Toolbar({
//			cls: 'feedbackPanelTitle',
			title: '0/0',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.feedbackVoteButton,
		        {xtype: 'spacer'},
		        this.feedbackCounter,
			]
		});
		
		this.feedbackChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: new Ext.data.JsonStore({
		    	fields: ['name', 'value'],
		    	data: [
		          {name: 'Bitte schneller',  value: 0},
		          {name: 'Kann folgen', 	 value: 0},
		          {name: 'Zu schnell', 		 value: 0},
		          {name: 'Nicht mehr dabei', value: 0},
		        ]
		    }),

		    animate: {
		        easing: 'bounceOut',
		        duration: 750
		    },
		    
		    interactions: [{
		        type: 'reset'
		    }, {
		        type: 'panzoom'
		    }],
		    
		    gradients: [{
		    	'id': 'v-1',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(237, 96, 28)' },
		            100: { color: 'rgb(197, 56, 0)' }
		        }
		    },
		    {
		        'id': 'v-2',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(254, 201, 41)'},
		            100: { color: 'rgb(214, 161, 0)' }
		        }
		    },
		    {
		        'id': 'v-3',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(122, 184, 68)' },
		            100: { color: 'rgb(82, 144, 28)' }
		        }
		    },
		    {
		        'id': 'v-4',
		        'angle': 0,
		        stops: {
		            0:   { color: 'rgb(235, 235, 235)' },
		            100: { color: 'rgb(195,195,195)' }
		        }
		    }],
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        minimum: 0,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        },
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['name'],
		        label: {
		        	rotate: {
		        		degrees: 315,
		        	}
		        }
		    }],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = feedbackChartColors[i % feedbackChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: 'value'
		        },
		        xField: 'name',
		        yField: 'value'
		    }],
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.feedbackChart];
		
		this.doLayout();
		
		ARSnova.views.feedback.StatisticPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
		});
		this.on('deactivate', function(){
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
		});
		
		ARSnova.views.feedback.StatisticPanel.superclass.initComponent.call(this);
	},
	
	/**
	 * this function does three things
	 * 1. Adapt the chart data
	 * 2. Adapt the feedback-badge in tab bar
	 * 3. Adapt the feedback icon in tab bar depending on average of feedback
	 */
	renewChartData: function() {
		ARSnova.feedbackModel.getSessionFeedback(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;
				var chart = panel.feedbackChart;
				var store = chart.store;
				
				var responseObj = Ext.decode(response.responseText).rows;
				
				var maxValue = 10;
				var sum = 0;
				var avg = 0;
				
				var fields = [
				  "Bitte schneller",
				  "Kann folgen",
				  "Zu schnell",
				  "Nicht mehr dabei"
				];
				for ( var i = 0; i < responseObj.length; i++) {
					var el = responseObj[i];
					var record = store.findRecord('name', el.key[1]); //el.key[1] == answer text
					record.data.value = el.value;
					
					switch (el.key[1]) {
						case "Bitte schneller":
							avg += el.value * 4;
							break;
						case "Kann folgen":
							avg += el.value * 3;
							break;
						case "Zu schnell":
							avg += el.value * 2;
							break;
						case "Nicht mehr dabei":
							avg += el.value * 1;
							break;
						default:
							break;
					}
					sum = sum + el.value;
					
					if (el.value > maxValue) {
						maxValue = Math.ceil(el.value / 10) * 10;
					}
					
					var idx = fields.indexOf(el.key[1]); // Find the index
					if(idx!=-1) fields.splice(idx, 1); // Remove it if really found!
				}
				for ( var i = 0; i < fields.length; i++) {
					var el = fields[i];
					var record = store.findRecord('name', el);
					record.data.value = 0;
				}
				
				chart.axes.items[0].maximum = maxValue;
				
				// renew the chart-data
				chart.redraw();
				
				//update feedback-badge in tab bar 
				ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadge(sum);
				
				//update feedback counter
				var counterEl = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.getText().split("/");
				title[0] = sum;
				title = title.join("/");
				counterEl.update(title);
				
				//change the feedback tab bar icon
				avg = Math.round(avg / sum);
				var tab = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.tab;
				switch (avg){
					case 4:
						tab.setIconClass("feedbackGood");
						break;
					case 3:
						tab.setIconClass("feedbackMedium");
						break;
					case 2:
						tab.setIconClass("feedbackBad");
						break;
					case 1:
						tab.setIconClass("feedbackNone");
						break;	
					default:
						tab.setIconClass("feedbackARSnova");
						break;
				}
			},
			failure: function() {
				console.log('server-side error feedbackModel.getSessionFeedback');
			},
		})
	},
	
	checkVoteButton: function(){
		if (!ARSnova.isSessionOwner) this.feedbackVoteButton.show();
		else this.feedbackVoteButton.hide();
	},
	
	checkTitle: function(){
		var title = "";
		if (ARSnova.isSessionOwner) title = localStorage.getItem('shortName');
		this.toolbar.setTitle(title);
	}
});
ARSnova.views.feedback.TabPanel = Ext.extend(Ext.TabPanel, {
	title: 		'Feedback',
	iconCls: 	'feedbackARSnova',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.statisticPanel = new ARSnova.views.feedback.StatisticPanel();
		this.votePanel = new ARSnova.views.feedback.VotePanel();
		
		this.items = [
            this.statisticPanel,
            this.votePanel,
        ];
		ARSnova.views.feedback.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			ARSnova.hideLoadMask();
			this.statisticPanel.checkVoteButton();
			this.statisticPanel.checkTitle();
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
			if(this.layout.activeItem == this.statisticPanel)
				taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
		});
		
		this.on('deactivate', function(){
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
			taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
		});
		
		ARSnova.views.feedback.TabPanel.superclass.initComponent.call(this);
	},
	
	renew: function(){
		this.tab.setBadge("");
	}
});
ARSnova.views.feedback.VotePanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar			: null,
	backButton		: null,
	questionButton	: null,
	
	constructor: function(){
		this.toolbar = new Ext.Toolbar({
			title: 'Mein Feedback',
			cls: 'titlePaddingLeft',
		});
		
		this.dockedItems = [this.toolbar];
		
		this.defaults = {
			xtype	: 'button',
			cls		: 'option-button',
			handler	: function(button) {
				Ext.dispatch({
					controller	: 'feedback',
					action		: 'vote',
					value		: button.value,
				});
			},
		};
		this.items = [{
			iconCls	: 'feedbackGood',
			text	: 'Bitte schneller',
			value	: 'Bitte schneller',
		}, {
			iconCls	: 'feedbackMedium',
			text	: 'Kann folgen',
			value	: 'Kann folgen',
		}, {
			iconCls	: 'feedbackBad',
			text	: 'Zu schnell',
			value	: 'Zu schnell',
		}, {
			iconCls	: 'feedbackNone',
			text	: 'Nicht mehr dabei',
			value	: 'Nicht mehr dabei',
		}, {
			text	: 'Ich hab da mal ne Frage!',
			iconCls	: 'tabBarIconQuestion',
			ui		: 'action',
			handler : function() {
				var panel = new Ext.Panel({
					width: 300,
					floating: true,
					modal: true,
					centered: true,
					cls: 'feedbackQuestion',
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						title: 'Frage an den Dozenten',
					}],
					items: [{
						cls: 'gravure noMargin',
						html: 'Sie stellen diese Frage anonym.<br>Der Dozent entscheidet, wann sie beantwortet wird.',
					}, {
						xtype: 'form',
						submitOnAction: false,
						items: [{
							xtype: 'fieldset',
							items: [{
								xtype: 'textfield',
								label: 'Betreff',
								name: 'subject',
								maxLength: 20,
								placeHolder: 'max. 20 Zeichen',
							}, {
								xtype: 'textareafield',
								label: 'Frage',
								name: 'text',
								maxLength: 140,
								placeHolder: 'max. 140 Zeichen',
							}]
						}, {
							xtype: 'button',
							ui: 'confirm',
							cls: 'login-button noMargin',
							text: 'Speichern',
							handler: function(){
								var me = this.up('panel[modal]');
								var values = this.up('form').getValues();
								time = new Date().getTime();
						    	var question = Ext.ModelMgr.create({
									type		: "interposed_question",
									sessionId	: localStorage.getItem('sessionId'),
									subject		: values.subject.trim(),
									text 		: values.text.trim(),
									timestamp	: time,
								}, 'Question');
						    	
						    	var validation = question.validate();
						    	if (!validation.isValid()) {
									me.down('form').items.items.forEach(function(el){
										if(el.xtype == 'textfield')
											el.removeCls("required");
									});
									validation.items.forEach(function(el){
										me.down('textfield[name=' + el.field + ']').addCls("required")
									});
									return;
								}
						    	
						    	me.hide();
						    	
						    	question.save({
						    		success: function(){
						    			new Ext.Panel({
						    				cls: 'notificationBox',
						    				name: 'notificationBox',
						    				showAnimation: 'pop',
						    				floating: true,
					    					modal: true,
					    					centered: true,
					    					width: 300,
					    					styleHtmlContent: true,
						    				html: 'Ihre Frage wurde gespeichert',
						    				listeners: {
						    					hide: function(){
						    						this.destroy();
						    					},
						    					show: function(){
						    						setTimeout("Ext.ComponentQuery.query('panel[name=notificationBox]')[0].hide();", 2000);
						    					}
						    				}
					    				}).show();
						    		},
						    		failure: function(records, operation){
						    			console.log(records);
						    			console.log(operation);
						    			Ext.Msg.alert("Hinweis!", "Die Übermittlung der Frage war leider nicht erfolgreich");
						    			Ext.Msg.doComponentLayout();
						    		}
						    	})
							}
						}]
					}],
					
					listeners: {
						hide: function(){
							this.destroy()
						},
					},
				}).show();
			}
		}, {
			xtype: 'panel',
			cls: 'gravure',
			html: 'Ihr Feedback wird nach zehn Minuten zurückgesetzt.<br><br>Sie können jederzeit ein neues Feedback geben.',
		}];
		
		ARSnova.views.feedback.VotePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.feedback.VotePanel.superclass.initComponent.call(this);
	},
	
	onDeactivate: function(){
		taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.renewChartDataTask);
	},
});
Ext.namespace('ARSnova.views.feedbackQuestions');

ARSnova.views.feedbackQuestions.DetailsPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	isRendered: false,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionObj : null,
	
	constructor: function(question){
		this.questionObj = question;
		
		this.backButton = new Ext.Button({
			text	: 'Fragen',
			ui		: 'back',
			scope	: this,
			handler	: function(){
				var sQP = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel; 
				sQP.setActiveItem(sQP.questionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				});
//				ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getFeedbackQuestions();
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Details',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			xtype: 'form',
			items: [{
				xtype: 'fieldset',
				items: [{
					xtype: 'textfield',
					label: 'Datum',
					value: this.questionObj.fullDate,
					disabled: true,
				}, {
					xtype: 'textfield',
					label: 'Betreff',
					value: this.questionObj.subject,
					disabled: true,
				}, {
					xtype: 'textareafield',
					label: 'Text',
					maxRows: 8,
					value: this.questionObj.text,
					disabled: true,
				}]
			}]
		},{
			xtype: 'button',
			ui	 : 'decline',
			cls  : 'centerButton',
			text : 'Löschen',
			scope: this,
			handler: function(){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var tab = panel.tab;
				tab.setBadge(tab.badgeText - 1);
				
				ARSnova.questionModel.destroy(this.questionObj, {
					failure: function(response){
						console.log('server-side error delete question');
					},
				});
//				panel.on('cardswitch', function(){
//					ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
//				}, this, {single:true});
				panel.setActiveItem(panel.questionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			}
		}];
		
		ARSnova.views.feedbackQuestions.DetailsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.feedbackQuestions.DetailsPanel.superclass.initComponent.call(this);
	},
	
	onDeactivate: function(){
		this.destroy();
		ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
	},
});
Ext.regModel('FeedbackQuestion', {
    fields: ['fullDate', 'formattedTime', 'timestamp', 'subject', 'type', 'groupDate']
});

ARSnova.views.feedbackQuestions.QuestionsPanel = Ext.extend(Ext.Panel, {
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	layout		: 'fit',
	questionsCounter: 0,
	
	store: new Ext.data.JsonStore({
	    model  : 'FeedbackQuestion',
	    sorters: 'lastName',
	    groupField: 'groupDate',
	}),
	
	/**
	 * task for speakers in a session
	 * check every x seconds new feedback questions
	 */
	checkFeedbackQuestionsTask: {
		name: 'check for new feedback questions',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
		},
		interval: 15000,
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			hidden	: true,
			handler : function(){
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.speakerTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			},
		});
		
		this.editButton = new Ext.Button({
			text: 'Bearbeiten',
			hidden: true,
			editMode: false,
			
			handler: function(){
				if(this.up('panel').store.getCount() == 0) {
					this.hide();
					return;
				}
				
				if(this.editMode) {
					this.unsetActive();
					this.deactivateAll();
				}
				else {
					this.setActive();
					this.activateAll();
				}
			},
			
			setActive: function(){
				this.addCls('x-button-action');
				this.setText('Abbrechen');
				this.editMode = true;
			},
			
			unsetActive: function(){
				this.removeCls('x-button-action');
				this.setText('Bearbeiten');
				this.editMode = false;
			},
			
			/**
			 * Adds the 'Delete' button to all search-entries
			 */
			activateAll: function(){
				var activeCls = this.up('panel').list.activeCls;
				Ext.select('div.x-list-item').each(function(element) {
					element.addCls(activeCls);
				});
			},
			
			/**
			 * Removes the 'Delete' button from all search-entries
			 */
			deactivateAll: function(){
				var activeCls = this.up('panel').list.activeCls;
				Ext.select('div.x-list-item').each(function(element) {
					element.removeCls(activeCls);
				});
			},
			
			check: function() {
				var store = this.up('panel').store;
				
				if (store.getCount() == 0) {
					this.hide();
					this.unsetActive();
				} else {
					this.show()
				}
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Auditorium',
			items: [
		        this.backButton,
		        { xtype: 'spacer', },
		        this.editButton
	        ],
		});
		
		this.dockedItems = [this.toolbar];

		this.noQuestionsFound = new Ext.Panel({
			cls: 'centerText',
			html: "Keine Fragen vorhanden.",
		});
		
		this.list = new Ext.List({
			activeCls: 'search-item-active',
			style: {
				backgroundColor: 'transparent',
			},
			
			itemCls: 'forwardListButton',
		    itemTpl: [
		    	'<div class="search-item">',
		    	'<div class="action delete x-button">Delete</div>',
		    	'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{subject}</span>',
		    	'</div>'
		    	],
		    grouped: true,
		    store: this.store,
		    listeners: {
		    	itemswipe: function(list, index, node){
		            var el        = Ext.get(node),
		                hasClass  = el.hasCls(this.activeCls);
		            
		            if (hasClass) { el.removeCls(this.activeCls); } 
		            else { el.addCls(this.activeCls);}
		        },
		    	itemtap: function(list, index, item, event){
		    		var editButton = list.up('panel').editButton;
		        	if (event.getTarget('.' + this.activeCls + ' div.delete')) {
		                var store    = this.store;
		                
		                var question = store.getAt(index).data.obj;
		                ARSnova.questionModel.destroy({
		                	_id: question.id,
		                	_rev: question.rev,
		                },{
		                	success: function(){
		                		store.removeAt(index);
		                		var tab = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab;
		                		tab.setBadge(tab.badgeText - 1);
		                		var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
		                		panel.questionsCounter--;
		                		if(panel.questionsCounter == 0)
		                			panel.getFeedbackQuestions();
		                		
		                		editButton.check();
				                if(editButton.editMode) {
				                	editButton.activateAll();
				                }
	                		},
		                	failure: function(){console.log('fehler')},
		                })
		            } else {
		            	editButton.deactivateAll();
		            	editButton.unsetActive();
		                
			    		Ext.dispatch({
							controller	: 'questions',
							action		: 'detailsFeedbackQuestion',
							question	: list.store.getAt(index).data.obj,
						})
		            }
		    	}
		    }
		}),
		this.items = [
			this.list,
			this.noQuestionsFound
        ];
		
		ARSnova.views.feedbackQuestions.QuestionsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', function(){
			var selModel = this.list.getSelectionModel();
			selModel.deselect(selModel.lastSelected, true);
		})
		
		ARSnova.views.feedbackQuestions.QuestionsPanel.superclass.initComponent.call(this);
	},
	
	getFeedbackQuestions: function(){
		ARSnova.showLoadMask("Lade neue Fragen");
		ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.store.loadData({});
		ARSnova.questionModel.getInterposedQuestions(localStorage.getItem('sessionId'),{
			success: function(response){
				var questions = Ext.decode(response.responseText).rows;
    			var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
    			ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadge(questions.length);
    			panel.questionsCounter = questions.length;
    			
				if(panel.questionsCounter == 0){
					panel.list.hide();
					panel.noQuestionsFound.show();
					panel.editButton.hide();
				} else {
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.editButton.show();
					for(var i = 0; i < questions.length; i++){
						var question = questions[i].value;
						question.id = questions[i].id;
						var formattedTime = "", fullDate = "", groupDate = "";
						if(question.timestamp){
							var time = new Date(question.timestamp);
							var minutes, hours, day, month, year;
							minutes = time.getMinutes();
							hours 	= time.getHours();
							day   	= time.getDate();
							month 	= time.getMonth() + 1;
							year  	= time.getYear() - 100;
							formattedTime = (hours < 10 ? '0' + hours : hours) + ":" + (minutes < 10 ? '0' + minutes : minutes); 
							groupDate 	  = (day < 10 ? '0' + day : day) + "." + (month < 10 ? '0' + month : month) + "." + year;
							fullDate 	  = formattedTime + " Uhr am " + groupDate;
						} else {
							groupDate = "Kein Datum";
						}
						question.formattedTime = formattedTime;
						question.fullDate = fullDate;
						if(!question.subject)
							question.subject = "Kein Betreff";
						panel.store.add({
							formattedTime: formattedTime,
							timestamp: question.timestamp,
							groupDate: groupDate,
							subject: question.subject,
							type: question.type,
							obj: question
						});
					}
					panel.store.sort([{
						property : 'timestamp',
						direction: 'DESC'
					}]);
				}
				panel.doLayout();
				setTimeout("ARSnova.hideLoadMask()", 500);
			},
			failure: function(records, operation){
				console.log('server side error');
			}
		});
	},
	
	checkFeedbackQuestions: function(){
		ARSnova.questionModel.countFeedbackQuestions(localStorage.getItem("sessionId"), {
			success: function(response){
				var feedbackQuestionsPanel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = feedbackQuestionsPanel.questionsPanel;
				var responseObj = Ext.decode(response.responseText).rows;
				
				var value = 0;
				if (responseObj.length > 0){
					panel.editButton.show();
					value = responseObj[0].value;
				} else {
					panel.editButton.hide();
				}
				
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge(value);
				feedbackQuestionsPanel.tab.setBadge(value);
				
				if(panel.questionsCounter != value) {
					panel.questionsCounter = value;
					panel.editButton.unsetActive();
					panel.getFeedbackQuestions();
				}
			}, 
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});
ARSnova.views.feedbackQuestions.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Fragen',
	iconCls	: 'tabBarIconQuestion',
	scroll	: 'vertical',

	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.questionsPanel = new ARSnova.views.feedbackQuestions.QuestionsPanel();
		
		this.items = [
            this.questionsPanel,
        ];
		ARSnova.views.feedbackQuestions.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			taskManager.start(ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestionsTask);
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
		});
		
		this.on('deactivate', function(){
			taskManager.stop(ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestionsTask);
			taskManager.start(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestionsTask);
		});
		
		ARSnova.views.feedbackQuestions.TabPanel.superclass.initComponent.call(this);
	}
});
Ext.namespace('ARSnova.views.home');

ARSnova.views.home.HomePanel = Ext.extend(Ext.Panel, {
	scroll			: 'vertical',
	inClassRendered	: false,
	userInClass		: null,
	speakerInClass	: null,
	outOfClass		: null,
	
	/* toolbar items */
	toolbar				: null,
	logoutButton		: null,
	sessionLogoutButton	: null,
	
	constructor: function(){
		this.logoutButton = new Ext.Button({
			text	: 'Abmelden',
			ui		: 'back',
			handler	: function() {
				Ext.Msg.confirm("Abmelden", "Möchten Sie sich wirklich von ARSnova abmelden?", function(answer) {
					if (answer == 'yes') {
						Ext.dispatch({
							controller	: 'auth',
							action		: 'logout'
						});
					}
				});
				Ext.Msg.doComponentLayout();
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'ARSnova',
			items: [
		        this.logoutButton,
			]
		});
		
		this.outOfClass = new Ext.form.FormPanel({
			title: 'Out of class',
			cls  : 'standardForm',
				
			items: [{
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Sessions',
				cls			: 'forwardListButton',
				controller	: 'user',
				action		: 'index',
				handler		: this.buttonClicked,
			},
//	        {
//				xtype		: 'button',
//				ui			: 'normal',
//				text		: 'Archiv',
//				cls			: 'forwardListButton',
//				controller	: 'archive',
//				action		: 'index',
//				handler		: this.buttonClicked,
//			}
	        ],
		});
		
		this.sessionLoginForm = new Ext.Panel({
			cls: 'beside',
			items: [{
				submitOnAction: false,
				xtype: 'form',
				items: [{
					xtype: 'fieldset',
					instructions: 'Bitte Session-ID eingeben',
					defaults: {
						labelWidth: '50%'
					},
					items: [{
						xtype		: 'numericKeypad',
						name		: 'keyword',
						placeHolder	: "Session-ID  (8-stellig)",
						maxLength	: 11,
					}],					
				}, {
					xtype	: 'button',
					ui		: 'confirm',
					text	: 'Los!',
					handler	: this.onSubmit,
				}],
			}],
		});
		
		this.lastVisitedSessionsFieldset = new Ext.form.FieldSet({
			cls: 'standardFieldset',
			title: 'Kürzlich besuchte Sessions',
		});
		
		this.lastVisitedSessionsForm = new Ext.form.FormPanel({
			items: [this.lastVisitedSessionsFieldset],
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [
            this.sessionLoginForm,
            this.lastVisitedSessionsForm,
        ];
		
		ARSnova.views.home.HomePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', function(){
			this.loadVisitedSessions();
		});
		this.on('activate', function(){
			this.doLayout();
			ARSnova.hideLoadMask();
		});
		
		ARSnova.views.home.HomePanel.superclass.initComponent.call(this);
	},
	
	checkLogin: function(){
		if (ARSnova.loginMode == ARSnova.LOGIN_THM) {
			this.logoutButton.addCls('thm');
		}
	},
	
	buttonClicked: function(button) {
		Ext.dispatch({
			controller	: button.controller,
			action		: button.action,
		});
	},
	
	onSubmit: function() {
		ARSnova.showLoadMask("Login...");
		var sessionLoginPanel = this;
		var values = this.up('form').getValues();
		
		//delete the textfield-focus, to hide the numeric keypad on phones
		this.up('panel').down('textfield').blur();
		
		Ext.dispatch({
			controller: 'sessions',
			action	  : 'login',
			keyword	  : values.keyword.replace(/ /g, ""),
			destroy   : false,
			panel	  : sessionLoginPanel,
		})
	},
	
	loadVisitedSessions: function() {
		if(ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER) return;
		ARSnova.showLoadMask('Suche Sessions...');
		var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
		if (sessions.length > 0) {
			this.lastVisitedSessionsFieldset.removeAll();
			this.lastVisitedSessionsForm.show();
			for ( var i = 0; i < sessions.length; i++) {
				var session = sessions[i];
				
				this.lastVisitedSessionsFieldset.add({
					xtype		: 'button',
					ui			: 'normal',
					text		: session.name,
					cls			: 'forwardListButton',
					controller	: 'sessions',
					action		: 'showDetails',
					sessionObj	: session,
					handler		: function(options){
						ARSnova.showLoadMask("Login...");
						Ext.dispatch({
							controller	: 'sessions',
							action		: 'login',
							keyword		: options.sessionObj.keyword,
						});
					},
				});
			}
			
			for ( var i = 0; i < sessions.length; i++) {
				var session = sessions[i];
				
				Ext.ModelMgr.getModel("Session").load(session._id, {
					success: function(records, operation){
						var session = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Session');
						if(session.data.active && session.data.active == 1){
							var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.homePanel;
							panel.down('button[text=' + session.data.name + ']').addCls("isActive");
						}
					}
				});
			}					
		} else {
			this.lastVisitedSessionsForm.hide();
//			this.lastVisitedSessionsFieldset.add({
//				xtype		: 'button',
//				ui			: 'normal',
//				cls			: 'standardListButton',
//				text		: 'Nichts gefunden',
//				disabled	: true,
//				handler		: function(options){
//					var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
//					hTP.setActiveItem(hTP.newSessionPanel, 'slide')
//				},
//			});
		}
	},
});
ARSnova.views.home.MySessionsPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/* items */
	createdSessions: null,
	
	constructor: function(){
		this.logoutButton = new Ext.Button({
			text	: 'Abmelden',
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				Ext.Msg.confirm("Abmelden", "Möchten Sie sich wirklich von ARSnova abmelden?", function(answer) {
					if (answer == 'yes') {
						Ext.dispatch({
							controller	: 'auth',
							action		: 'logout'
						});
					}
				});
				Ext.Msg.doComponentLayout();
			}
		});
		
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.homePanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.createSessionButton = new Ext.Button({
			text	: '+',
			cls		: 'plusButton',
			scope	: this,
			handler	: function() {
				var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.newSessionPanel, {
					type		: 'slide',
					direction	: 'left',
					duration	: 700,
				})
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Sessions',
			items: [
		        this.backButton,
		        this.logoutButton,
		        {xtype: 'spacer'},
	            this.createSessionButton
			]
		});
		
		this.newSessionButtonForm = new Ext.form.FormPanel({
			cls: 'topPadding standardForm',
			items: [{
				xtype	: 'button',
				ui		: 'normal',
				text	: 'Neue Session anlegen',
				cls		: 'forwardListButton',
				handler	: function(options){
					var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel
					hTP.setActiveItem(hTP.newSessionPanel, 'slide')
				},
			}],
		});
		
		this.sessionsForm = new Ext.form.FormPanel({
			items: [],
		});
		
		this.dockedItems = [this.toolbar],
		this.items = [
		    this.newSessionButtonForm,
            this.sessionsForm,
        ],
		
		ARSnova.views.home.MySessionsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', function(){
			this.doComponentLayout();	
		});
		this.on('beforeactivate', function(){
			switch (ARSnova.userRole) {
				case ARSnova.USER_ROLE_SPEAKER:
					this.loadCreatedSessions();
					
					this.backButton.hide();
					this.logoutButton.show();
					this.createSessionButton.show();
					break;
				default:
					break;
			}
			if (ARSnova.loginMode == ARSnova.LOGIN_THM) {
				this.logoutButton.addCls('thm');
			}
		});
		
		ARSnova.views.home.MySessionsPanel.superclass.initComponent.call(this);
	},
	
	loadCreatedSessions: function() {
		ARSnova.showLoadMask('Suche Sessions...');
		var res = ARSnova.sessionModel.getMySessions(localStorage.getItem('login'), {
    		success: function(response) {
    			var sessions = Ext.decode(response.responseText).rows;
    			var sessionsLength = sessions.length;
    			var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel;
    			
    			if(sessionsLength != 0) {
    				panel.sessionsForm.removeAll();
    				
    				panel.createdSessionsFieldset = new Ext.form.FieldSet({
						cls: 'standardFieldset',
						title: 'Meine Sessions',
					})
    				
    				for ( var i = 0; i < sessionsLength; i++) {
    					var session = sessions[i];
    					
    					var status = "";
    					if (session.value.active && session.value.active == 1)
    						status = " isActive";
    					panel.createdSessionsFieldset.add({
    						xtype		: 'button',
    						ui			: 'normal',
    						text		: session.key[1],
    						cls			: 'forwardListButton' + status,
    						sessionObj	: session,
    						handler		: function(options){
    							ARSnova.showLoadMask("Login...");
    							Ext.dispatch({
    								controller	: 'sessions',
    								action		: 'login',
    								keyword		: options.sessionObj.value.keyword,
    							});
    						},
    					})
    				}
    				panel.sessionsForm.add(panel.createdSessionsFieldset);
    			} else {
    				panel.sessionsForm.hide();
    			}
    			
    			panel.doLayout();
    			ARSnova.hideLoadMask();
    		},
    		failure: function() {
    			console.log("my sessions request failure");
    		}
    	});
	},
});
ARSnova.views.home.NewSessionPanel = Ext.extend(Ext.Panel, {
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/* items */
	sessionIdField: null,
	
	unavailableSessionIds: [],
	
	constructor: function(responseText){
		if(responseText == null){
			var course = new Array();
		} else {
			var course = Ext.decode(responseText);
		}
		
		this.backButton = new Ext.Button({
			text	: 'Sessions',
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.mySessionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Neue Session',
			cls	 : 'titlePaddingLeft',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.sessionIdField = new Ext.form.Text({
            name		: 'keyword',
            label		: 'Session-ID',
            disabled	: true,
        });
		
		this.items = [{
			title: 'createSession',
			xtype: 'form',
			id: 'createSession',
			submitOnAction: false,
			items: [{
	            xtype: 'fieldset',
	            instructions: 'Session-ID wird erzeugt...',
	            items: [{
	                xtype		: 'textfield',
	                name		: 'name',
	                label		: 'Name',
	                placeHolder	: "max. 50 Zeichen",
	                maxLength	: 50,
	                useClearIcon: true,
	                value		: course.name,
	            }, {
	                xtype		: 'textfield',
	                name		: 'shortName',
	                label		: 'Kürzel',
	                placeHolder	: "max. 5 Zeichen",
	                maxLength	: 5,
	                useClearIcon: true,
	                value		: course.shortName,
	            }]
			}, {
            	xtype		: 'textfield',
            	name		: 'keyword',
            	hidden 		: true,
            }, {
				xtype: 'button',
				cls  : 'centerButton',
				ui: 'confirm',
				text: 'Speichern',
				handler: this.onSubmit,
			}]
		}];
		
		ARSnova.views.home.NewSessionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('beforeactivate', this.getSessionIds);
		this.on('activate', this.generateNewSessionId);
		
		ARSnova.views.home.NewSessionPanel.superclass.initComponent.call(this);
	},
	
	onSubmit: function() {
		var values = this.up('panel').getValues();

		Ext.dispatch({
			controller	: 'sessions',
			action		: 'create',
			name		: values.name,
			shortName	: values.shortName,
			keyword		: values.keyword,
		})			
	},
	
	getSessionIds: function(){
		if(this.unavailableSessionIds.length == 0){
			ARSnova.sessionModel.getSessionIds({
				success: function(response){
					var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
					var res = Ext.decode(response.responseText).rows;
					res.forEach(function(el){
						panel.unavailableSessionIds.push(el.key);
					});
				},
				failure: function(){
					console.log('server-side error');
				}
			});
		}
	},
	
	generateNewSessionId: function(){
		var sessionIdInUse = false;
		do {
			var sessionId = Math.floor(Math.random()*100000001) + "";
			if (sessionId.length == 8) {
				var idx = this.unavailableSessionIds.indexOf(sessionId); // Find the index
				if(idx != -1) sessionIdInUse = true;
			} else {
				sessionIdInUse = true; // accept only 8-digits sessionIds
			}
		} while (sessionIdInUse);
		this.down("textfield[name=keyword]").setValue(sessionId);
		this.down('fieldset').setInstructions("Session-ID: " + ARSnova.formatSessionID(sessionId));
	},
});
ARSnova.views.home.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Home',
	iconCls	: 'tabBarIconHome',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		/* out of class */
		this.homePanel = new ARSnova.views.home.HomePanel();
		this.mySessionsPanel = new ARSnova.views.home.MySessionsPanel();
		this.newSessionPanel = new ARSnova.views.home.NewSessionPanel();
		
		this.items = [
		    this.homePanel,
            this.mySessionsPanel,
            this.newSessionPanel,
        ];
		ARSnova.views.home.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){		
		
		ARSnova.views.home.TabPanel.superclass.initComponent.call(this);
	}
});
Ext.namespace('ARSnova.views.speaker');

ARSnova.views.speaker.AudienceQuestionPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	newQuestionButton: null,
	
	constructor: function(){
		this.newQuestionButton = [{
			xtype: 'form',
			cls  : 'standardForm topPadding',
			items: [{
				xtype	: 'button',				
				text	: 'Neue Frage stellen',
				cls		: 'forwardListButton',
				handler	: this.newQuestionHandler,
			}],
		}];
		
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			handler	: function() {
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.inClassPanel.updateAudienceQuestionBadge();
				sTP.setActiveItem(sTP.inClassPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.addButton = new Ext.Button({
			text	: '+',
			cls		: 'plusButton',
			scope	: this,
			handler	: this.newQuestionHandler,
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Fragen',
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.addButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [
          this.newQuestionButton
        ];
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function() {
		this.removeAll();

		ARSnova.questionModel.getSkillQuestionsSortBySubject(localStorage.getItem('sessionId'), {
    		success: this.questionsCallback,
    		failure: function(response) {
    			console.log('server-side error questionModel.getSkillQuestions');
    		},
		});
	},

	/**
	 * Callback Function for database.getAudienceQuestions
	 */
	questionsCallback: function(response){
		var responseObj = Ext.decode(response.responseText);
		var questions = responseObj.rows;
		var questionsLength = questions.length;
		var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
		
		if (questions.length == 0){
			console.log('Keine Session-Fragen gefunden!');
			if (panel.items.length == 0) panel.add(panel.newQuestionButton);
		} else {
			var lastSubject = null;
			for(var i = 0; i < questions.length; i++){
				var question = questions[i].value;
				var actSubject = question.subject;
				if (lastSubject != actSubject) {
					var fieldset = panel.add({
						xtype: 'fieldset',
						title: actSubject,
					});
					lastSubject = actSubject;
				}
				var status = "";
				if (question.active && question.active == 1)
					status = " isActive";
				
				var questionNumber = "";
				if(question.number)
					questionNumber = question.number + ". ";

				fieldset.add({
					xtype: 'button',
					cls: 'forwardListButton' + status,
					text: questionNumber + question.text,
					questionObj: question,
					handler: function(button) {
						Ext.dispatch({
							controller	: 'questions',
							action		: 'details',
							question	: button.questionObj,
						})
					}
				});
			}
		}
		panel.doLayout();
		ARSnova.hideLoadMask();
	},
	
	newQuestionHandler: function(){
		var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.newQuestionPanel, 'slide');
	}
});
ARSnova.views.speaker.InClass = Ext.extend(Ext.Panel, {
	title	: 'Feedback',
	iconCls	: 'feedbackMedium',
	scroll  : 'vertical',
	
	inClassItems: null,
		audienceQuestionButton	: null,
		questionsFromUserButton	: null,
		quizButton			 	: null,
		
	inClassActions: null,
		sessionStatusButton			: null,
		createAdHocQuestionButton	: null,
		
	/**
	 * count every x seconds all actually logged-in users for this sessions
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countActiveUsers();
		},
		interval: 15000,
	},
	
	/**
	 * task for speakers in a session
	 * count every x seconds the number of feedback questions
	 */
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000,
	},
	
	constructor: function(){
		this.sessionLogoutButton = new Ext.Button({
			text	: 'Logout',
			ui		: 'back',
			handler	: function() {
				Ext.Msg.confirm('Ausloggen', 'Wollen Sie sich wirklich aus dieser Session abmelden?', function(answer) {
					if (answer == 'yes') {
						Ext.dispatch({
							controller	: 'sessions',
							action		: 'logout',
						});
					}
				});
				Ext.Msg.doComponentLayout();
			},			
		});
		
		this.toolbar = new Ext.Toolbar({
			title: localStorage.getItem("shortName"),
			items: [
		        this.sessionLogoutButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.audienceQuestionButton = new Ext.Button({
			ui			: 'normal',
			text		: 'Fragen ans Publikum',
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'questions',
			action		: 'listAudienceQuestions',
			handler		: this.buttonClicked,
		});
		
		this.feedbackQuestionButton = new Ext.Button({
			ui			: 'normal',
			text		: 'Zwischenfragen',
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'questions',
			action		: 'listFeedbackQuestions',
			handler		: this.buttonClicked,
		});
		
//		this.rankingButton = new Ext.Button({
//			ui			: 'normal',
//			text		: 'Ranking',
//			cls			: 'forwardListButton',
//			controller	: 'ranking',
//			action		: 'speakerStatistic',
//			handler		: this.buttonClicked,
//		});
		
		this.inClassItems = {
				xtype: 'form',
				cls	 : 'standardForm topPadding',
				
				items: [{
					cls: 'gravureBig',
					html: localStorage.getItem("name"),
				}, {
					xtype: 'fieldset',
					cls	 : 'standardFieldset noMargin',
					instructions: "Session-ID: " + ARSnova.formatSessionID(localStorage.getItem("keyword")),
					items: [					
					        this.audienceQuestionButton,
					        this.feedbackQuestionButton,
					        ]
				}],
		};
		
		this.createAdHocQuestionButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype		: 'button',
				text		: ' ',
				cls			: 'questionMark',
				controller	: 'questions',
				action		: 'adHoc',
				handler		: this.buttonClicked,
			}, {
				html: 'Sofort-Frage',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.sessionStatusButton = new ARSnova.views.SessionStatusButton();
		
		this.deleteQuestionButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'deleteIcon',
				scope	: this,
				handler	: function(){
					var msg = "Sind Sie sicher?" +
							"<br>Es werden alle Fragen und Antworten der Session gelöscht.";
					Ext.Msg.confirm("Session löschen", msg, function(answer){
						if (answer == 'yes') {
							ARSnova.showLoadMask("Lösche Session-Daten...");
							ARSnova.sessionModel.destroy(localStorage.getItem('sessionId'), localStorage.getItem('login'), {
								success: function(){
									ARSnova.removeVisitedSession(localStorage.getItem('sessionId'));
									ARSnova.mainTabPanel.tabPanel.on('cardswitch', function(){
										ARSnova.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
										setTimeout("ARSnova.hideLoadMask()", 1000);
									}, this, {single:true});
									Ext.dispatch({
										controller	: 'sessions',
										action		: 'logout',
									});
								},
								failure: function(response){
									console.log('server-side error delete session');
								},
							})
						}
					});
					Ext.Msg.doComponentLayout();
				},
			}, {
				html: 'Session löschen',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.inClassActions = new Ext.form.FormPanel({
			cls	 : 'actionsForm',
				
			items: [
			    this.createAdHocQuestionButton,
			    this.sessionStatusButton,
			    this.deleteQuestionButton
	        ],
				        
		});
		
		this.items = [this.inClassItems, this.inClassActions];
		
		ARSnova.views.speaker.InClass.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('destroy', this.destroyListeners);
		
		this.on('activate', function(){
			this.updateBadges();
		});
		
		ARSnova.views.speaker.InClass.superclass.initComponent.call(this);
	},
	
	buttonClicked: function(button){
		Ext.dispatch({
			controller	: button.controller,
			action		: button.action,
		});
	},
	
	/* will be called on session login */
	registerListeners: function(){
		var inClassPanel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.start(inClassPanel.countActiveUsersTask);
		taskManager.start(inClassPanel.countFeedbackQuestionsTask);
	},

	/* will be called on session logout */
	destroyListeners: function(){
		var inClassPanel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.stop(inClassPanel.countActiveUsersTask);
		taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
	},
	
	updateBadges: function(){
		var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		panel.updateAudienceQuestionBadge();
	},
	
	updateAudienceQuestionBadge: function(){
		ARSnova.questionModel.countSkillQuestions(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
				var audienceQuestionButton = panel.audienceQuestionButton;
				
				var responseObj = Ext.decode(response.responseText).rows;
				
				var value = "";
				if (responseObj.length > 0){
					value = responseObj[0].value;
				}
				audienceQuestionButton.setBadge(value);
			}, 
			failure: function(){
				console.log('server-side error');
			}
		})
	},
	
	countActiveUsers: function(){
		ARSnova.loggedInModel.countActiveUsersBySession(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value - 1;
				}
				
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.toolbar.setTitle(localStorage.getItem("shortName") + " (" + value + ")");
				
				//update feedback counter
				var counterEl = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.getText().split("/");
				title[1] = value;
				title = title.join("/");
				counterEl.update(title);
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
	
	countFeedbackQuestions: function(){
		ARSnova.questionModel.countFeedbackQuestions(localStorage.getItem("sessionId"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				
				var value = 0;
				if (responseObj.length > 0){
					value = responseObj[0].value;
				}
				ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge(value);
				ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadge(value);
			}, 
			failure: function(){
				console.log('server-side error');
			}
		})
	},	
});
ARSnova.views.speaker.NewQuestionPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/* items */
	text: null,
	subject: null,
	duration: null,
	
	/* for estudy */
	userCourses: [],
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Fragen',
			ui		: 'back',
			handler	: function(){
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.textarea = new Ext.plugins.ResizableTextArea({
			name	  	: 'text',
	    	label	  	: 'Frage',
	    	placeHolder	: 'Frage eingeben',
	    	maxHeight	: 140,
		});
		
		this.mainPart = new Ext.form.FormPanel({
			cls: 'newQuestion',
			items: [{
				xtype: 'fieldset',
				items: [{
			        xtype	: 'textfield',
			        name	: 'subject',
			    	label	: 'Kategorie',
			    	placeHolder: 'Kategorie eingeben',
			    }],
			},{
				xtype: 'fieldset',
				items: [this.textarea]
			}, {
				//value of this field will be set by getMaxQuestionNumber()
				xtype: 'numberfield',
				hidden: true,
				name: 'number',
			}]
		});
		
		this.releasePart = new Ext.form.FormPanel({
			items: [{
				xtype: 'fieldset',
				title: 'Freigeben für:',
	            items: [{
	            	xtype: 'segmentedbutton',
	        		cls: 'releaseOptions',
	        		allowDepress: false,
	        		allowMultiple: false,
	        		items: [
	    		        { text	: "Alle", pressed: true}, 
	    		        { text	: "THM" },
	    		        { text	: "Kurse", },
	    		    ],
	    		    listeners: {
	    		    	toggle: function(container, button, pressed){
	    		    		var nQP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
	    		    		var coursesFieldset = nQP.down('fieldset[title=Meine Kurse:]');
	    		    		if(button.text == "Kurse"){
	    		    			if(pressed){
	    		    				if(nQP.userCourses.length == 0){
	        		    				ARSnova.showLoadMask('Suche Kurse...');
	        		    				Ext.Ajax.request({
	        		    					url: ARSnova.WEBSERVICE_URL + 'estudy/getTeacherCourses.php',
	        		    					params: {
	        		    						login: localStorage.getItem('login'),
	        		    					},
	        		    					success: function(response, opts){
	        		    						var obj = Ext.decode(response.responseText).courselist;
	        		    						
	        		    						/* Build new options array */
	        		    						for ( var i = 0; i < obj.count; i++){
	        		    							var course = obj.course[i];
	        		    							coursesFieldset.add({
	        		    								xtype: 'checkboxfield',
	        		    								name: course.name,
	        		    								label: course.name,
	        		    								value:	course.id,
	        		    							});
	        		    						}
	        		    						nQP.userCourses = obj;
	        		    						nQP.doLayout();
	        		    						coursesFieldset.show();
	        		    						ARSnova.hideLoadMask();
	        		    					},
	        		    					failure: function(response, opts){
	        		    						console.log('getcourses server-side failure with status code ' + response.status);
	        		    						Ext.Msg.alert("Hinweis!", "Es konnten keine Kurse gesucht werden.");
	        		    						Ext.Msg.doComponentLayout();
	        		    					},
	        		    				});
	    		    				}
	    		    				coursesFieldset.show();
	    		    				nQP.doLayout();
	    		    			} else {
	    		    				coursesFieldset.hide();
	    		    				nQP.doLayout();
	    		    			}
	    		    		}
	    		    	}
	    		    }
	            }, {
	            	xtype: 'fieldset',
	            	title: 'Meine Kurse:',
	            	hidden: true,
	        	}]
			}],
    	});
		
		this.yesNoQuestion = new Ext.form.FormPanel({
			id: 'yesno',
			hidden: true,
			submitOnAction: false,
			items: [{
				xtype: 'fieldset',
				title: 'Richtige Antwort',
	            items: [{
            		xtype: 'segmentedbutton',
            		cls: 'yesnoOptions',
            		items: [
        		        { text	: "Ja", pressed: true }, 
        		        { text	: "Nein" }
            		],
            	}],
			}],
		});
		
		this.multipleChoiceQuestion = new Ext.form.FormPanel({
			id: 'mc',
			hidden: true,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: 'Antworten',
            	items: [
        	        {
	            		xtype	: "spinnerfield",
	            		name	: 'countAnswers',
	                	label	: 'Anzahl',
	            		minValue: 3,
	            		maxValue: 6,
	            		incrementValue: 1,
	            		value: 4,
	            		listeners: {
	                		spin: function(selectField, value){
	                			switch (value){
	    							case 3:
	    								Ext.getCmp("wrongAnswer3").hide();
	    								Ext.getCmp("wrongAnswer4").hide();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 4:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").hide();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 5:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").show();
	    								Ext.getCmp("wrongAnswer5").hide();
	    								break;
	    							case 6:
	    								Ext.getCmp("wrongAnswer3").show();
	    								Ext.getCmp("wrongAnswer4").show();
	    								Ext.getCmp("wrongAnswer5").show();
	    								break;
	    							default:
	    								break;
	    						}
	                			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel.doLayout();
	                		}
	                	}
	                }, {
						xtype	: 'textfield',
					    id		: 'correctAnswer',
						label	: 'Richtig',
						placeHolder: 'Richtige Antwort',
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer1',
						label	: 'Falsch',
						placeHolder: 'Falsche Antwort',
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer2',
					    label	: 'Falsch',
					    placeHolder: 'Falsche Antwort',
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer3',
					    label	: 'Falsch',
					    placeHolder: 'Falsche Antwort',
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer4',
					    label	: 'Falsch',
					    placeHolder: 'Falsche Antwort',
					    hidden	: true,
					}, {
						xtype	: 'textfield',
					    id		: 'wrongAnswer5',
					    label	: 'Falsch',
					    placeHolder: 'Falsche Antwort',
					    hidden	: true,
					}
    	        ]
			}],
		});

		this.voteQuestion = new Ext.form.FormPanel({
			id: 'vote',
			hidden: false,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: 'Antworten',
            	items: [{
						xtype	: 'textfield',
					    id		: 'voteAnswer1',
					    label	: '1.',
					    value	: "trifft voll zu",
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer2',
					    label	: '2.',
					    value	: "trifft eher zu",
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer3',
					    label	: '3.',
					    value	: "weiß nicht",
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer4',
					    label	: '4.',
					    value	: "trifft eher nicht zu",
					}, {
						xtype	: 'textfield',
					    id		: 'voteAnswer5',
					    label	: '5.',
					    value	: "trifft nie zu",
					}
    	        ]
			}],
		});
		
		this.schoolQuestion = new Ext.form.FormPanel({
			id: 'school',
			hidden: true,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: 'Antworten',
            	items: [{
						xtype	: 'textfield',
					    id		: 'schoolAnswer1',
					    label	: '1.',
					    value	: "sehr gut",
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer2',
					    label	: '2.',
					    value	: "gut",
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer3',
					    label	: '3.',
					    value	: "befriedigend",
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer4',
					    label	: '4.',
					    value	: "ausreichend",
					}, {
						xtype	: 'textfield',
					    id		: 'schoolAnswer5',
					    label	: '5.',
					    value	: "mangelhaft",
					}
    	        ]
			}],
		});
		
		this.abcdQuestion = new Ext.form.FormPanel({
			id: 'abcd',
			hidden: true,
			submitOnAction: false,
			items: [{
            	xtype: 'fieldset',
            	title: 'Richtige Antwort',
            	items: [{
            		xtype: 'segmentedbutton',
            		allowDepress: true,
            		cls: 'abcdOptions',
            		items: [
        		        { text	: "A" }, 
        		        { text	: "B" },
        		        { text	: "C" },
        		        { text	: "D" },
            		],
            	}]
			}],
		});
		
		this.questionOptions = new Ext.SegmentedButton({
	        allowDepress: false,
	        items: [
                { text: 'Abfrage', pressed: true }, 
                { text: 'Note' 		}, 
                { text: 'MC'		}, 
                { text: 'Ja/Nein' 	}, 
                { text: 'ABCD' 		}
	        ],
	        listeners: {
	        	toggle: function(container, button, pressed){
	        		var panel = this.up('panel');
	        		switch (button.text) {
						case 'Abfrage':
							if(pressed) panel.voteQuestion.show();
							else panel.voteQuestion.hide();
							break;
						case 'Note':
							if(pressed) panel.schoolQuestion.show();
							else panel.schoolQuestion.hide();
							break;
						case 'MC':
							if(pressed) panel.multipleChoiceQuestion.show();
							else panel.multipleChoiceQuestion.hide();
							break;
						case 'Ja/Nein':
							if(pressed) panel.yesNoQuestion.show();
							else panel.yesNoQuestion.hide();
							break;
						case 'ABCD':
							if(pressed) panel.abcdQuestion.show();
							else panel.abcdQuestion.hide();
							break;
						default:
							break;
					}
	        		panel.doLayout();
	        	}
	        }
	    });
		
		this.toolbar = new Ext.Toolbar({
			title: 'Frage 1',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [
            this.toolbar,
            new Ext.Toolbar({
	            ui: 'light',
	            dock: 'top',
	            items: [
                    {xtype: 'spacer'},
                    this.questionOptions,
                    {xtype: 'spacer'}
                ],
	        }),
        ];
		
		this.saveButton = new Ext.form.FormPanel({
			items: [{
				xtype: 'fieldset',
				items: [{
			        xtype	: 'button',
			        ui: 'confirm',
					text: 'Speichern',
					handler: this.saveHandler,
			    }],
			}],
		});
		
		this.items = [
            this.mainPart,
            
            /* only one of the question types will be shown at the same time */
		    this.voteQuestion,
            this.multipleChoiceQuestion,
            this.yesNoQuestion,
            this.schoolQuestion,
            this.abcdQuestion,
            
//            this.releasePart,
            this.saveButton,
        ];
		
		ARSnova.views.speaker.NewQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		
		ARSnova.views.speaker.NewQuestionPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		this.getMaxQuestionNumber();
	},
	
    saveHandler: function(){
    	var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	var values = {};
    	
    	/* get text, subject, number of question from mainPart */
    	var mainPartValues = panel.mainPart.getValues();
    	values.number = mainPartValues.number;
    	values.text = mainPartValues.text;
    	values.subject = mainPartValues.subject;
    	
    	/* check if release question button is clicked */
    	var releasePart = panel.releasePart;
    	var button = releasePart.down('segmentedbutton').pressedButton;
    	if(button){
    		switch (button.text) {
				case 'Alle':
					values.releasedFor = 'all';
					break;
				case 'THM':
					values.releasedFor = 'thm';
					break;
				case 'Kurse':
					var releasedForValues = releasePart.getValues();
					var tmpArray = [];
					for (name in releasedForValues) {
						var id = releasedForValues[name];
						if(id === null)
							continue;
						tmpArray.push({
							name: name,
							id: id,
						});
					}
					if(tmpArray.length > 0){
						values.releasedFor = 'courses';
						values.courses = tmpArray;
					}
					break;	
				default:
					break;
			}
    	}
    	
    	/* fetch the values */
    	switch (panel.questionOptions.getPressed().text) {
			case 'Abfrage':
				values.questionType = "vote";
				var tmpValues = panel.down("#vote").getValues();

				values.possibleAnswers = [
		          { text: tmpValues.voteAnswer1 },
		          { text: tmpValues.voteAnswer2 },
		          { text: tmpValues.voteAnswer3 },
		          { text: tmpValues.voteAnswer4 },
		          { text: tmpValues.voteAnswer5 },
		    	];
				break;
			case 'Note':
				values.questionType = "school";
				var tmpValues = panel.down("#school").getValues();
				
		    	values.possibleAnswers = [
		          { text: tmpValues.schoolAnswer1 },
		          { text: tmpValues.schoolAnswer2 },
		          { text: tmpValues.schoolAnswer3 },
		          { text: tmpValues.schoolAnswer4 },
		          { text: tmpValues.schoolAnswer5 },
		    	];
				break;
			case 'MC':
				values.questionType = "mc";
				
				var tmpValues = panel.down("#mc").getValues();
				
		    	wrongAnswers = [];
		    	wrongAnswers.push(tmpValues.wrongAnswer1);
		    	wrongAnswers.push(tmpValues.wrongAnswer2);
		    	wrongAnswers.push(tmpValues.wrongAnswer3);
		    	wrongAnswers.push(tmpValues.wrongAnswer4);
		    	wrongAnswers.push(tmpValues.wrongAnswer5);
		    	
		    	values.possibleAnswers = [{
		    		correct: 1,
		    		text: tmpValues.correctAnswer,
		    	}];
		    	
		    	for ( var i = 1; i < tmpValues.countAnswers; i++){
		    		values.possibleAnswers.push({
						text: wrongAnswers[i - 1],
					});	
				}
				break;
			case 'Ja/Nein':
				values.questionType = "yesno";
				
				var form = panel.down("#yesno");
		    	var yesNoOption = form.down('segmentedbutton');
		    	
		    	var correct = "";
		    	if (yesNoOption.pressedButton)
		    		correct = yesNoOption.pressedButton.text;
		    	else {
		    		return;
		    	}
		    	
		    	switch (correct) {
					case "Ja":
						values.possibleAnswers = [
			              { text: "Ja", correct: 1 },
			              { text: "Nein" },
			            ];
						break;
					case "Nein":
						values.possibleAnswers = [
			              { text: "Ja" },
			              { text: "Nein", correct: 1 },
			            ];	
						break;
				}
				break;
			case 'ABCD':
				values.questionType = "abcd";
				
				var form = panel.down("#abcd");
		    	var segmentedButton = form.down('segmentedbutton');
		    	
		    	var correct = "";
		    	if (segmentedButton.pressedButton) {
		    		correct = segmentedButton.pressedButton.text;
		    	} else {
		    		values.noCorrect = 1;
		    	}
		    	
		    	switch (correct) {
					case "A":
						values.possibleAnswers = [
		                  { text: "A", correct: 1 },
		                  { text: "B" },
		                  { text: "C" },
		                  { text: "D" },
		                ];
						break;
					case "B":
						values.possibleAnswers = [
		                  { text: "A" },
		                  { text: "B", correct: 1 },
		                  { text: "C" },
		                  { text: "D" },
		                ];	
						break;
					case "C":
						values.possibleAnswers = [
		                  { text: "A" },
		                  { text: "B" },
		                  { text: "C", correct: 1 },
		                  { text: "D" },
		                ];
						break;
					case "D":
						values.possibleAnswers = [
		                  { text: "A" },
		                  { text: "B" },
		                  { text: "C" },
		                  { text: "D", correct: 1 },
		                ];
						break;
					default:
						values.possibleAnswers = [
		                  { text: "A" },
		                  { text: "B" },
		                  { text: "C" },
		                  { text: "D" },
		                ];
						break;
				}
				break;
			default:
				break;
		}
    	
    	ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel.dispatch(values);
    },
    
    dispatch: function(values){
    	Ext.dispatch({
			controller	: 'questions',
			action		: 'add',
			sessionId	: localStorage.getItem('sessionId'),
			text		: values.text,
			subject		: values.subject,
			type		: "skill_question",
			questionType: values.questionType,
			duration	: values.duration,
			number		: parseFloat(values.number),
			active		: 1,
			possibleAnswers: values.possibleAnswers,
			releasedFor	: values.releasedFor,
			courses		: values.courses,
			noCorrect	: values.noCorrect,
			successFunc	: function(response, opts){
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				Ext.dispatch({
					controller	: 'questions',
					action		: 'details',
					question	: opts.request.jsonData,
				})
			},
			failureFunc	: function(response, opts){
    			console.log(response);
    			console.log(opts);
    	  		console.log('server-side failure with status code ' + response.status);
    	  		Ext.Msg.alert("Hinweis!", "Das Erstellen der Frage war leider nicht erfolgreich");
    	  		Ext.Msg.doComponentLayout();
    		},
		})
    },
    
    getMaxQuestionNumber: function(){
    	ARSnova.questionModel.maxNumberInSession(localStorage.getItem("sessionId"), {
    		success: function(response){
    			var rows = Ext.decode(response.responseText).rows;
    			var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    			
    			var value = 1;
    			if(rows.length > 0){
    				value = rows[0].value + 1;
    			}
    			
    			panel.toolbar.setTitle("Frage " + value);
    			panel.mainPart.down('numberfield[name=number]').setValue(value);
    		}
    	})
    }
});
ARSnova.views.speaker.QuestionDetailsPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	cancelButton: null,
	editButton	: null,
	
	questionObj : null,
	
	renewAnswerDataTask: {
		name: 'renew the answer table data at question details panel',
		run: function(){
			
			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.getQuestionAnswers();
		},
		interval: 20000, //20 seconds
	},
	
	constructor: function(question){
		this.questionObj = question;
		
		if( this.questionObj.questionType == "yesno" 	|| 
			this.questionObj.questionType == "mc" 		||
			( this.questionObj.questionType == "abcd" && !this.questionObj.noCorrect ) ) {
			this.hasOneCorrectAnswer = true;			
		}
		
		/* BEGIN TOOLBAR OBJECTS */
		
		this.backButton = new Ext.Button({
			text	: 'Fragen',
			ui		: 'back',
			scope	: this,
			handler	: function(){
				taskManager.stop(this.renewAnswerDataTask);
				
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.on('cardswitch', function(){
					this.destroy();
				}, this, {single: true});
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
				});
			},
		});
		
		this.cancelButton = new Ext.Button({
			text	: 'Abbrechen',
			ui		: 'decline',
			hidden	: true,
			handler	: function(){
				var panel = this.up('panel');
				var eb = panel.editButton;
				eb.setText("Bearbeiten");
				eb.removeCls('x-button-action');
				
				this.hide();
				panel.backButton.show();
				panel.resetFields();
			},
		});
		
		this.editButton = new Ext.Button({
			text	: 'Bearbeiten',
			hidden	: true,
			handler	: function(){
				var panel = this.up('panel');
				
				if(this.text == "Bearbeiten"){
					panel.cancelButton.show();
					panel.backButton.hide();
					
					this.setText("Speichern");
					this.addCls('x-button-action');
					
					this.enableFields();
				} else {
					panel.cancelButton.hide();
					panel.backButton.show();
					
					var values = this.up('panel').down('#contentForm').getValues();
					var question = Ext.ModelMgr.create(panel.questionObj, "Question");
					question.set("subject", values.subject);
					question.set("text", values.questionText);
//					question.set("duration", values.duration);
					question.save({
						success: function(response){
							//nothing to do
						}
					})
					
					this.setText("Bearbeiten");
					this.removeCls('x-button-action');
					
					this.disableFields();
				}
			},
			
			enableFields: function(){
				var fields = this.up('panel').down('#contentFieldset').items.items;
				var fieldsLength = fields.length;
				
				for(var i = 0; i < fieldsLength; i++){
					var field = fields[i];
					switch (field.label){
						case "Kategorie":
							field.setDisabled(false);
							break;
						case "Frage":
							field.setDisabled(false);
							break;
						case "Dauer":
							field.setDisabled(false);
							break;
						default:
							break;
					}
				}
			},
			
			disableFields: function(){
				var fields = this.up('panel').down('#contentFieldset').items.items;
				var fieldsLength = fields.length;
				
				for ( var i = 0; i < fieldsLength; i++){
					var field = fields[i];
					switch (field.label){
						case "Kategorie":
							field.setDisabled(true);
							break;
						case "Frage":
							field.setDisabled(true);
							break;
						case "Dauer":
							field.setDisabled(true);
							break;
						default:
							break;
					}
				}
			}
		});
		
		var questionNumber = "Frage";
		if(this.questionObj.number) {
			questionNumber += " " + this.questionObj.number;  
		}
		
		this.toolbar = new Ext.Toolbar({
			title: questionNumber,
			items: [
		        this.backButton,
		        this.cancelButton,
		        {xtype:'spacer'},
		        this.editButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		/* END TOOLBAR OBJECTS */
		
		/* BEGIN ACTIONS PANEL */
		
		this.statisticButton = new Ext.Panel({
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'statisticIcon',
				scope	: this,
				handler	: function(){
//					ARSnova.mainTabPanel.tabPanel.tabBar.hide();
					taskManager.stop(this.renewAnswerDataTask);
					var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.questionStatisticChart = new ARSnova.views.QuestionStatisticChart(this.questionObj, this)
					ARSnova.mainTabPanel.setActiveItem(sTP.questionStatisticChart, 'slide');
				},
			}, {
				html: 'Statistik',
				cls	: 'centerTextSmall',
			}]
		});

		this.releaseStatisticButton = new Ext.Panel({
			cls: this.hasOneCorrectAnswer? 'threeButtons left' : 'twoButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showStatistic? this.questionObj.showStatistic : 0,
				listeners: {
					change: function(toggleEl, something, value){
						var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						if (value == 0 && panel.questionObj.showStatistic == undefined || value == panel.questionObj.showStatistic) return;
						ARSnova.showLoadMask("Aktiviere die Freigabe...");
						var question = Ext.ModelMgr.create(panel.questionObj, "Question");
						switch (value) {
							case 0:
								delete question.data.showStatistic;
								break;
							case 1:
								question.set('showStatistic', 1);
								break;
						};
						question.save({
							success: function(response){
								panel.questionObj = question.data;
								ARSnova.hideLoadMask();
							},
							failure: function(){ console.log('could not save showStatistic flag') },
						});
					}
				}
			}, {
				html: 'Statistik freigeben',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.showCorrectAnswerButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'togglefield',
				label	: false,
				cls		: 'questionDetailsToggle',
				scope	: this,
				value 	: this.questionObj.showAnswer? this.questionObj.showAnswer : 0,
				listeners: {
					change: function(toggleEl, something, value){
						var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						if (value == 0 && panel.questionObj.showAnswer == undefined || value == panel.questionObj.showAnswer) return;
						ARSnova.showLoadMask("Aktiviere die Freigabe...");
						var question = Ext.ModelMgr.create(panel.questionObj, "Question");
						switch (value) {
							case 0:
								delete question.data.showAnswer;
								break;
							case 1:
								question.set('showAnswer', 1);
								break;
						};
						question.save({
							success: function(response){
								panel.questionObj = question.data;
								ARSnova.hideLoadMask();
							},
							failure: function(){ console.log('could not save showAnswer flag') },
						});
					}
				}
			}, {
				html: 'Richtig markieren',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.questionStatusButton = new ARSnova.views.QuestionStatusButton(this.questionObj);
		
		this.deleteAnswersButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'recycleIcon',
				scope	: this,
				handler	: function(){
					Ext.Msg.confirm("Antworten löschen?", "Die Frage bleibt erhalten.", function(answer){
						if (answer == 'yes') {
							var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
							ARSnova.questionModel.deleteAnswers(panel.questionObj._id, {
								success: function(){
									panel.answerFormFieldset.items.each(function(button){
										button.setBadge("0");
									});
								},
								failure: function(response){
									console.log('server-side error delete question');
								},
							})						
						}
					});
					Ext.Msg.doComponentLayout();
				},
			}, {
				html: 'Antworten löschen',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.deleteQuestionButton = new Ext.Panel({
			cls: 'threeButtons left',
			
			items: [{
				xtype	: 'button',
				text	: ' ',
				cls		: 'deleteIcon',
				scope	: this,
				handler	: function(){
					var msg = "Sind Sie sicher?";
					if (this.questionObj.active && this.questionObj.active == 1)
						msg += "<br>Es werden auch alle bisher gegebenen Antworten gelöscht.";
					Ext.Msg.confirm("Frage löschen", msg, function(answer){
						if (answer == 'yes') {
							var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
							ARSnova.questionModel.destroy(sTP.questionDetailsPanel.questionObj, {
								failure: function(response){
									console.log('server-side error delete question');
								},
							})						
							me = sTP.questionDetailsPanel;
							sTP.setActiveItem(sTP.audienceQuestionPanel, {
								type		: 'slide',
								direction	: 'right',
								duration	: 700,
								before: function(){
									taskManager.stop(me.renewAnswerDataTask);
								},
								after: function(){
									me.destroy();
								}
							})
						}
					});
					Ext.Msg.doComponentLayout();
				},
			}, {
				html: 'Frage löschen',
				cls	: 'centerTextSmall',
			}]
		});
		
		this.firstRow = new Ext.form.FormPanel({
			cls	 : 'actionsForm',
			style: {
				marginTop: '15px'
			},
				
			items: [
			    this.statisticButton,
			    this.releaseStatisticButton,
			],
		});
		
		this.secondRow = new Ext.form.FormPanel({
			cls	 : 'actionsForm',
				
			items: [
			    this.questionStatusButton,
			    this.deleteAnswersButton,
			    this.deleteQuestionButton,
			],
		});
		
		this.actionsPanel = new Ext.Panel({
			items: [{
				cls: 'gravure',
				html: '\u201e' + this.questionObj.text + '\u201f',
			},
		        this.firstRow,
		        this.secondRow,
			],
		});
		/* END ACTIONS PANEL */
		
		this.textarea = new Ext.plugins.ResizableTextArea({
			label: 'Frage',
			name: 'questionText',
			value: this.questionObj.text,
			disabled: true,
		});
		
		/* BEGIN QUESTION DETAILS */
		this.contentFieldset = new Ext.form.FieldSet({
			cls	 : 'standardFieldset',
			id	 : 'contentFieldset',
			items: [{
				xtype: 'textfield',
				label: 'Kategorie',
				name: 'subject',
				value: this.questionObj.subject,
				disabled: true,
			}, this.textarea, {
				xtype: 'textfield',
				label: 'Typ',
				value: this.getType(),
				disabled: true,
//			}, {
//				xtype: 'textfield',
//				label: 'Dauer',
//				name: 'duration',
//				value: this.getDuration(),
//				disabled: true,
			}, {
				xtype: 'textfield',
				label: 'Status',
				value: this.questionObj.active == "1" ? "Freigegeben" : "Nicht freigegeben",
				disabled: true,
			}],	
		}),
		
		this.contentForm = new Ext.form.FormPanel({
			id 	 : 'contentForm',
			style: { marginTop: '15px' },
			items: [this.contentFieldset]
		}),
		
		this.answerFormFieldset = new Ext.form.FieldSet({
			title: 'Antworten',
			cls	 : 'standardFieldset',
		}),
		
		this.answerForm = new Ext.form.FormPanel({
			id 	 	: 'answerForm',
			scroll	: false,
			items	: [this.answerFormFieldset]
		}),
		/* END QUESTION DETAILS */
		
		this.items = [
          this.actionsPanel,
          this.contentForm,
          this.answerForm,
        ];
		
		ARSnova.views.speaker.QuestionDetailsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);
		/* show a loading screen to hide the showCorrectAnswerButton-Animation*/
		ARSnova.showLoadMask('Lade Daten');
		
		ARSnova.views.speaker.QuestionDetailsPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		this.getPossibleAnswers();
		
		if(this.hasOneCorrectAnswer){
			this.firstRow.add(this.showCorrectAnswerButton);
			this.doLayout();
		}
		setTimeout("ARSnova.hideLoadMask()", 1000);
		
		if(!this.questionObj.active)
			this.editButton.show();
		else
			taskManager.start(this.renewAnswerDataTask);
	},
	
	getPossibleAnswers: function(){
		for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++){
			var pA = this.questionObj.possibleAnswers[i];
			this.answerFormFieldset.add({
				xtype		: 'button',
				ui			: 'normal',
				text		: pA.text,
				disabled	: true,
				cls			: 'answerListButton',
				badgeText	: '0',
				badgeCls	: 'badgeicon',
			});
		}

		this.doComponentLayout();
	},
	
	getType: function(){
		if(this.questionObj.questionType){
			switch (this.questionObj.questionType) {
				case "vote":
					return "Evaluation";
				case "school":
					return "Note";
				case "mc":
					return "Multiple-Choice";
				case "abcd":
					return "ABCD";
				case "yesno":
					return "Ja/Nein";
				default:
					return this.questionObj.questionType;
			}
		} else {
			/**
			 * only for older questions:
			 * try to define the question type
			 */
			if(this.questionObj.possibleAnswers.length == 2)
				return "Ja/Nein-Frage";
			else if(this.questionObj.possibleAnswers[0].correct)
				return "Multiple-Choice-Frage";
			else if(this.questionObj.possibleAnswers.length == 5)
				return "Abstimmung";
			else
				return "Note";
		}
	},
	
	getDuration: function(){
		switch (this.questionObj.duration){
			case 0:
				return "unbegrenzt";	
			case 1:
				return this.questionObj.duration + " Minute";
			case "unbegrenzt":
				return "unbegrenzt";
			case undefined:
				return "unbegrenzt";
			default:
				return this.questionObj.duration + " Minuten";
			
		}
	},

	getQuestionAnswers: function(){
		if (this.questionObj.active == "1" && this.questionObj.possibleAnswers){
			ARSnova.questionModel.countAnswers(this.questionObj._id, {
				success: function(response){
					var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
					var responseObj = Ext.decode(response.responseText).rows;
					
					var tmp_possibleAnswers = [];
					
					for ( var i = 0; i < panel.questionObj.possibleAnswers.length; i++){
						var el = panel.questionObj.possibleAnswers[i];
						tmp_possibleAnswers.push(el.text);
					}
					
					for ( var i = 0; i < responseObj.length; i++){
						var el = responseObj[i];
						
						var field = "button[text=" + el.key[1] + "]";
						panel.answerFormFieldset.down(field).setBadge(el.value);
						
						var idx = tmp_possibleAnswers.indexOf(el.key[1]); // Find the index
						if(idx!=-1) tmp_possibleAnswers.splice(idx, 1); // Remove it if really found!
					}
					
					for ( var i = 0; i < tmp_possibleAnswers.length; i++){
						var el = tmp_possibleAnswers[i];
						
						var field = "button[text=" + el + "]";
						panel.answerFormFieldset.down(field).setBadge(0);
					}
					
				},
				failure: function(){
					console.log('server-side error');
				}
			});
		}
	},
	
	resetFields: function(){
		var fields = this.down('#contentFieldset').items.items;
		var fieldsLength = fields.length;
		
		for ( var i = 0; i < fieldsLength; i++){
			var field = fields[i];
			switch (field.label){
				case "Kategorie":
					field.setValue(this.questionObj.subject);
					break;
				case "Frage":
					field.setValue(this.questionObj.text);
					break;
				case "Dauer":
					field.setValue(this.getDuration());
					break;
				default:
					break;
			}
			field.setDisabled(true);
		}
	}
});
questionChartColors = ['url(#v1)', 'url(#v2)', 'url(#v3)', 'url(#v4)', 'url(#v5)', 'url(#v6)'],

ARSnova.views.QuestionStatisticChart = Ext.extend(Ext.Panel, {
	title	: 'Statistik',
	iconCls	: 'tabBarIconCanteen',
	layout	: 'fit',
	
	questionObj: null,
	questionChart: null,
	questionStore: null,
	lastPanel: null,
	
	/* toolbar items */
	toolbar				: null,
	canteenVoteButton	: null,
	
	renewChartDataTask: {
		name: 'renew the chart data at question statistics charts',
		run: function(){
			ARSnova.mainTabPanel.layout.activeItem.getQuestionAnswers();
		},
		interval: 10000, //10 seconds
	},
	
	/**
	 * count every 15 seconds all actually logged-in users for this sessions
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.mainTabPanel.layout.activeItem.countActiveUsers();
		},
		interval: 15000,
	},
	
	constructor: function(question, lastPanel){
		this.questionObj = question;
		this.lastPanel = lastPanel;
		
		this.questionStore = new Ext.data.Store({
			fields: ['text', 'value'],
		});
		
		/* shuffle the possible answers for multiple choice question because the correct answer is every time the first entry */
		if (question.questionType && question.questionType == 'mc')
			question.possibleAnswers.shuffle();
		
		for ( var i = 0; i < question.possibleAnswers.length; i++) {
			var pA = question.possibleAnswers[i];
			if(pA.data){
				this.questionStore.add({
					text: pA.data.text,
					value: 0,
				})
			} else {
				this.questionStore.add({
					text: pA.text,
					value: 0,
				})
			}
		}
		
		this.backButton = new Ext.Button({
			text	: 'Zurück',
			ui		: 'back',
			scope	: this,
			handler	: function() {
				taskManager.stop(this.renewChartDataTask);
				taskManager.stop(this.countActiveUsersTask);
				ARSnova.mainTabPanel.on('cardswitch', function(){
					if(ARSnova.mainTabPanel.tabPanel.speakerTabPanel)
						taskManager.start(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.renewAnswerDataTask);
				}, this, {single:true});
				ARSnova.mainTabPanel.layout.activeItem.on('deactivate', function(){
					this.destroy();					
				}, this, {single:true});
				ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		var questionNumber = "";
		if(this.questionObj.number)
			questionNumber = "Frage " + this.questionObj.number;
		else
			questionNumber = "Frage";
		
		var title = this.questionObj.text;
		if(window.innerWidth < 800 && title.length > (window.innerWidth / 10))
			title = title.substring(0, (window.innerWidth) / 10) + "...";
		
		this.toolbar = new Ext.Toolbar({
			items: [this.backButton, {
				xtype: 'spacer',
			}, {
				xtype: 'container',
				cls: "x-toolbar-title",
				html: questionNumber,
			}, {
				xtype: 'spacer',
			}, {
				xtype: 'container',
				cls: "x-toolbar-title",
				html: "0/0",
				style: {paddingRight: '10px'}
			}]
		});
		
		if( this.questionObj.questionType == "yesno" 	|| 
			this.questionObj.questionType == "mc" 		||
			( this.questionObj.questionType == "abcd" && !this.questionObj.noCorrect ) ) {
			
			if(this.questionObj.showAnswer){
				this.gradients = [];
				for ( var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
					var question = this.questionObj.possibleAnswers[i];
					if (!question.correct || question.correct == false){
						this.gradients.push({
							'id': 'v' + (i+1),
							'angle': 0,
							stops: {
								0:   { color: 'rgb(212, 40, 40)' },
								100: { color: 'rgb(117, 14, 14)' }
							}
						});
					} else {
						this.gradients.push({
							'id': 'v' + (i+1),
							'angle': 0,
							stops: {
								0:   { color: 'rgb(43, 221, 115)' },
								100: { color: 'rgb(14, 117, 56)' }
							}
						})	
					}
						
				}
			} else {
				this.gradients = [{
					'id': 'v1',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(22, 64, 128)' },
						100: { color: 'rgb(0, 14, 88)' }
					}
				}, {
					'id': 'v2',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(48, 128, 128)' },
						100: { color: 'rgb(8, 88, 88)' }
					}
				}, {
					'id': 'v3',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 128, 25)' },
						100: { color: 'rgb(88, 88, 0)' }
					}
				}, {
					'id': 'v4',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 28, 128)' },
						100: { color: 'rgb(88, 0, 88)' }
					}
				}, {
					'id': 'v5',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 21, 21)' },
						100: { color: 'rgb(88, 0, 0)' }
					}
				}, {
					'id': 'v6',
					'angle': 0,
					stops: {
						0:   { color: 'rgb(128, 64, 22)' },
						100: { color: 'rgb(88, 24, 0)' }
					}
				}];
			}
		} else {
			this.gradients = [{
				'id': 'v1',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(22, 64, 128)' },
					100: { color: 'rgb(0, 14, 88)' }
				}
			}, {
				'id': 'v2',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(48, 128, 128)' },
					100: { color: 'rgb(8, 88, 88)' }
				}
			}, {
				'id': 'v3',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 128, 25)' },
					100: { color: 'rgb(88, 88, 0)' }
				}
			}, {
				'id': 'v4',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 28, 128)' },
					100: { color: 'rgb(88, 0, 88)' }
				}
			}, {
				'id': 'v5',
				'angle': 0,
				stops: {
					0:   { color: 'rgb(128, 21, 21)' },
					100: { color: 'rgb(88, 0, 0)' }
				}
			}];
		}
		
		this.questionChart = new Ext.chart.Chart({
			cls: 'column1',
		    theme: 'Demo',
		    store: this.questionStore,

		    animate: {
		        easing: 'bounceOut',
		        duration: 1000
		    },
		    
		    gradients: this.gradients,
		    
		    axes: [{
		        type: 'Numeric',
		        position: 'left',
		        fields: ['value'],
		        minimum: 0,
		        maximum: this.maxValue,
		        label: {
		            renderer: function(v) {
		                return v.toFixed(0);
		            }
		        },
		    },
		    {
		        type: 'Category',
		        position: 'bottom',
		        fields: ['text'],
		        label: {
		        	rotate: {
		        		degrees: 315,
		        	}
		        }
		    }, {
	            type    : 'Category',
	            position: 'top',
	            label   : {
	            	renderer: function(){
	            		return "";
	            	}
            	},
	            title   : title,
	            dashSize: 0
	        } ],
		    series: [{
		        type: 'column',
		        axis: 'left',
		        highlight: true,
		        renderer: function(sprite, storeItem, barAttr, i, store) {
		            barAttr.fill = questionChartColors[i % questionChartColors.length];
		            return barAttr;
		        },
		        label: {
		          field: 'value'
		        },
		        xField: 'text',
		        yField: 'value'
		    }],
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [this.questionChart];
		
		this.doLayout();
		
		ARSnova.views.QuestionStatisticChart.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		
		ARSnova.views.QuestionStatisticChart.superclass.initComponent.call(this);
	},
	
	getQuestionAnswers: function() {
		ARSnova.questionModel.countAnswers(this.questionObj._id, {
			success: function(response) {
				var panel = ARSnova.mainTabPanel.layout.activeItem;
				var chart = panel.questionChart;
				var store = chart.store;
				
				var responseObj = Ext.decode(response.responseText).rows;
				
				var sum = 0;
				var maxValue = 10;
				
				var tmp_possibleAnswers = [];
				
				for ( var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
					var el = panel.questionObj.possibleAnswers[i];
					if(el.data)
						tmp_possibleAnswers.push(el.data.text);
					else
						tmp_possibleAnswers.push(el.text);
				}
				
				for ( var i = 0; i < responseObj.length; i++) {
					var el = responseObj[i];
					var record = store.findRecord('text', el.key[1], 0, false, true, true); //exact match
					record.data.value = el.value;
					sum += el.value;
					
					if (el.value > maxValue) {
						maxValue = Math.ceil(el.value / 10) * 10;
					}
					
					var idx = tmp_possibleAnswers.indexOf(el.key[1]); // Find the index
					if(idx!=-1) tmp_possibleAnswers.splice(idx, 1); // Remove it if really found!
				}
				for ( var i = 0; i < tmp_possibleAnswers.length; i++) {
					var el = tmp_possibleAnswers[i];
					var record = store.findRecord('text', el, 0, false, true, true);
					record.data.value = 0;
				}
				
				chart.axes.items[0].maximum = maxValue;
				
				// renew the chart-data
				chart.redraw();
				
				//update quote in toolbar
				var quote = panel.toolbar.items.items[4];
				var users = quote.el.dom.innerHTML.split("/");
				users[0] = sum;
				users = users.join("/");
				quote.update(users);
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	},
	
	onActivate: function() {
		taskManager.start(this.renewChartDataTask);
		taskManager.start(this.countActiveUsersTask);
		
		this.questionChart.axes.items[2].axis.attr.stroke = "#0E0E0E";
		this.questionChart.redraw();
	},
	
	countActiveUsers: function(){
		ARSnova.loggedInModel.countActiveUsersBySession(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				
				if(ARSnova.mainTabPanel.tabPanel.speakerTabPanel)
					ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.toolbar.setTitle(localStorage.getItem("shortName") + " (" + value + ")");
				
				//update quote in toolbar
				var quote = ARSnova.mainTabPanel.layout.activeItem.toolbar.items.items[4];
				var users = quote.el.dom.innerHTML.split("/");
				users[1] = value;
				users = users.join("/");
				quote.update(users);
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});
ARSnova.views.speaker.SessionSettingsPanel = Ext.extend(Ext.Panel, {
	
	constructor: function(){
		
		ARSnova.views.speaker.SessionsSettingsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.speaker.SessionsSettingsPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		
	},
	
	onDeactivate: function(){
		this.destroy();
	},
});
ARSnova.views.speaker.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Home',
	iconCls	: 'tabBarIconHome',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.inClassPanel 			= new ARSnova.views.speaker.InClass();
		this.audienceQuestionPanel 	= new ARSnova.views.speaker.AudienceQuestionPanel();
		this.newQuestionPanel 		= new ARSnova.views.speaker.NewQuestionPanel();
		
		this.items = [
	        this.inClassPanel,
	        this.audienceQuestionPanel,
	        this.newQuestionPanel,
        ];
		ARSnova.views.speaker.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		setTimeout("ARSnova.hideLoadMask();", 1000);
		
		ARSnova.views.speaker.TabPanel.superclass.initComponent.call(this);
	},
	
	renew: function(){
		this.remove(this.inClassPanel);
		this.inClassPanel = new ARSnova.views.speaker.InClass();
		this.insert(0, this.inClassPanel);
		this.setActiveItem(this.inClassPanel);
		this.inClassPanel.registerListeners();
	}
});
Ext.namespace('ARSnova.views.user');

ARSnova.views.user.InClass = Ext.extend(Ext.Panel, {
	
	inClass			: null,
	feedbackButton	: null,
	questionsButton	: null,
	rankingButton	: null,
	quizButton		: null,
	
	/**
	 * If user logged in a session, check for new skill questions
	 */
	checkNewSkillQuestionsTask: {
		name: 'check for new skill questions',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkNewSkillQuestions();
		},
		interval: 30000,
	},
	
	/**
	 * if users feedback vote was removed, notify the user
	 */
	checkFeedbackRemovedTask: {
		name: 'check if my feedback was deleted',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkFeedbackRemoved();
		},
		interval: 30000,
	},
	
	/**
	 * count all actually logged-in users for this session
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.countActiveUsers();
		},
		interval: 15000,
	},
	
	/**
	 * check if speaker has closed the session
	 */
	checkSessionStatusTask: {
		name: 'check if this session was closed',
		run: function(){
			ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkSessionStatus();
		},
		interval: 20000,
	},
	
	constructor: function(){
		this.sessionLogoutButton = new Ext.Button({
			text	: 'Logout',
			ui		: 'back',
			handler	: function() {
				Ext.Msg.confirm('Ausloggen', 'Wollen Sie sich wirklich aus dieser Session abmelden?', function(answer) {
					if (answer == 'yes') {
						Ext.dispatch({
							controller	: 'sessions',
							action		: 'logout',
						});
					}
				});
				Ext.Msg.doComponentLayout();
			},			
		});
		
		this.toolbar = new Ext.Toolbar({
			title: localStorage.getItem("shortName"),
			items: [
		        this.sessionLogoutButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.feedbackButton = new Ext.Button({
			ui			: 'normal',
			text		: 'Mein Feedback',
			cls			: 'forwardListButton',
			badgeText	: '.',
			badgeCls	: 'badgeicon feedbackARSnova',
			controller	: 'feedback',
			action		: 'showVotePanel',
			handler		: this.buttonClicked,
		});
		
		this.questionButton = new Ext.Button({
			ui			: 'normal',
			text		: 'Fragen ans Publikum',
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon',
			controller	: 'questions',
			action		: 'index',
			handler		: this.buttonClicked,
		});
		
		this.rankingButton = new Ext.Button({
			ui			: 'normal',
			text		: 'Mein Ranking',
			cls			: 'forwardListButton',
			badgeCls	: 'rankingText',
			controller	: 'ranking',
			action		: 'index',
			handler		: this.buttonClicked,
		});
		
		this.inClass = {
			xtype: 'form',
			cls	 : 'standardForm topPadding',
			
			items: [{
				cls: 'gravureBig',
				html: localStorage.getItem("name"),
			}, {
				xtype: 'fieldset',
				cls	 : 'standardFieldset noMargin',
				instructions: "Session-ID: " + ARSnova.formatSessionID(localStorage.getItem("keyword")),
				items: [					
					this.feedbackButton,
					this.questionButton,
				]
			}
//		        this.feedbackButton,
//		        this.questionButton,
//		        this.rankingButton,
	        ],
		};
		
		
		
		this.items = [this.inClass];
		
		ARSnova.views.user.InClass.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('destroy', this.destroyListeners);
		
		ARSnova.views.user.InClass.superclass.initComponent.call(this);
	},
	
	/* will be called on session login */
	registerListeners: function(){
		var panel = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		taskManager.start(panel.checkNewSkillQuestionsTask);
		taskManager.start(panel.checkFeedbackRemovedTask);
		taskManager.start(panel.countActiveUsersTask);
		taskManager.start(panel.checkSessionStatusTask);
	},
	
	/* will be called on session logout */
	destroyListeners: function(){
		var panel = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		taskManager.stop(panel.checkNewSkillQuestionsTask);
		taskManager.stop(panel.checkFeedbackRemovedTask);
		taskManager.stop(panel.countActiveUsersTask);
		taskManager.stop(panel.checkSessionStatusTask);
	},
	
	/**
	 * fetch all new unanswered skill questions for this session and show a notification
	 * if user don't want to answer this questions now, save this opinion in localStorage
	 */
	checkNewSkillQuestions: function(){
		ARSnova.questionModel.getUnansweredSkillQuestions(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
			success: function(newQuestions){
				ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.questionButton.setBadge(newQuestions.length);
				ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.tab.setBadge(newQuestions.length);
				
				if (newQuestions.length > 0) {
					var userQuestionPanel = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel;
					
					var showNotification = false;
    				var questionsArr = Ext.decode(localStorage.getItem('questionIds'));
    				
					//check for each question if exists a "dont-remind-me"-flag
					for(var i = 0; i < newQuestions.length; i++){
						var question = newQuestions[i];
						if (questionsArr.indexOf(question) == -1){
							questionsArr.push(question);
							showNotification = true;
						}
					}
					localStorage.setItem('questionIds', Ext.encode(questionsArr));
					if (!showNotification) return;
					
					if(newQuestions.length == 1){
						ARSnova.questionModel.getQuestionById(newQuestions[0], {
							success: function(response){
								var question = Ext.decode(response.responseText).rows[0].value;
								
								Ext.Msg.confirm(
									'Es gibt 1 neue Frage.', 
									'"' + question.text + '"<br>Möchten Sie jetzt antworten?', 
									function(answer){
										if (answer == 'yes'){ //show the question to the user
											Ext.dispatch({
												controller	: 'questions',
												action		: 'index'
											});
										}
									}
								);
								Ext.Msg.doComponentLayout();
							},
							failure: function() {
				    			console.log("my sessions request failure");
				    		}
						});
					} else {
						//show a notification window
						Ext.Msg.confirm(
							'Es gibt ' + newQuestions.length + ' neue Fragen.', 'Möchten Sie diese jetzt beantworten?', 
							function(answer){
								if (answer == 'yes'){ //show the question to the user
									Ext.dispatch({
										controller	: 'questions',
										action		: 'index'
									});
								}
							}
						);
						Ext.Msg.doComponentLayout();
					}					
				}
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
	
	buttonClicked: function(button){
		Ext.dispatch({
			controller	: button.controller,
			action		: button.action,
		});
	},
	
	checkFeedbackRemoved: function() {
		if (localStorage.getItem('user has voted')){
			ARSnova.feedbackModel.getUserFeedback(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
	    		success: function(response){
					var responseObj = Ext.decode(response.responseText).rows;
					if (responseObj.length == 0){
						Ext.Msg.alert('Hinweis', 'Ihr Feedback wurde zurückgesetzt');
						Ext.Msg.doComponentLayout();
						localStorage.removeItem('user has voted');
						
						var feedbackButton = ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
						feedbackButton.badgeEl.remove();
						feedbackButton.badgeEl = null;
						feedbackButton.badgeCls = "feedbackARSnova";
						feedbackButton.setBadge(".");
					}
	    		},
				failure: function(){
					console.log('server-side error feedbackModel save');
				}
			});
		}
	},
	
	countActiveUsers: function(){
		ARSnova.loggedInModel.countActiveUsersBySession(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (res.length > 0){
					value = res[0].value;
				}
				ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.toolbar.setTitle(localStorage.getItem("shortName") + " (" + value + ")");
				
				//update feedback counter
				var counterEl = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel.feedbackCounter;
				var title = counterEl.getText().split("/");
				title[1] = value;
				title = title.join("/");
				counterEl.update(title);
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
	
	/* if the session was closed, show a notification window and stop this task */
	checkSessionStatus: function(){
		ARSnova.sessionModel.isActive(localStorage.getItem("sessionId"), {
			success: function(response){
				var res = Ext.decode(response.responseText).rows;
				var value = 0;
				
				if (!res[0].value){
					Ext.Msg.show({
					  title: 'Hinweis:',
					  msg: 'Um mehrfaches Abstimmen zu verhindern, hat Ihr Dozent die Session gesperrt. Loggen Sie sich bitte erst am Ende der Vorlesung aus!',
					  buttons: [{
						  text:"Ich hab's verstanden",
						  ui: 'action',
					  }]
					});
					Ext.Msg.doComponentLayout();
					
					taskManager.stop(ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkSessionStatusTask);
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		})
	},
});
ARSnova.views.user.QuestionPanel = Ext.extend(Ext.Carousel, {
	title	: 'Fragen',
	iconCls	: 'tabBarIconQuestion',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionCounter: 0,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			},
		});
		
		this.listeners = {
			cardswitch: function(panel, newCard, oldCard, index, animated){
				//update toolbar with question number
				var questionNumber = "Frage";
				if(newCard.questionObj.number)
					questionNumber += " " + newCard.questionObj.number;
				panel.toolbar.setTitle(questionNumber);
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = index + 1;
				counterEl.update(counter.join("/"));
				
				//check for showStatistic flag
				if(newCard.questionObj.showStatistic && newCard.questionObj.showStatistic == 1)
					panel.statisticButton.show();
				else
					panel.statisticButton.hide();
			}
		};
		
		this.questionCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
		});
		
		this.statisticButton = new Ext.Button({
			text	: ' ',
			cls		: 'statisticIconSmall',
			hidden	: true,
			handler	: function() {
				var questionStatisticChart = new ARSnova.views.QuestionStatisticChart(ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.layout.activeItem.questionObj, this)
				ARSnova.mainTabPanel.setActiveItem(questionStatisticChart, 'slide');
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Frage',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.statisticButton,
		        this.questionCounter
	        ]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.user.QuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', this.beforeActivate);
		this.on('activate', this.onActivate);
		
		ARSnova.views.user.QuestionPanel.superclass.initComponent.call(this);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
		ARSnova.showLoadMask("Suche Fragen...");
	},
	
	onActivate: function(){
		this.getUnansweredSkillQuestions();
	},
	
	getUnansweredSkillQuestions: function(){
		ARSnova.questionModel.getSkillQuestionsForUser(localStorage.getItem("sessionId"), {
			success: function(response){
				var userQuestionsPanel = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel;
				var questions = Ext.decode(response.responseText).rows;
				var questionsArr = [];
				var questionIds = [];
				
				if (questions.length == 0){
					//no questions found
					userQuestionsPanel.questionCounter.hide();
					userQuestionsPanel.add({
						cls: 'centerText',
						html: 'Es wurden noch keine Fragen gestellt.',
					});
					userQuestionsPanel.indicator.hide();
					userQuestionsPanel.doLayout();
					ARSnova.hideLoadMask();
					return;
				} else {
					//update question counter in toolbar
					var counterEl = userQuestionsPanel.questionCounter;
					var counter = counterEl.el.dom.innerHTML.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.update(counter.join("/"));
				}
				
				if (questions.length == 1){
					userQuestionsPanel.indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
				});
				
				ARSnova.answerModel.getAnswerByUserAndSession(localStorage.getItem("login"), localStorage.getItem("sessionId"), {
					success: function(response){
						var answers = Ext.decode(response.responseText).rows;

						answers.forEach(function(answer){
							if(questionsArr[answer.value.questionId])
								questionsArr[answer.value.questionId].userAnswered = answer.value.answerText;
						});
						questionIds.forEach(function(questionId){
							userQuestionsPanel.addQuestion(questionsArr[questionId]);
							userQuestionsPanel.doLayout();
						});
						userQuestionsPanel.checkAnswer();
						userQuestionsPanel.checkFirstQuestion();
					},
					failure: function(response){
						console.log('error');
					}
				});
				ARSnova.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
		
	addQuestion: function(question){
		this.add(new ARSnova.views.Question(question));
	},
	
	checkAnswer: function(){
		ARSnova.showLoadMask("Prüfe Antworten...");
		this.items.items.forEach(function(questionPanel){
			var list = questionPanel.down('list');
			var questionObj = questionPanel.questionObj;
			
			if(questionObj.userAnswered){
				var data = list.store.data;
				for (var i = 0; i < data.length; i++) {
					if (data.items[i].data.text == questionObj.userAnswered){
						list.getSelectionModel().select(data.items[i]);
						questionPanel.disable();
						break;
					}
				}
				
				if(questionObj.showAnswer){
					for ( var i = 0; i < questionObj.possibleAnswers.length; i++) {
						var answer = questionObj.possibleAnswers[i].data;
						if(answer.correct && (answer.correct == 1 || answer.correct == true)){
							list.el.dom.childNodes[0].childNodes[i].className = "x-list-item x-list-item-correct";
							break;
						}
					}
				}
			}
			
		});
		
		setTimeout("ARSnova.hideLoadMask()", 1000);
	},
	
	checkFirstQuestion: function(){
		var firstQuestion = this.items.items[0].questionObj;
		if(firstQuestion.showStatistic && firstQuestion.showStatistic == 1)
			this.statisticButton.show();
	}
});
ARSnova.views.user.RankingPanel = Ext.extend(Ext.Panel, {
	myRanking 	 : null,
	myRankingPos : 0,
	betterCounter: 0,
	worseCounter : 0,
	equalCounter : -1, //have to start at -1 because the result of this user will be also in the resultSet of getSessionRankingStatistic
	overallCounter: 0,
	
	high	: 75,
	medium	: 50,
	low		: 25,
	highCounter	  : 0,
	mediumCounter : 0,
	lowCounter	  : 0,
	veryLowCounter: 0,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: 'Home',
			ui		: 'back',
			scope	: this,
			handler	: function() {
				me = this;
				ARSnova.mainTabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					after: function() {
						me.destroy();
					}
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: 'Ranking',
			items: [
		        this.backButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.myRankingPanel = new Ext.Panel({
			cls: 'centerText',
		});
		
		this.sessionStatisticPanel = new Ext.Panel({
			cls: 'centerText',
		});
		
		this.items = [{
			cls: 'centerText',
			html: 'Hier sehen Sie die Statistik der Session: <br><br>',
		}, this.myRankingPanel, this.sessionStatisticPanel];
		
		ARSnova.views.user.RankingPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.userRankingModel.getUserRankingStatistic(localStorage.getItem("sessionId"), localStorage.getItem("login"), {
			success: function(response){
				var responseObj = Ext.decode(response.responseText).rows;
				if (responseObj.length == 0) return;
				ARSnova.mainTabPanel.layout.activeItem.myRanking = responseObj[0].value;
			},
			failure: function() {
				console.log('server-side error');
			}
		});
		
		ARSnova.userRankingModel.getSessionRankingStatistic(localStorage.getItem("sessionId"), {
			success: function(response){
				var panel = ARSnova.mainTabPanel.layout.activeItem;
				var responseObj = Ext.decode(response.responseText).rows;
				
				for(var i = 0; i < responseObj.length; i++){
					var ur = responseObj[i];
					if (ur.value >  panel.myRanking) panel.betterCounter++;
					if (ur.value <  panel.myRanking) panel.worseCounter++;
					if (ur.value == panel.myRanking) panel.equalCounter++;
					
					if (ur.value >=  panel.high) 		panel.highCounter++;
					else if (ur.value >=  panel.medium) panel.mediumCounter++;
					else if (ur.value >= panel.low)		panel.lowCounter++;
					else panel.veryLowCounter++;
					
					panel.overallCounter++;
				}
				panel.myRankingPos = panel.betterCounter + 1;
			},
			failure: function(){
				console.log('server-side error');
			}
		});
		
		this.on('activate', this.onActivate);
		
		ARSnova.views.user.RankingPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function(){
		if(this.myRanking !== null) {
			var rankingText = "Sie haben " + this.myRanking + "% der Fragen korrekt beantwortet <br>";
			rankingText += "und befinden sich damit auf dem " + this.myRankingPos + ". Platz! <br>";
			
			if (this.myRankingPos == 1 && this.overallCounter > 1) 
				rankingText += "Herzlichen Glückwunsch!<br><br>";
			else 
				"<br><br>";

			sessionText = "Insgesamt haben " + this.overallCounter + " Personen an dem Quiz teilgenommen.<br>";
			
			if (this.betterCounter == 0) {
				sessionText += "Niemand ist besser! <br>";
			} else if (this.betterCounter == 1) {
				sessionText += "1 Person hat besser abgeschnitten. <br>";
			} else {
				sessionText += this.betterCounter + " Personen haben besser abgeschnitten. <br>";
			} 
			
			if (this.equalCounter == 0) {
				
			} else if (this.equalCounter == 1) {
				sessionText += "1 Person ist mit Ihnen gleichauf. <br>";
			} else {
				sessionText += this.equalCounter + " Personen sind mit Ihnen gleichauf. <br>";
			} 
			
			if (this.worseCounter == 0) {
				
			} else if (this.worseCounter == 1) {
				sessionText += "1 Person hat schlechter abgeschnitten. <br>";
			} else {
				sessionText += this.worseCounter + " Personen haben schlechter abgeschnitten. <br>";
			}
		} else {
			var rankingText = "Sie haben noch keine Fragen beantwortet! Erst dann können Sie ihr eigenes Ranking einsehen.";
			
			var sessionText = "<table class=\"ranking\"><caption>Session-Übersicht</caption>";
			sessionText += "<thead><tr><th>Ergebnis</th><th>Anzahl</th></tr></thead>";
			sessionText += "<tr><td>100% - " + this.high + "%</td><td>" + this.highCounter + "</td>";
			sessionText += "<tr><td>" + this.high + "% - " + this.medium + "%</td><td>" + this.mediumCounter + "</td>";
			sessionText += "<tr><td>" + this.medium + "% - " + this.low + "%</td><td>" + this.lowCounter + "</td>";
			sessionText += "<tr><td>" + this.low + "% - 0%</td><td>" + this.veryLowCounter + "</td>";
			
			sessionText += "</table>";
		}
		
		 
		this.myRankingPanel.update(rankingText);
		this.sessionStatisticPanel.update(sessionText);
	},
});




ARSnova.views.user.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: 'Home',
	iconCls	: 'tabBarIconHome',
	scroll	: 'vertical',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.inClassPanel = new ARSnova.views.user.InClass();
		
		this.items = [
	        this.inClassPanel,
        ];
		ARSnova.views.user.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('afterlayout', function(){
			setTimeout("ARSnova.hideLoadMask()", 1000); // timeout to compensate the cardswitch animation
		});
		
		ARSnova.views.user.TabPanel.superclass.initComponent.call(this);
	},
	
	renew: function(){
		this.remove(this.inClassPanel);
		this.inClassPanel = new ARSnova.views.user.InClass();
		this.insert(0, this.inClassPanel);
		this.setActiveItem(0);
		this.inClassPanel.registerListeners();
	}
});
