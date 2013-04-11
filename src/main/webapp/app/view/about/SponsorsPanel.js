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
Ext.define('ARSnova.view.about.SponsorsPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		scrollable: true,
		title:		'SponsorsPanel',
		scroll: 	'vertical',
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler	: function() {
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;

				me.animateActiveItem(me.creditsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SPONSORS_SHORT,
			docked: 'top',
			items: [this.backButton]
		});
		
		this.infoPanel = Ext.create('Ext.form.FormPanel', {
			cls  : 'standardForm topPadding',
			style	: { margin: '20px'},
			scrollable: null,
			
			defaults: {
				xtype		: 'button',
				ui			: 'normal',
				cls			: 'forwardListButton'
			},
		
			items: [{
				text	: Messages.ELEARNINGHESSEN,
				listeners: {
					click: {
						element: 'element',
						fn: function() { 
							window.open("http://www.e-learning-hessen.de");
						}
					}
				}
			}, {
				text	: Messages.AGQLS,
				listeners: {
					click: {
						element: 'element',
						fn: function() { 
							window.open("http://www.thm.de/site/serviceeinrichtungen/arbeitsgemeinschaft-qualitaet-in-lehre-und-studium-der-th-mittelhessen-agqls.html");
						}
					}
				}
			}]
		});

		this.add([this.toolbar, this.infoPanel]);
	}
});
