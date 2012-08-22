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
ARSnova.views.about.InfoPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.lastActivePanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.INFO,
			items: [this.backButton]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			xtype	: 'panel',
			cls		: null,
			html	: "<div class='arsnova-logo' style=\"background: url('resources/images/arsnova.png') no-repeat center; height:55px\"></div>",
			style	: { marginTop: '10px'},
		}, {
			xtype: 'form',
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype	: 'button',
				ui		: 'normal',
				cls		: 'forwardListButton',
			},
			
			items: [{
				text	: Messages.ABOUT_ARSNOVA,
				handler	: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.aboutPanel = new ARSnova.views.about.AboutPanel();
					me.setActiveItem(me.aboutPanel, 'slide');
				},
			}, {
				text	: Messages.HELPDESK,
				handler	: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.helpdeskPanel = new ARSnova.views.about.HelpDeskPanel();
					me.setActiveItem(me.helpdeskPanel, 'slide');
				},
			}, {
				text	: Messages.STATISTIC,
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.statisticPanel = new ARSnova.views.about.StatisticPanel();
					me.setActiveItem(me.statisticPanel, 'slide');
				},
			}, {
				text: Messages.PRAISE_AND_CRITICISM,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("https://scm.thm.de/redmine/projects/arsnova/boards/6");
						}
					}
				}
			}, {
				text: Messages.DEVELOPMENT,
				handler: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.developmentPanel = new ARSnova.views.about.DevelopmentPanel();
					me.setActiveItem(me.developmentPanel, 'slide');
				},
			}, {
				text: Messages.CREDITS,
				handler: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.creditsPanel = new ARSnova.views.about.CreditsPanel();
					me.setActiveItem(me.creditsPanel, 'slide');
				},
			}, {
				text: Messages.IMPRESSUM,
				handler: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.impressumPanel = new ARSnova.views.about.ImpressumPanel();
					me.setActiveItem(me.impressumPanel, 'slide');
				},
			}]
		}, {
			style: {
				textAlign: 'center',
				marginTop: '10px',
			},
			html: '<a href="http://www.ohloh.net/p/arsnova?ref=WidgetProjectPartnerBadge" target="_blank"><img alt="Ohloh project report for ARSnova" border="0" height="33" src="http://www.ohloh.net/p/arsnova/widgets/project_partner_badge.gif" width="193" /></a>'
		}];
		
		ARSnova.views.about.InfoPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', function(){
			if(ARSnova.mainTabPanel.tabPanel.homeTabPanel.tab.isVisible() == true)
				this.backButton.hide();
			else
				this.backButton.show();
		});
		
		ARSnova.views.about.InfoPanel.superclass.initComponent.call(this);
	},
});
