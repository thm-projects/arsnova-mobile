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
		scroll: 'vertical',
		
		layoutOnOrientationChange: false,
		monitorOrientation: false,
		
		title: 'LoginPanel'
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		var threeButtons = [];
		if (window.innerWidth > 1000) {
			threeButtons = [{
				text	: 'Google',
				cls		: 'login-buttons google-wide',
				value	: ARSnova.app.LOGIN_GOOGLE
			}, {
				text	: 'THM',
				cls 	: 'login-buttons thm-login-wide',
				value	: ARSnova.app.LOGIN_THM
			}, {
				xtype: 'panel',
				style: {
					clear: 'both'
				}
			}];
		} else {
			threeButtons = [{
				text	: 'Google',
				cls		: 'login-buttons google',
				value	: ARSnova.app.LOGIN_GOOGLE
			}, {
				text	: 'THM',
				cls		: 'login-buttons thm-login',
				value	: ARSnova.app.LOGIN_THM
			}, {
				xtype: 'panel',
				style: {
					clear: 'both'
				}
			}];
		}
		
		this.noGuestSpeaker = Ext.create('Ext.Panel', {
			cls		: 'gravure',
			style	: { marginTop: '0px'},
			html	: Messages.NO_GUEST_SPEAKER
		});
		
		this.guestLoginButton = Ext.create('Ext.Button', {
			text	: Messages.GUEST,
			style	: { marginTop: '10px'},
			cls		: 'login-button login-label-guest',
			value	: ARSnova.app.LOGIN_GUEST,
			hidden	: true,
			handler	: function(b) {
				ARSnova.app.getController('Auth').login({
					mode: b.value
				});
			}
		});
		
		this.add([{
			xtype	: 'panel',
			cls		: null,
			style	: { marginTop: '20px'},
			html	: "<div class='arsnova-logo' style=\"background: url('resources/images/arsnova.png') no-repeat center; height:55px\"></div>"
		}, {
			xtype	: 'panel',
			cls		: 'gravure',
			style	: { marginTop: '0px'},
			html	: Messages.CHOOSE_LOGIN
		},
		this.guestLoginButton,
		{
			xtype: 'panel',
			style: {
				padding: '10px'
			},
			defaults : {
				xtype	: 'button',
				handler	: function(b) {
					ARSnova.app.getController('Auth').login({
						mode: b.value
					});
				}
			},
			items: threeButtons
		}, 
		{
			xtype: 'button',
			text: Messages.CHANGE_ROLE, 
			cls: 'backToRole',
			handler: function(){
				ARSnova.app.userRole = "";
				ARSnova.app.setWindowTitle();
				
				ARSnova.app.mainTabPanel.tabPanel.setActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
					type: 'slide',
					direction: 'right',
					duration: 500
				});	
			}
		},{
			xtype	: 'panel',
			cls		: null,
			html	: ''
		}, this.noGuestSpeaker]);
		
		this.on('activate', Ext.bind(function() {
			if(ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER && !window.location.href.match(/developer\.html#?$/)) {
				this.guestLoginButton.hide('fade');
				this.noGuestSpeaker.show('fade');
			} else {
				this.guestLoginButton.show('fade');
				this.noGuestSpeaker.hide('fade');
			}
		}, this));
	}
});