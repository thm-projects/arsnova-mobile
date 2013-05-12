/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/RolePanel.js
 - Beschreibung: Panel zum Auswählen einer Rolle.
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
Ext.define('ARSnova.view.RolePanel', {
	extend: 'Ext.Container',
	
	config: {
		fullscreen: true,
		scroll: 'vertical',
		
		title: 'RolePanel',
		
		defaults: {
			xtype	: 'button',
			handler	: function(b) {
				ARSnova.app.getController('Auth').roleSelect({
					mode: b.config.value
				});
			}
		}
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		this.add([{
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo' style=\"background: url('resources/images/arsnova.png') no-repeat center; height:55px\"></div>",
			style	: { marginTop: '35px'}
		}, {
			xtype	: 'panel',
			cls		: 'gravure',
			html	: Messages.CHOOSE_ROLE
		}, {
			text	: Messages.STUDENT,
			cls		: 'login-button role-label-student',
			value	: ARSnova.app.USER_ROLE_STUDENT
		}, {
			text	: Messages.SPEAKER,
			cls		: 'login-button role-label-speaker',
			value	: ARSnova.app.USER_ROLE_SPEAKER
		}, {
			/* TODO: i18n */
			text	: "Was ist ARSnova?",
			ui		: 'small',
			style	: { marginLeft: '30%', marginRight: "30%" },
			listeners: {
				click: {
					element: 'element',
					fn: function() { 
						window.open("http://blog.mni.thm.de/arsnova/", "_blank");
					}
				}
			}
		}, {
			xtype	: 'panel',
			style	: { marginTop: '30px'},
			html	: "<div class='thm-logo' style=\"background: url('resources/images/thm.png') no-repeat center; height:67px\"></div>",
			cls		: null
		}]);
	}
});