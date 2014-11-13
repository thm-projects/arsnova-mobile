/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define("ARSnova.controller.Auth", {
	extend: 'Ext.app.Controller',

	config: {
		routes: {
			'id/:sessionkey': 'qr',
			'id/:sessionkey/:role': 'qr',
			'auth/checkLogin': 'restoreLogin',
			'': 'restoreLogin',
			/* Facebook unfortunately appends #_=_ to auth success URL */
			'_=_': 'restoreLogin'
		}
	},

	disableRouting: false,

	services: new RSVP.Promise(),
	launch: function () {
		var me = this;
		ARSnova.app.configLoaded.then(function () {
			ARSnova.app.restProxy.getAuthServices({
				success: function (services) {
					me.services.resolve(services);
				},
				failure: function () {
					me.services.reject();
				}
			});
		});
	},

	qr: function (sessionkey, role) {
		/* Workaround: Currently ARSnova is not designed to support routing after startup */
		if (this.disableRouting) {
			console.debug("Route ignored");

			return;
		}
		this.disableRouting = true;

		console.debug("Controller: Auth.qr", sessionkey, role);
		var me = this;
		ARSnova.app.configLoaded.then(function () {
			localStorage.setItem(
				'role',
				"lecturer" === role ? ARSnova.app.USER_ROLE_SPEAKER: ARSnova.app.USER_ROLE_STUDENT
			);
			localStorage.setItem('keyword', sessionkey);
			if (!ARSnova.app.checkPreviousLogin()) {
				me.login();
			}

			window.location = window.location.pathname + "#";
		});
	},

	con: function (options) {
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

	roleSelect: function (options) {
		ARSnova.app.userRole = options.mode;
		localStorage.setItem('role', options.mode);

		ARSnova.app.setWindowTitle();

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT) {
			this.services.then(Ext.bind(function (services) {
				var credibleLogins = services.filter(function (service) {
					return ['ldap', 'cas'].indexOf(service.id) !== -1;
				});
				var guestLogin = services.filter(function (service) {
					return service.id === 'guest';
				});
				var guest;

				if (credibleLogins.length > 0) {
					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
						ARSnova.app.mainTabPanel.tabPanel.loginPanel, 'slide'
					);
				} else if (guestLogin.length > 0) {
					this.login({ service: guestLogin[0] });
				} else {
					// this case should never happen ... but just in case:
					// display login panel if no suitable logins are found
					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
						ARSnova.app.mainTabPanel.tabPanel.loginPanel, 'slide'
					);
				}
			}, this));
		} else {
			ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
				ARSnova.app.mainTabPanel.tabPanel.loginPanel, 'slide'
			);
		}
	},

	login: function (options) {
		console.debug("Controller: Auth.login", options);
		var serviceId = options && options.service ? options.service.id : "guest";
		ARSnova.app.loginMode = serviceId;
		localStorage.setItem('loginMode', serviceId);
		var location = "", type = "", me = this;

		if (ARSnova.app.LOGIN_GUEST === serviceId) {
			if (localStorage.getItem('login') === null) {
				localStorage.setItem('login', ARSnova.app.authModel.generateGuestName());
				type = "guest";
			} else {
				type = "guest&user=" + localStorage.getItem('login');
			}
			location = "auth/login?type=" + type;
			ARSnova.app.restProxy.absoluteRequest({
				url: location,
				success: function () {
					me.checkLogin();
					ARSnova.app.afterLogin();
				}
			});
		} else {
			location = Ext.util.Format.format(options.service.dialogUrl, encodeURIComponent(window.location.pathname));
			this.handleLocationChange(location);
		}
	},

	checkLogin: function () {
		console.debug("Controller: Auth.checkLogin");
		var promise = new RSVP.Promise();
		ARSnova.app.restProxy.absoluteRequest({
			url: 'whoami.json',
			success: function (response) {
				var obj = Ext.decode(response.responseText);
				ARSnova.app.loggedIn = true;
				localStorage.setItem('login', obj.username);
				window.location = window.location.pathname + "#";
				if (window.socket) {
					ARSnova.app.restProxy.connectWebSocket();
				}
				promise.resolve();
			},
			failure: function (response) {
				promise.reject();
			}
		});

		return promise;
	},

	restoreLogin: function () {
		/* Workaround: Currently ARSnova is not designed to support routing after startup */
		if (this.disableRouting) {
			console.debug("Route ignored");

			return;
		}
		this.disableRouting = true;

		console.debug("Controller: Auth.restoreLogin");
		ARSnova.app.configLoaded.then(Ext.bind(function () {
			this.checkLogin().then(function () {
				ARSnova.app.checkPreviousLogin();
			});
		}, this));
	},

	logout: function () {
		/* hide diagnosis panel */
		ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel.tab.hide();

		/* show about tab panels */
		ARSnova.app.mainTabPanel.tabPanel.activateAboutTabs();
		
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
			var apiPath = ARSnova.app.globalConfig.apiPath;
			var location = apiPath + "/auth/logout?url=" + window.location.protocol + "//" + window.location.hostname + window.location.pathname + "#auth/doLogout";
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
				console.log('reload');
				window.location.reload();
			}
		}
	},

	/**
	 * handles window.location change for desktop and mobile devices separately
	 */
	handleLocationChange: function (location) {
		/**
		 * mobile device
		 */
		if (ARSnova.app.checkMobileDeviceType()) {
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
