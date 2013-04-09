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
		title	: Messages.INFO,
		scroll: 'vertical'
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
			items: [this.backButton]
		});
		
		this.add([this.toolbar, {
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo' style=\"background: url('resources/images/arsnova.png') no-repeat center; height:55px\"></div>",
			style	: { marginTop: '10px'}
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
				text	: Messages.ABOUT_ARSNOVA,
				handler	: function(){
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.aboutPanel = Ext.create('ARSnova.view.about.AboutPanel');
					me.animateActiveItem(me.aboutPanel, 'slide');
				}
			}, {
				text	: Messages.HELPDESK,
				handler	: function(){
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.helpdeskPanel = Ext.create('ARSnova.view.about.HelpDeskPanel');
					me.animateActiveItem(me.helpdeskPanel, 'slide');
				}
			}, {
				text	: Messages.STATISTIC,
				handler	: function() {
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.statisticPanel = Ext.create('ARSnova.view.about.StatisticPanel');
					me.animateActiveItem(me.statisticPanel, 'slide');
				}
			}, {
				text: Messages.DEVELOPMENT,
				listeners: {
					click: {
						element: 'element',
						fn: function() { 
							window.open("http://www.ohloh.net/p/arsnova");
						}
					}
				}
			}, {
				text: Messages.CREDITS,
				handler: function(){
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.creditsPanel = Ext.create('ARSnova.view.about.CreditsPanel');
					me.animateActiveItem(me.creditsPanel, 'slide');
				}
			}, {
				text: Messages.IMPRESSUM,
				handler: function(){
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.impressumPanel = Ext.create('ARSnova.view.about.ImpressumPanel');
					me.animateActiveItem(me.impressumPanel, 'slide');
				}
			}]
		},
		{
			style: {
				textAlign: 'center',
				marginTop: '10px'
			},
			html: '<a href="http://www.ohloh.net/p/arsnova?ref=WidgetProjectPartnerBadge" target="_blank"><img alt="Ohloh project report for ARSnova" border="0" height="33" src="http://www.ohloh.net/p/arsnova/widgets/project_partner_badge.gif" width="193" /></a>'
		}]);
		
		this.on('activate', function(){
			this.backButton.show();
		});
	}
});
