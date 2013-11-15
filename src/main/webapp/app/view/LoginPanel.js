/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/LoginPanel.js
 - Beschreibung: Panel zum Auswählen eines Logins.
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
Ext.define('ARSnova.view.LoginPanel', {
	extend: 'Ext.Container',
	
	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		
		layoutOnOrientationChange: false,
		monitorOrientation: false,
		
		title: 'LoginPanel'
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		
		this.arsLogo = {
				xtype	: 'panel',
				cls		: null,
				html	: "<div class='arsnova-logo'></div>",
				style	: { marginTop: '35px', marginBottom: '35px' }
			};
		
		if (Ext.os.is.Phone) {
			this.arsLogo = {
					xtype	: 'panel',
					style	: { marginTop: '35px' }
				};
		}
		
		this.buttonPanelTop = Ext.create('Ext.Panel', {
			xtype	: 'container',
			layout	: {
				type: 'hbox',
				pack: 'center'
			},
			items	: [
				{
					xtype	: 'matrixbutton',
					text: Messages.GUEST,
					value: ARSnova.app.LOGIN_GUEST,
					image: "btn_guest",
					handler	: function(b) {
						if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
							Ext.Msg.confirm(Messages.GUEST_LOGIN, Messages.CONFIRM_GUEST_SPEAKER, function(answer) {
								if ('yes' === answer) {
									ARSnova.app.getController('Auth').login({
										mode: b.config.value
									});
								}
							});
						} else {
							ARSnova.app.getController('Auth').login({
								mode: b.config.value
							});
						}
					}
				},
				{
					xtype	: 'matrixbutton',
					text: Messages.UNI,
					value: ARSnova.app.LOGIN_CUSTOM,
					image: "btn_uni",
					handler	: function(b) {
						Ext.Msg.alert(Messages.UNI_LOGIN_MSG, Messages.UNI_LOGIN_MSG_TEXT, function() {
							ARSnova.app.getController('Auth').login({
								mode: b.config.value
							});
						});
					},
					style: "margin-left:20px"
				}
			]
		});
		
		this.buttonPanelBottom = Ext.create('Ext.Panel', {
			xtype	: 'container',
			layout	: {
				type: 'hbox',
				pack: 'center'
			},
			items	: [
				{
					xtype	: 'matrixbutton',
					text: 'Google',
					value: ARSnova.app.LOGIN_GOOGLE,
					image: "btn_google",
					handler	: function(b) {
						ARSnova.app.getController('Auth').login({
							mode: b.config.value
						});
					}
				},
				{
					xtype	: 'matrixbutton',
					text: 'Facebook',
					value	: ARSnova.app.LOGIN_FACEBOOK,
					image: "btn_facebook",
					handler	: function(b) {
						ARSnova.app.getController('Auth').login({
							mode: b.config.value
						});
					},
					style: "margin-left:20px"
				}
			]
		});
		
		
		
		this.add([{
			xtype	: 'toolbar',
			docked	: 'top',
			ui		: 'light',
			title	: 'Login',
			cls		: null,
			items: [{
			   text: Messages.BACK_TO_ROLEPANEL,
			   ui: 'back',
			   handler: function(){
					ARSnova.app.userRole = "";
					ARSnova.app.setWindowTitle();
					
					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
						type: 'slide',
						direction: 'right',
						duration: 500
					});	
				}
			}]
		},
		this.arsLogo, 
		this.buttonPanelTop,
		this.buttonPanelBottom
		]);
		
		/*this.on('activate', Ext.bind(function() {
			var isDevelopmentEnvironment = window.location.href.match(/developer\.html#?$/);
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				this.guestLoginButton.hide('fade');
			} else {
				this.guestLoginButton.show('fade');
			}
			if (isDevelopmentEnvironment) {
				this.guestLoginButton.show('fade');
			}
		}, this));*/
	}
});