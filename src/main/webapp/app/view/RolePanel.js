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
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		
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
			xtype	: 'toolbar',
			docked	: 'top',
			ui		: 'light',
			title	: Messages.TITLE_ROLE,
			cls		: null
		}, {
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo'></div>",
			style	: { marginTop: '35px', marginBottom: '35px' }
		}, {
			xtype	: 'container',
			layout	: {
				type: 'hbox',
				pack: 'center'
			},
			items	: [
				{
					xtype	: 'matrixbutton',
					text: Messages.STUDENT,
					value: ARSnova.app.USER_ROLE_STUDENT,
					image: "login_student",
					handler	: function(b) {
						ARSnova.app.getController('Auth').roleSelect({
							mode: b.config.value
						});
					}
				},
				{
					xtype	: 'matrixbutton',
					text: Messages.SPEAKER,
					value: ARSnova.app.USER_ROLE_SPEAKER,
					image: "ars_logo",
					handler	: function(b) {
						ARSnova.app.getController('Auth').roleSelect({
							mode: b.config.value
						});
					},
					style: "margin-left:20px"
				}
			]
		}, {
			xtype	: 'panel',
			style	: { marginTop: (Ext.os.is.Phone && Ext.os.is.iOS) ? '10px' : '30px' },
			html	: "<div class='gravure'><a href='http://www.thm.de/' class='thmlink' target='_blank'>A <span style='color:#699824; font-weight:bold;'>THM</span> Product</a></div>",
			cls		: null
		}]);
	}
});