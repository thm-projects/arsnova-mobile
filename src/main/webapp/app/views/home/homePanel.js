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
			text	: Messages.LOGOUT,
			ui		: 'back',
			handler	: function() {
				Ext.Msg.confirm(Messages.LOGOUT, Messages.LOGOUT_REQUEST, function(answer) {
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
		        this.logoutButton
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
				handler		: this.buttonClicked
			}]
		});
		
		this.sessionLoginForm = new Ext.Panel({
			cls: 'beside',
			items: [{
				xtype	: 'panel',
				cls		: 'topPadding',
				items	: [{
					cls		: 'gravure',
					html	: Messages.ENTER_SESSIONID
				}]
			}, {
				submitOnAction: false,
				xtype: 'form',
				items: [{
					xtype		: 'fieldset',
					defaults	: {
						labelWidth: '50%'
					},
					cls: 'bottomMargin',
					items: [{
						xtype		: 'numericKeypad',
						name		: 'keyword',
						placeHolder	: Messages.SESSIONID_PLACEHOLDER,
						maxLength	: 11
					}]
				}, {
					xtype	: 'button',
					ui		: 'confirm',
					text	: Messages.GO,
					handler	: this.onSubmit
				}]
			}]
		});
		
		this.lastVisitedSessionsFieldset = new Ext.form.FieldSet({
			cls: 'standardFieldset',
			title: Messages.LAST_VISITED_SESSIONS
		});
		
		this.lastVisitedSessionsForm = new Ext.form.FormPanel({
			items: [this.lastVisitedSessionsFieldset]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [
            this.sessionLoginForm,
            this.lastVisitedSessionsForm
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
			action		: button.action
		});
	},
	
	onSubmit: function() {
		ARSnova.showLoadMask(Messages.LOGIN_LOAD_MASK);
		var sessionLoginPanel = this;
		var values = this.up('form').getValues();
		
		//delete the textfield-focus, to hide the numeric keypad on phones
		this.up('panel').down('textfield').blur();
		
		Ext.dispatch({
			controller: 'sessions',
			action	  : 'login',
			keyword	  : values.keyword.replace(/ /g, ""),
			destroy   : false,
			panel	  : sessionLoginPanel
		});
	},
	
	loadVisitedSessions: function() {
		if(ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER) return;
		
		ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH);
		
		restProxy.getMyVisitedSessions({
			success: function(sessions){
				var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.homePanel;

				if (sessions && sessions.length !== 0) {
					panel.lastVisitedSessionsFieldset.removeAll();
					panel.lastVisitedSessionsForm.show();

					for ( var i = 0; i < sessions.length; i++) {
						var session = sessions[i];
						var course = " defaultsession";

						if (session.courseId && session.courseId.length > 0) {
							course = " coursesession";
						}

						var sessionButton = new Ext.Button({
							xtype		: 'button',
							ui		: 'normal',
							text		: session.name,
							cls		: 'forwardListButton' + course,
							controller	: 'sessions',
							action		: 'showDetails',
							badgeCls	: 'badgeicon',
							badgeText	: "",
							sessionObj	: session,
							handler		: function(options){
								ARSnova.showLoadMask("Login...");
								Ext.dispatch({
									controller	: 'sessions',
									action		: 'login',
									keyword		: options.sessionObj.keyword
								});
							}
						});
						panel.lastVisitedSessionsFieldset.add(sessionButton);
						panel.updateBadge(session.keyword, sessionButton);
						
						if (session.active && session.active == 1) {
							panel.down('button[text=' + session.name + ']').addCls("isActive");
						}
					}
				} else {
					panel.lastVisitedSessionsForm.hide();
				}
				
				panel.doComponentLayout();
			},
			unauthenticated: function() {
				Ext.dispatch({
					controller: "auth",
					action: "login",
					mode: ARSnova.loginMode
				});
			},
			failure: function(){
				console.log('server-side error loggedIn.save');
				ARSnova.mainTabPanel.tabPanel.homeTabPanel.homePanel.lastVisitedSessionsForm.hide();
			}
		}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	},
	
	updateBadge: function(sessionKeyword, button) {
		ARSnova.questionModel.getUnansweredSkillQuestions(sessionKeyword, {
			success: function(newQuestions) {
				button.setBadge(newQuestions.length);
			},
			failure: function(response) {
				console.log('error');
			}
		});
	}
});