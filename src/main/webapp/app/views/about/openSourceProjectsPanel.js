/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/tabPanel.js
 - Beschreibung: Panel "Über ARSnova".
 - Version:      1.0, 24/08/12
 - Autor(en):    Daniel Knapp <daniel.knapp@mni.thm.de>
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
Ext.namespace('ARSnova.views.about');

ARSnova.views.about.OpenSourceProjectsPanel = Ext.extend(Ext.Panel, {
	scroll: 	'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.creditsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this,
				})
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.OPENSOURCEPROJECTS_SHORT,
			items: [
		        this.backButton,
			]
		});
		
		this.infoPanel = new Ext.form.FormPanel({
			cls  : 'standardForm topPadding',
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton',
			},
		
			items: [{
				text	: Messages.SENCHA_TOUCH,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://www.sencha.com");
						}
					}
				},
			}, {
				text	: Messages.COUCHDB,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://couchdb.apache.org");
						}
					}
				},
			}, {
				text	: Messages.NGINX,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://nginx.org");
						}
					}
				},
			}, {
				text	: Messages.XEN,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://xen.org");
						}
					}
				},
			}, {
				text	: Messages.CAS,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://www.jasig.org/cas/");
						}
					}
				},
			}, {
				text	: Messages.DEBIAN,
				listeners: {
					click: {
						element: 'el',
						fn: function() { 
							window.open("http://www.debian.org");
						}
					}
				},
			}],
		});
		
		this.dockedItems = [this.toolbar];
		this.items 		 = [this.infoPanel];
		
		ARSnova.views.about.OpenSourceProjectsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		ARSnova.views.about.OpenSourceProjectsPanel.superclass.initComponent.call(this);
	}
});
