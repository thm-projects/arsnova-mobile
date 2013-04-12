/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/homePanel.js
 - Beschreibung: Startseite für User in der Rolle "Zuhörer/in".
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
Ext.define('ARSnova.view.home.HomePanel', {
	extend: 'Ext.Container',
	
	config: {
		fullscreen: true,
		scroll	: 'vertical',
	},
	
	inClassRendered	: false,
	userInClass		: null,
	speakerInClass	: null,
	outOfClass		: null,
	
	/* toolbar items */
	toolbar				: null,
	logoutButton		: null,
	sessionLogoutButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.logoutButton = Ext.create('Ext.Button', {
			text	: Messages.LOGOUT,
			ui		: 'back',
			handler	: function() {
				Ext.Msg.confirm(Messages.LOGOUT, Messages.LOGOUT_REQUEST, function(answer) {
					if (answer == 'yes') {
						ARSnova.app.getController('Auth').logout();
					}
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'ARSnova',
			docked: 'top',
			items: [
		        this.logoutButton
			]
		});
		
		this.outOfClass = Ext.create('Ext.form.FormPanel', {
			title: 'Out of class',
			cls  : 'standardForm',
			scrollable: null,
				
			items: [{
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Sessions',
				cls			: 'forwardListButton',
				controller	: 'user',
				action		: 'index',
				handler		: this.buttonClicked
			}]
		});
		
		this.sessionLoginForm = Ext.create('Ext.Panel', {

			layout : {
			    type : 'vbox',
			    pack : 'center',
			    align: 'center'
			},

			items: [{
				xtype	: 'panel',
				cls		: 'topPadding',
				items	: [{
					cls		: 'gravure',
					html	: Messages.ENTER_SESSIONID
				}]
			}, {
				submitOnAction: false,
				xtype: 'formpanel',
				scrollable: null,
				width: '50%',
				minWidth: '280px',
				margin: '0 auto',
				
				items: [{
					xtype : 'fieldset',
					cls: 'bottomMargin',
					
					items: [{
						xtype		: 'numericKeypad',
						name		: 'keyword',
						placeHolder	: Messages.SESSIONID_PLACEHOLDER,
						maxLength	: 11
					}]
				}, {
					xtype	: 'button',
					height	: '45px',
					ui		: 'confirm',
					text	: Messages.GO,
					handler	: this.onSubmit
				}]
			}]
		});
		
		this.lastVisitedSessionsFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			title: Messages.MY_SESSIONS
		});
		
		this.lastVisitedSessionsForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [this.lastVisitedSessionsFieldset]
		});
		
		this.add([
		    this.toolbar,
            this.sessionLoginForm,
            this.lastVisitedSessionsForm
        ]);
		
		this.on('painted', function(){
			this.loadVisitedSessions();
			ARSnova.app.hideLoadMask();
		});
	},
	
	checkLogin: function(){
		if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
			this.logoutButton.addCls('thm');
		}
	},
	
	buttonClicked: function(button) {
		ARSnova.app.getController(button.controller)[button.action]();
	},
	
	onSubmit: function() {
		ARSnova.app.showLoadMask(Messages.LOGIN_LOAD_MASK);
		var sessionLoginPanel = this;
		var values = this.up('formpanel').getValues();
		
		//delete the textfield-focus, to hide the numeric keypad on phones
		this.up('panel').down('textfield').blur();
		
		ARSnova.app.getController('Sessions').login({
			keyword	  : values.keyword.replace(/ /g, ""),
			destroy   : false,
			panel	  : sessionLoginPanel
		});
	},
	
	loadVisitedSessions: function() {
		if(ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) return;
		
		ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.restProxy.getMyVisitedSessions({
			success: function(sessions) {
				var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.homePanel;
				var caption = Ext.create('ARSnova.view.Caption');

				var badgePromises = [];

				if (sessions && sessions.length !== 0) {
					panel.lastVisitedSessionsFieldset.removeAll();
					panel.lastVisitedSessionsForm.show();

					for ( var i = 0; i < sessions.length; i++) {
						var session = sessions[i];
						var course = " defaultsession";

						if (session.courseId && session.courseId.length > 0) {
							course = " coursesession";
						}

						var sessionButton = Ext.create('Ext.Button', {
							xtype		: 'button',
							ui			: 'normal',
							text		: session.name,
							cls			: 'forwardListButton' + course,
							controller	: 'sessions',
							action		: 'showDetails',
							badgeCls	: 'badgeicon',
							badgeText	: "",
							sessionObj	: session,
							handler		: function(options){
								ARSnova.app.showLoadMask("Login...");
								ARSnova.app.getController('Sessions').login({
									keyword		: options.sessionObj.keyword
								});
							}
						});
						panel.lastVisitedSessionsFieldset.add(sessionButton);
						badgePromises.push(panel.updateBadge(session.keyword, sessionButton));
						
						if (session.active && session.active == 1) {
							panel.down('button[text=' + session.name + ']').addCls("isActive");
						}
					}
					RSVP.all(badgePromises).then(Ext.bind(caption.explainBadges, caption));
					caption.explainSessionStatus(sessions);
					panel.lastVisitedSessionsFieldset.add(caption);
				} else {
					panel.lastVisitedSessionsForm.hide();
				}
			},
			unauthenticated: function() {
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function(){
				console.log('server-side error loggedIn.save');
				ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.homePanel.lastVisitedSessionsForm.hide();
			}
		}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	},
	
	updateBadge: function(sessionKeyword, button) {
		var promise = new RSVP.Promise();
		ARSnova.app.questionModel.getUnansweredSkillQuestions(sessionKeyword, {
			success: function(newQuestions) {
				button.setBadgeText(newQuestions.length);
				promise.resolve(newQuestions.length);
			},
			failure: function(response) {
				console.log('error');
				promise.reject();
			}
		});
		return promise;
	}
});