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
Ext.define('ARSnova.view.speaker.ExportSessionPanel', { 
	extend: 'Ext.Panel',
	requires: ['ARSnova.view.Caption', 'ARSnova.view.home.SessionList'],
	
	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},
	
	initialize: function () {
		var me = this;
		
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});
		
		this.msgBox = Ext.create('Ext.MessageBox');
		

		this.questionExport = Ext.create('ARSnova.view.speaker.SessionExportPanel');
		this.questionExportToPublic = Ext.create('ARSnova.view.speaker.SessionExportToPublicPanel');
		
		this.exportButton = Ext.create('Ext.Button', {
			text: Messages.EXPORT_BUTTON_LABEL,
			ui: 'confirm',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					
				Ext.apply(me.msgBox, {
					YESNO: [
					        { text: 'Dateisystem', itemId: 'yes', ui: 'action' }, 
					        { text: 'Public Pool', itemId: 'no'}]//, ui: 'action' }]
				});
				
				me.msgBox.show({
					title: Messages.EXPORT_SELECTED_SESSIONS_TITLE,
					message: Messages.EXPORT_SELECTED_SESSIONS_MSG,
					buttons: me.msgBox.YESNO,
					fn: function(btn) {
					    if (btn === 'yes') {
					    	hTP.animateActiveItem(me.questionExport, 'slide');
					    }  else {
					    	hTP.animateActiveItem(me.questionExportToPublic, 'slide');
					    }
					}
				});
			}
		});
		
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONS,	// evtl. anderer Title
			docked: 'top',
			ui: 'light',
			items: [
			     this.backButton, 
				{xtype:'spacer'},
				this.exportButton 
			]
		});
		
		this.sessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			scrollable: null,
			cls: 'standardForm',
			title: Messages.MY_SESSIONS
		});
		
		this.add([this.toolbar]);
		
		this.onBefore('painted', function () {
			//this.loadCreatedSessions();
		});
		
		this.exportAnswerToggle = Ext.create('Ext.field.Toggle', {
			label: 'SessionXY',
			cls: 'rightAligned',
			value: true
		});
		
		this.exportStatisticToggle = Ext.create('Ext.field.Toggle', {
			label: 'Session1',
			cls: 'rightAligned',
			value: true
		});
		
		this.exportStudentsQuestionToggle = Ext.create('Ext.field.Toggle', {
			label: 'Session3',
			cls: 'rightAligned',
			value: true
		});
		
		this.exportOptions = Ext.create('Ext.form.FieldSet', {
			text: 'What should be exported?',
			items: [
		        this.exportAnswerToggle,
		        this.exportStudentsQuestionToggle,
		        this.exportStatisticToggle
	        ]
		});
		
		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,

			items: [
		        this.exportOptions
	        ]
		});
		
		this.add([
	          this.toolbar,
      		  this.mainPart
	  	]);

		
	},
	
	
	loadCreatedSessions: function () {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				var panel = me;//ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel;
				var caption = Ext.create('ARSnova.view.Caption');

				panel.sessionsForm.removeAll();
				panel.sessionsForm.show();

				var session;
				for (var i = 0, session; session = sessions[i]; i++) {
					
					//hier radio button anzeigen fuer jede Session
					var status = "";
					var course = "icon-radar";

					if (!session.active) {
						status = " isInactive";
					}

					if (session.courseType && session.courseType.length > 0) {
						course = "icon-prof";
					}

					// Minimum width of 321px equals at least landscape view
					var displaytext = window.innerWidth > 481 ? session.name : session.shortName;
					var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
						//ui: 'normal',
						text: Ext.util.Format.htmlEncode(displaytext),
						//iconCls: course + " courseIcon",
						//cls: 'forwardListButton' + status,
						sessionObj: session,
						handler: function (options) {
							
						}
					});
					
									
					panel.sessionsForm.addEntry(sessionButton);
				}
				caption.explainBadges(sessions);
				caption.explainStatus(sessions);

				hideLoadMask();
			},
			empty: Ext.bind(function () {
				hideLoadMask();
				this.sessionsForm.hide();
			}, this),
			unauthenticated: function () {
				hideLoadMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function () {
				hideLoadMask();
				console.log("my sessions request failure");
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},
});