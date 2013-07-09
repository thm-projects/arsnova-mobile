/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/infoPanel.js
 - Beschreibung: Panel "Info".
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
Ext.define('ARSnova.view.about.InfoPanel', {
	extend: 'Ext.Container',
	
	config: {
		fullscreen: true,
		title	: Messages.INFO,
		scrollable: {
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
			text	: Messages.BACK,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.lastActivePanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.INFO,
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
			//style	: { margin: '20px'},
			
			defaults: {
				xtype	: 'button',
				ui		: 'normal',
				cls		: 'forwardListButton'
			},
			
			items: [{
				text	: Messages.ARSNOVA_FAQ,
				handler	: function(b) {
					window.open("http://blog.mni.thm.de/arsnova/faq-2/");
				}
			}, {
				text	: Messages.STATISTIC,
				handler	: function() {
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.statisticPanel = Ext.create('ARSnova.view.about.StatisticPanel');
					me.animateActiveItem(me.statisticPanel, 'slide');
				}
			}, {
				text	: Messages.OPINION,
				handler	: function(b) {
					window.open("https://arsnova.thm.de/#id/10940464");
				}
			}, {
				text: Messages.IMPRESSUM,
				handler	: function(b) {
					window.open("http://blog.mni.thm.de/arsnova/impressum/");
				}
			}]
		},
		{
			xtype	: 'panel',
			style	: { marginTop: '30px'},
			html	: "<div class='gravure'><a href='http://www.thm.de/' class='thmlink' target='_blank'>Powered by <span style='color:#699824; font-weight:bold;'>THM</span></a></div>",
			cls		: null		}]);
		
		this.on('activate', function(){
			this.backButton.show();
		});
	}
});
