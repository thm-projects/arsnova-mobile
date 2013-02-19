/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/loginPanel.js
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
ARSnova.views.LoginPanel = Ext.extend(Ext.Panel, {
	fullscreen: true,
	scroll: 'vertical',
	
	layoutOnOrientationChange: false,
    monitorOrientation: false,
	
	constructor: function(){
		this.defaults = {
			xtype	: 'button',
			handler	: function(b) {
				Ext.dispatch({
					controller	: 'auth',
					action		: 'login',
					mode		: b.value
				});
			}
		};
		
		var threeButtons = [];
		if (window.innerWidth > 1000) {
			threeButtons = [{
				text	: 'Google',
				cls		: 'login-buttons google-wide',
				value	: ARSnova.LOGIN_GOOGLE
			}, {
				text	: 'THM',
				cls 	: 'login-buttons thm-login-wide',
				value	: ARSnova.LOGIN_THM
			}, {
				xtype: 'panel',
				style: {
					clear: 'both'
				}
			}];
		} else {
			threeButtons = [{
				cls		: 'login-buttons google',
				value	: ARSnova.LOGIN_GOOGLE
			}, {
				text	: 'THM',
				cls		: 'login-buttons thm-login',
				value	: ARSnova.LOGIN_THM
			}, {
				xtype: 'panel',
				style: {
					clear: 'both'
				}
			}];
		}
		
		this.noGuestSpeaker = new Ext.Panel({
			cls		: 'gravure',
			style	: { marginTop: '0px'},
			html	: Messages.NO_GUEST_SPEAKER
		});
		
		this.guestLoginButton = new Ext.Button({
			text	: Messages.GUEST,
			style	: { marginTop: '10px'},
			cls		: 'login-button login-label-guest',
			value	: ARSnova.LOGIN_GUEST
		});
		
		this.items = [{
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
					Ext.dispatch({
						controller	: 'auth',
						action		: 'login',
						mode		: b.value
					});
				}
			},
			items: threeButtons
		}, {
			xtype: 'button',
			text: Messages.CHANGE_ROLE, 
			cls: 'backToRole',
			handler: function(){
				ARSnova.userRole = "";
				ARSnova.setWindowTitle();
				
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.rolePanel, {
					type: 'slide',
					direction: 'right',
					duration: 500
				});
			}
		},{
			xtype	: 'panel',
			cls		: null,
			html	: ''
		}, this.noGuestSpeaker];
		
		if(ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER && !window.location.href.match(/developer\.html#?$/)) {
			this.guestLoginButton.hide();
			this.noGuestSpeaker.show();
		} else {
			this.guestLoginButton.show();
			this.noGuestSpeaker.hide();
		}
		
		ARSnova.views.LoginPanel.superclass.constructor.call(this);
	}
});