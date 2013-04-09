/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/tabPanel.js
 - Beschreibung: Panel "Über ARSnova".
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
Ext.define('ARSnova.view.about.AboutPanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'AboutPanel',
		scroll: 	'vertical',
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.INFO,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.animateActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.ABOUT_ARSNOVA,
			docked: 'top',
			items: [this.backButton]
		});
		
		this.infoPanel = Ext.create('Ext.form.FormPanel', {
			cls  : 'standardForm topPadding',
			scrollable: null,
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton'
			},
		
			items: [
			{
				text	: Messages.WHAT_MEANS_ARS,
				handler	: function(){
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.arsPanel = Ext.create('ARSnova.view.about.ARSPanel');
					me.animateActiveItem(me.arsPanel, 'slide');
				}
			}, {
				text: Messages.PREZI_ABOUT_ARS,
				listeners: {
					click: {
						element: 'element',
						fn: function() { 
							window.open("http://prezi.com/bkfz1utyaiiw/arsnova/");
						}
					}
				}
			}, {
				text	: Messages.ARS_IS_SOCIAL,
				handler	: function() {
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.socialSoftwarePanel = Ext.create('ARSnova.view.about.SocialSoftwarePanel');
					me.animateActiveItem(me.socialSoftwarePanel, 'slide');
				}
			}, {
				text	: Messages.OPERATIONAL_AID,
				handler	: function() {
					var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
					me.helpMainPanel = Ext.create('ARSnova.view.about.HelpMainPanel');
					me.animateActiveItem(me.helpMainPanel, 'slide');
				}
			}/*, {
				text	: Messages.ARS_IN_LECTURE,
				handler	: function() {
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.ARSinLessonPanel = new ARSnova.view.about.ARSinLessonPanel();
					me.animateActiveItem(me.ARSinLessonPanel, 'slide');
				},
			}*/]
		});	

		this.add([this.toolbar, this.infoPanel]);
	}
});