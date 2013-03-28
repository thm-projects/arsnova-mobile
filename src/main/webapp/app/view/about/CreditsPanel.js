/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/tabPanel.js
 - Beschreibung: Panel "Über ARSnova".
 - Version:      1.1, 22/08/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 				 Daniel Knapp <daniel.knapp@mni.thm.de>
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
Ext.define('ARSnova.view.about.CreditsPanel', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 	'vertical',
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null,
	},
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.infoPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.CREDITS,
			items: [
		        this.backButton
			]
		});
		
		this.infoPanel = new Ext.form.FormPanel({
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton'
			},
		
			items: [{
				text	: Messages.SPONSORS,
				handler	: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.sponsorsPanel = new ARSnova.views.about.SponsorsPanel();
					me.setActiveItem(me.sponsorsPanel, 'slide');
				}
			}, {
				text	: Messages.OPENSOURCEPROJECTS,
				handler	: function(){
					var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
					me.openSourceProjectsPanel = new ARSnova.views.about.OpenSourceProjectsPanel();
					me.setActiveItem(me.openSourceProjectsPanel, 'slide');
				}
			}]
		});
		
		this.dockedItems = [this.toolbar];
		this.items 		 = [this.infoPanel];
		
		ARSnova.view.about.CreditsPanel.superclass.constructor.call(this);
	},
	
	initialize: function(){
		ARSnova.view.about.CreditsPanel.superclass.initialize.call(this);
	}
});
