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
Ext.regController("auth", {
	
	qr: function(options) {
		ARSnova.loggedIn = true;
		if (localStorage.getItem('login') === null) {
			localStorage.setItem('login', ARSnova.models.Auth.generateGuestName());
		}
		ARSnova.userRole = ARSnova.USER_ROLE_STUDENT;
		localStorage.setItem('role', ARSnova.userRole);
		ARSnova.loginMode = ARSnova.LOGIN_GUEST;
		localStorage.setItem('loginMode', ARSnova.loginMode);
		ARSnova.afterLogin();

		window.location = window.location.pathname + "#";
		Ext.dispatch({controller:'sessions', action:'login', keyword: options.sessionid});
	},
	
	roleSelect: function(options){
		ARSnova.userRole = options.mode;
		localStorage.setItem('role', options.mode);
		
		ARSnova.setWindowTitle();
		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.loginPanel, 'slide');
		
		if(ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER && !window.location.href.match(/developer\.html$/)) {
			Ext.getCmp('ext-comp-1007').getEl().hide();
			Ext.getCmp('ext-comp-1014').getEl().show();
		} else {
			Ext.getCmp('ext-comp-1007').getEl().show();
			Ext.getCmp('ext-comp-1014').getEl().hide();
		}
	},

	login: function(options){
		ARSnova.loginMode = options.mode;
		localStorage.setItem('loginMode', options.mode);
		var type = "";
		switch(options.mode){
			case ARSnova.LOGIN_GUEST:
				if (localStorage.getItem('login') === null) {
					localStorage.setItem('login', ARSnova.models.Auth.generateGuestName());
					type = "guest";
				} else {
					type = "guest&name=" + localStorage.getItem('login');
				}
				break;
			case ARSnova.LOGIN_THM:
				type = "cas";
				break;
			case ARSnova.LOGIN_TWITTER:
				type = "twitter";
				break;
			case ARSnova.LOGIN_FACEBOOK:
				type = "facebook";
				break;
			case ARSnova.LOGIN_GOOGLE:
				type= "google";
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
		if(type != "") {
			return window.location = "/doLogin?type=" + type;
		}
		
		ARSnova.afterLogin();
    },
    
    checkLogin: function(){
    	Ext.Ajax.request({
    		url: 'whoami.json',
    		method: 'GET',    		
    		success: function(response){
    			var obj = Ext.decode(response.responseText);
    			ARSnova.loggedIn = true;
    			localStorage.setItem('login', obj.username);
	    	    window.location = window.location.pathname + "#";
	    	    ARSnova.checkPreviousLogin();
    		},
    	});
    	
    },
    
    logout: function(){
    	/* stop task to save user is logged in */
    	taskManager.stop(ARSnova.loggedInTask);
    	
    	/* clear local storage */
    	localStorage.removeItem('sessions');
    	localStorage.removeItem('role');
    	localStorage.removeItem('loginMode');
    	
    	/* check if new version available */
    	var appCache = window.applicationCache;
		appCache.update();
    	
    	ARSnova.userRole = "";
		ARSnova.setWindowTitle();
    	
		/* redirect user:
		 * a: to CAS if user is authorized 
		 * b: to rolePanel if user was guest
		 * */
    	if (ARSnova.loginMode == ARSnova.LOGIN_THM) {
    		/* update will be done when returning from CAS */
    		localStorage.removeItem('login');
    		window.location = "https://cas.thm.de/cas/logout?url=http://" + window.location.hostname + window.location.pathname + "#auth/doLogout";
    	} else {
    		ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.rolePanel, {
    			type: 'slide',
    			direction: 'right',
    		});
    		/* update manifest cache of new version is loaded */
    		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
				window.applicationCache.swapCache();
				window.location.reload();
			}
    	}
    }
});
