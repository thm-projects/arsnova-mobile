/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/auth.js
 - Beschreibung: Auth-Controller
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
Ext.define("ARSnova.controller.Auth", {
	extend: 'Ext.app.Controller',
	
	config: {
		routes: {
			'id/:sessionkey': 'qr',
			'id/:sessionkey/:role': 'qr',
			'auth/checkLogin': 'checkLogin'
		}
	},

	services: new RSVP.Promise(),

	launch: function() {
		var me = this;
		ARSnova.app.restProxy.getAuthServices({
			success: function(services) {
				me.services.resolve(services);
			},
			failure: function() {
				me.services.reject();
			}
		});
	},

	qr: function(sessionkey, role) {
		console.debug("Controller: Auth.qr", sessionkey, role);
		var me = this;
		ARSnova.app.launched.then(function () {
			localStorage.setItem(
				'role', 
				"lecturer" === role ? ARSnova.app.USER_ROLE_SPEAKER : ARSnova.app.USER_ROLE_STUDENT
			);
			localStorage.setItem('keyword', sessionkey);
			if (!ARSnova.app.checkPreviousLogin()) {
				me.login();
			}
			ARSnova.app.afterLogin();

			window.location = window.location.pathname + "#";
		});
	},
	
	con: function(options) {
		ARSnova.loggedIn = true;
		ARSnova.loginMode = ARSnova.LOGIN_GUEST;
		ARSnova.userRole = ARSnova.USER_ROLE_STUDENT;

		if (localStorage.getItem('login') === null) {
			localStorage.setItem('login', ARSnova.models.Auth.generateGuestName());
		}
		localStorage.setItem('loginMode', ARSnova.loginMode);
		localStorage.setItem('role', ARSnova.userRole);
		localStorage.setItem('ARSnovaCon', true);
		localStorage.setItem('keyword', options.sessionid);
		
		ARSnova.afterLogin();

		window.location = window.location.pathname + "#";
		Ext.dispatch({controller:'sessions', action:'login', keyword: options.sessionid});
	},
	
	roleSelect: function(options){
		ARSnova.app.userRole = options.mode;
		localStorage.setItem('role', options.mode);
		
		ARSnova.app.setWindowTitle();
	},

	login: function(options) {
		console.debug("Controller: Auth.login", options);
		var serviceId = options && options.service ? options.service.id : "guest";
		ARSnova.app.loginMode = serviceId;
		localStorage.setItem('loginMode', serviceId);
		var location = "", type = "", me = this;
		
		if (ARSnova.app.LOGIN_GUEST === serviceId){
			if (localStorage.getItem('login') === null) {
				localStorage.setItem('login', ARSnova.app.authModel.generateGuestName());
				type = "guest";
			} else {
				type = "guest&user=" + localStorage.getItem('login');
			}
			location = "auth/login?type=" + type;
			ARSnova.app.restProxy.absoluteRequest({
				url: location,
				success: function() {
					me.checkLogin();
				}
			});
		} else {
			location = Ext.util.Format.format(options.service.dialogUrl, encodeURIComponent(window.location.pathname));
			this.handleLocationChange(location);
		}
	},
	
	checkLogin: function(){
		console.debug("Controller: Auth.checkLogin");
		ARSnova.app.restProxy.absoluteRequest({
			url: 'whoami.json',
			success: function(response){
				var obj = Ext.decode(response.responseText);
				ARSnova.app.loggedIn = true;
				localStorage.setItem('login', obj.username);
				window.location = window.location.pathname + "#";
				ARSnova.app.checkPreviousLogin();
				ARSnova.app.restProxy.connectWebSocket();
			}
		});
	},

    logout: function(){
		/* hide diagnosis panel */
		ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.tab.hide();
    	
    	/* stop task to save user is logged in */
    	taskManager.stop(ARSnova.app.loggedInTask);
    	
    	/* clear local storage */
    	localStorage.removeItem('sessions');
    	localStorage.removeItem('role');
    	localStorage.removeItem('loginMode');
    	
    	/* check if new version available */
    	var appCache = window.applicationCache;
    	if (appCache.status !== appCache.UNCACHED) {
    		appCache.update();
    	}
    	
    	ARSnova.app.userRole = "";
		ARSnova.app.setWindowTitle();
    	
		/* redirect user:
		 * a: to CAS if user is authorized 
		 * b: to rolePanel if user was guest
		 * */
    	if (ARSnova.app.loginMode == ARSnova.app.LOGIN_CAS) {
    		/* update will be done when returning from CAS */
    		localStorage.removeItem('login');
    		var location = "https://cas.thm.de/cas/logout?url=http://" + window.location.hostname + window.location.pathname + "#auth/doLogout";
    		this.handleLocationChange(location);
    	} else {
    		ARSnova.app.restProxy.authLogout();

    		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
    			type: 'slide',
    			direction: 'right'
    		});
    		/* update manifest cache of new version is loaded */
    		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
				window.applicationCache.swapCache();
				Console.log('reload');
				window.location.reload();
			}
    	}
    },
    
    /**
     * handles window.location change for desktop and mobile devices separately
     */
    handleLocationChange: function(location) {
    	/** 
    	 * mobile device 
    	 */
		if(ARSnova.app.checkMobileDeviceType()) {
			ARSnova.app.restProxy.absoluteRequest(location);
		}
		
		/** 
		 * desktop 
		 */
		else {
			window.location = location;
		} 

    }
});
