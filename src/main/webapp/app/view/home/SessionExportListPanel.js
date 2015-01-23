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
Ext.define('ARSnova.view.home.SessionExportListPanel', { 
	extend: 'Ext.Panel',
	requires: ['ARSnova.view.Caption', 'ARSnova.view.home.SessionList'],
	
	config: {
		exportType: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
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
	

		this.matrixButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			}
		});
		
		var toolbarItems = [this.backButton, {xtype:'spacer'}];
		
		if (this.getExportType() == 'filesystem') {
			this.ContinueToExport = Ext.create('Ext.Button', {
				text: Messages.CONTINUE,
				itemId: 'continue',
				handler: function () {
					if(!me.checkSelectedSessions()){
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.EXPORT_NOTIFICATION);
					} else {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						var exportToFile = Ext.create('ARSnova.view.home.SessionExportToFilePanel', {
							exportSessionMap: me.sessionMap,
							backReference: me
						});
						hTP.animateActiveItem(exportToFile, 'slide');
					}
				}
			});
			
			toolbarItems.push(this.ContinueToExport);
			
			this.exportButton = Ext.create('ARSnova.view.MatrixButton', {
				text: 'Export', 
				buttonConfig: 'icon',
				imageCls: 'icon-cloud-download ',
				scope: this,
				handler: function () {
					if(!me.checkSelectedSessions()){
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.EXPORT_NOTIFICATION);
					} else {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						var exportToFile = Ext.create('ARSnova.view.home.SessionExportToFilePanel', {
							exportSessionMap: me.sessionMap,
							backReference: me
						});
						hTP.animateActiveItem(exportToFile, 'slide');
					}
				}
			});
					
			this.matrixButtonPanel.add(this.exportButton);
		}
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONS,	
			docked: 'top',
			ui: 'light',
			items: toolbarItems
		});
		
		this.sessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			scrollable: null,
			cls: 'standardForm',
			title: Messages.EXPORT_SESSION_LABEL
		});
		
		this.add([this.toolbar]);
				
		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,

			items: [  
		        this.sessionsForm,
		        this.matrixButtonPanel
	        ]
		});
		
		this.add([
	          this.toolbar,
      		  this.mainPart
	  	]);
		
		// load user sessions before displaying the page
		this.onBefore('painted', function () {
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				this.loadCreatedSessions();
			}
		});
	},
	
	checkSelectedSessions: function() {
		for (var i = 0; i < this.sessionMap.length; i++) {
			if (this.sessionMap[i][1] == true)
				return true;
		}
		return false;
	},
	
	loadCreatedSessions: function () {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				me.sessionMap = [];
				var panel = me;
			
				panel.sessionsForm.removeAll();
				panel.sessionsForm.show();
				
				var toggleListener = {
						beforechange: function (slider, thumb, newValue, oldValue) {
							
						},
				        change: function (slider, thumb, newValue, oldValue) {
				        	// TODO why is 0 toggle checked and 1 toggle unchecked?
				            if (newValue == 0) { // true
				                // Changing from off to on
				            	var id = slider.id.split('_')[1];
				            	me.sessionMap[id][1] = true;
				            } else if (newValue == 1) { // false
			            	   // Changing from on to off
				            	var id = slider.id.split('_')[1];
				            	me.sessionMap[id][1] = false;
				            }
				        }
				};

				
				var session;
				for (var i = 0, session; session = sessions[i]; i++) {
					
					var sessionChecked = false;
					
					me.sessionMap[i] = [session, sessionChecked];
					
					var shortDateString = "";
					var longDateString  = "";
					if (session.creationTime != 0) {
						var d               = new Date(session.creationTime);
						var shortDateString = " ("+d.getDate()+"."+(parseInt(d.getMonth())+1)+"."+d.getFullYear()+")";
						var longDateString  = " ("+d.getDate()+"."+(parseInt(d.getMonth())+1)+"."+d.getFullYear()+" "+d.getHours()+":"+('0'+d.getMinutes()).slice(-2)+")";
					}
					
					// Minimum width of 321px equals at least landscape view
					var displaytext = window.innerWidth > 481 ? session.name + longDateString : session.shortName + shortDateString;
					
					var sessionEntry = null;
					
					if (me.getExportType() == 'filesystem') {
						sessionEntry = Ext.create('Ext.field.Toggle', {
							id: 'sessionToggle_' + i,
							label: Ext.util.Format.htmlEncode(displaytext),
							cls: 'rightAligned',
							sessionObj: session,
							value: sessionChecked
						});
						
						sessionEntry.setListeners(toggleListener);
					} else if (me.getExportType() == 'public_pool') {

						console.log('session', session);
						
						sessionEntry = Ext.create('ARSnova.view.MultiBadgeButton', {
							ui: 'normal',
							text: Ext.util.Format.htmlEncode(displaytext),
//							iconCls: course + " courseIcon",
							cls: 'forwardListButton',
							sessionObj: session,
							handler: function (options) {
								console.log('options', options.config.sessionObj);
								var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
								
								var exportSession = options.config.sessionObj;
			
								// validate session for public pool
								if (exportSession.numQuestions < 1) {									
									Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSIONPOOL_NOTIFICATION_QUESTION_NUMBER);
								} else {
									var exportToPublic = Ext.create('ARSnova.view.home.SessionExportToPublicPanel', {
										exportSession: exportSession,
										backReference: me
							    	});
									
									hTP.animateActiveItem(exportToPublic, 'slide');
								}
							}
						});
					}
					
					panel.sessionsForm.addEntry(sessionEntry);
				}

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