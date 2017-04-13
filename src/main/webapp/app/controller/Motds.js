/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define("ARSnova.controller.Motds", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Motd',
		'ARSnova.view.home.MotdPanel',
		'ARSnova.view.home.MotdDetailsPanel'
	],

	areAdminMotdPanelsInitialized: false,
	areMotdPanelsInitialized: false,
	isMotdDetailsPanelInitialized: false,

	listAllMotds: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

		var me = this;
		if (!this.areAdminMotdPanelsInitialized) {
			sTP.motdPanel = Ext.create('ARSnova.view.home.MotdPanel', {
				mode: 'admin'
			});
			sTP.newMotdPanel = Ext.create('ARSnova.view.home.NewMotdPanel', {
				mode: 'admin'
			});
			this.areAdminMotdPanelsInitialized = true;
		}

		sTP.motdPanel.setController(this);
		sTP.animateActiveItem(sTP.motdPanel, 'slide');
	},

	listAllSessionMotds: function (key) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		var me = this;
		if (!this.areMotdPanelsInitialized) {
			sTP.motdPanel = Ext.create('ARSnova.view.home.MotdPanel', {
				mode: 'session',
				sessionkey: key
			});
			sTP.newSessionMotdPanel = Ext.create('ARSnova.view.home.NewMotdPanel', {
				mode: 'session',
				sessionkey: key
			});
			this.areMotdPanelsInitialized = true;
		} else {
			sTP.motdPanel.setSessionkey(key);
		}

		sTP.motdPanel.setController(this);
		sTP.animateActiveItem(sTP.motdPanel, 'slide');
	},

	showMotds: function (motds, wwlist) {
		var alreadyseen = [];
		var motdlist = {_id: null, _rev: null, username: null, motdkeys: null};
		var boxes = [];
		var i = -1;
		var j = -1;
		var ff = 0;
		var lstrg = localStorage.getItem("motdkeys");
		if (lstrg !== null && lstrg !== "" && lstrg !== [] && lstrg[0] !== null) {
			alreadyseen = lstrg.split(',');
		}
		var username = localStorage.getItem("login");
		if (localStorage.getItem("loginMode") === "guest") {
			wwlist = 0;
		}
		if (wwlist === 1) {
			ARSnova.app.restProxy.getMotdListForUser(
				username, {
					success: function (response) {
						motdlist = Ext.decode(response.responseText);
						if (motdlist.motdkeys !== null && motdlist.motdkeys !== "" && motdlist.motdkeys !== []) {
							if (alreadyseen === []) {
								alreadyseen = motdlist.motdkeys;
							} else {
								alreadyseen.push(motdlist.motdkeys);
							}
						}
					},
					failure: function () {
						wwlist = 0;
					}
				}
			);
		}
		motds.forEach(function (motd) {
			if (alreadyseen !== []) {
				if (alreadyseen.indexOf(motd.motdkey) > -1) {
					return;
				}
			}
			i++;
			var messageBox = (Ext.create('ARSnova.view.components.MotdMessageBox', {
				title: Ext.util.Format.htmlEncode(motd.title),
				content: motd.text,
				motdkey: motd.motdkey
			}));
			boxes[i] = messageBox;
		});
		boxes.forEach(function (box) {
			j++;
			if (j === i) {
				box.setButtons([{
					scope: this,
					text: Messages.CONTINUE,
					itemId: 'continue',
					ui: 'action',
					handler: function () {
						alreadyseen.push(box.motdkey);
						box.hide();
						if ((motdlist._id === null) && wwlist === 1) {
							motdlist.motdkeys = alreadyseen.join(",");
							motdlist.username = username;
							ARSnova.app.getController('Motds').saveMotdList(motdlist);
						} else if (wwlist === 1) {
							motdlist.motdkeys = alreadyseen.join(",");
							ARSnova.app.getController('Motds').updateMotdList(motdlist);
						}
						localStorage.setItem('motdkeys', alreadyseen);
					}
				}]);
			} else {
				var next = j + 1;
				box.setButtons([{
					scope: this,
					text: Messages.CONTINUE,
					itemId: 'continue',
					ui: 'action',
					handler: function () {
						alreadyseen.push(box.motdkey);
						box.hide();
						boxes[next].show();
					}
				}]);
			}
		});
		if (i >= 0) {
			boxes[0].show();
		}
	},

	// timestring shall have format: MM.DD.JJJJ
	getTimestampByString: function (timestring) {
		var datestrings = [];
		var pos = null;
		var ret = null;
		var del = timestring.indexOf('.');
		datestrings[0] = timestring.substr(0, del);
		pos = timestring.indexOf('.') + 1;
		del = timestring.indexOf('.', pos);
		datestrings[1] = timestring.substr(pos, del - pos);
		pos = timestring.indexOf('.', pos) + 1;
		datestrings[2] = timestring.substr(pos);
		ret = new Date(datestrings[1] + "/" + datestrings[0] + "/" + datestrings[2]);
		return ret.getTime();
	},

	saveMotdList: function (motdlist) {
		ARSnova.app.restProxy.saveMotdList(motdlist);
	},

	updateMotdList: function (motdlist) {
		ARSnova.app.restProxy.updateMotdList(motdlist);
	},

	getAllMotds: function () {
		ARSnova.app.motdModel.getAllMotds.apply(ARSnova.app.motdModel, arguments);
	},

	getAllSessionMotds: function () {
		ARSnova.app.motdModel.getAllSessionMotds.apply(ARSnova.app.motdModel, arguments);
	},

	add: function (options) {
		var panel = null;
		var motd = Ext.create('ARSnova.model.Motd', {
			title: options.title,
			text: options.text,
			startdate: options.startdate,
			enddate: options.enddate,
			audience: options.audience,
			sessionkey: options.sessionkey
		});
		motd.set('_id', undefined);
		if (options.audience === "session") {
			panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newSessionMotdPanel;
		} else {
			panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newMotdPanel;
		}
		panel.query('textfield').forEach(function (el) {
			el.removeCls("required");
		});

		var error = false;

		var validation = motd.validate();
		if (!validation.isValid()) {
			var notifications = validation.all.map(function (val) {
				return val.config.message;
			}).join("<br/>");
			var messageBox = Ext.create('Ext.MessageBox', {
				title: Messages.NOTIFICATION,
				message: notifications,
				listeners: {
					hide: function () {
						this.destroy();
					}
				}
			});
			messageBox.setButtons({
				text: Messages.CONTINUE,
				ui: 'action',
				handler: function () {
					messageBox.hide();
				}
			});
			messageBox.show();
			validation.items.forEach(function (el) {
				panel.down('textfield[name=' + el.getField() + ']').addCls("required");

				error = true;
			});
		}
		motd.set('motdkey', undefined);
		if (error === false) {
			var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SAVE);
			motd.saveMotd({
				success: function (response, eOpts) {
					options.successFunc(response, eOpts);
					hideLoadMask();
				},
				failure: function (response, eOpts) {
					options.failureFunc(response, eOpts);
					hideLoadMask();
				}
			});
		}
	},

	details: function (options, modus) {
		var sTP = null;
		if (modus === 'admin') {
			sTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		} else {
			sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		}
		sTP.motdDetailsPanel = Ext.create('ARSnova.view.home.MotdDetailsPanel', {
			motd: options.motd,
			mode: modus
		});
		sTP.animateActiveItem(sTP.motdDetailsPanel, 'slide');
	}
});
