/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/DiagnosisPanel.js
 - Beschreibung: Panel "Diagnosis".
 - Version:      1.0, 21/10/13
 - Autor(en):    Andreas Gärtner <andreas.gaertner@mni.thm.de>
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
Ext.define('ARSnova.view.about.DiagnosisPanel', {
	extend: 'Ext.Container',
	
	config: {
		fullscreen	: true,
		title		: Messages.DIAGNOSIS,
		scrollable	: {
			direction: 'vertical',
			directionLock: true
		}
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.INFO,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				var infoTabPanel = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				infoTabPanel.animateActiveItem(infoTabPanel.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.DIAGNOSIS,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});
		
		this.add([this.toolbar, {
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo'></div>",
			style	: { marginTop: '35px', marginBottom: '35px' }
		}, 
		{
			xtype: 'formpanel',
			cls  : 'standardForm topPadding',
			scrollable : null,
			
			defaults: {
				xtype	: 'button',
				ui		: 'normal',
				cls		: 'forwardListButton'
			},
			
			items: [{
				text	: Messages.BROWSER_INFO,
				handler	: function(b) {
					var browserInfo = new String(
						"<b>Name:</b> "   + Ext.browser.name 		+ "<br>" +
						"<b>Engine:</b> " + Ext.browser.engineName 	+ 
						" " 			  + Ext.browser.engineVersion.version + "<br>" +
						"<b>UA:</b> " 	  + Ext.browser.userAgent 	+ "<br>"
					);
					Ext.Msg.alert('Browser', browserInfo, Ext.emptyFn);
				}
			}, {
				text	: Messages.ARSNOVA_RELOAD,
				handler	: function(b) {
					Ext.Msg.confirm(Messages.ARSNOVA_RELOAD, Messages.RELOAD_SURE, function(b) {
						if(b == "yes") {
					    	if(ARSnova.app.checkSessionLogin()) {
					    		ARSnova.app.getController('Sessions').logout();
					    	}
							ARSnova.app.getController('Auth').logout();
							window.location.reload(true);
						}
					});
				}
			}]
		},
		{
			xtype	: 'panel',
			style	: { marginTop: '30px'},
			html	: "<div class='gravure'><a href='http://www.thm.de/' class='thmlink' target='_blank'>A <span style='color:#699824; font-weight:bold;'>THM</span> Product</a></div>",
			cls		: null		
		}]);
		
		this.on('activate', function(){
			this.backButton.show();
		});
	}
});
