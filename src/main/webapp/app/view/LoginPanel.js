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
	
	requires: [ 'Ext.MessageBox',
	            'ARSnova.view.MatrixButton'],
	
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
		var me = this;
		
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

		me.add([{
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
			}]},
			me.arsLogo
		]);

		var config = ARSnova.app.globalConfig;
		ARSnova.app.getController('Auth').services.then(function(services) {
			var i, buttonPanels = [], button, items = [], service, imagePath = "", imageSrc;
			if (config.customizationPath) {
				imagePath = config.customizationPath + "/images/";
			}
			for (i = 0; i < services.length; i++) {
				service = services[i];
				imageSrc = service.image ? imagePath + service.image : "btn_" + service.id;
				button = {
					xtype : 'matrixbutton',
					text: "guest" === service.id ? Messages.GUEST : service.name,
					value: service,
					image: imageSrc,
					handler: function(b) {
						var service = b.config.value;
						if ("guest" === service.id && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
							Ext.Msg.confirm(Messages.GUEST_LOGIN, Messages.CONFIRM_GUEST_SPEAKER, function(answer) {
								if ('yes' === answer) {
									ARSnova.app.getController('Auth').login({
										service: service
									});
								}
							});
						} else {
							ARSnova.app.getController('Auth').login({
								service: service
							});
						}
					}
				};
				if (i % 2 === 1) {
					button.style = "margin-left: 20px";
				}
				items.push(button);
				if (i % 2 === 1 || i === services.length - 1) {
					buttonPanels.push(
						Ext.create('Ext.Panel', {
							xtype: 'container',
							layout: {
								type: 'hbox',
								pack: 'center'
							},
							items: items
						})
					);
					items = [];
				}
			}

			buttonPanels.forEach(function (buttonPanel) {
				me.add(buttonPanel);
			});
		});
	}
});