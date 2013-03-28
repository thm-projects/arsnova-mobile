/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/about/helpMainPanel.js
 - Beschreibung: Übersichts-Panel zu "Hilfe".
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
Ext.define('ARSnova.view.about.HelpMainPanel', {
	extend: 'Ext.Panel',
	
	config: {
		scroll: 	'vertical',
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null
	},

	constructor: function(standalone) {
		var showVideo = function(videoid) {
			if (standalone) {
				var tabPanel = ARSnova.mainTabPanel.tabPanel;
				var videoPanel = new ARSnova.views.about.HelpVideoPanel(videoid);
				tabPanel.on('beforecardswitch', function() { videoPanel.tab.hide(); });
				return tabPanel.setActiveItem(videoPanel, 'slide');
			}
			var me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
			me.helpVideoPanel = new ARSnova.views.about.HelpVideoPanel(videoid);
			me.setActiveItem(me.helpVideoPanel, 'slide');
		};
		
		this.backButton = new Ext.Button({
			text	: standalone? Messages.BACK : Messages.ABOUT,
			ui		: 'back',
			handler	: function() {
				if (standalone) {
					// our usual parent (infoTabPanel) is not active, go to rolePanel instead
					return ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.rolePanel, {
						type: 'slide',
						direction: 'right',
						duration: 500
					});
				}
				
				me = ARSnova.mainTabPanel.tabPanel.infoTabPanel;
				
				me.layout.activeItem.on('deactivate', function(panel){
					panel.destroy();
	    		}, this, {single:true});
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.HELP,
			items: [
		        this.backButton
			]
		});
		
		this.helpPanel = new Ext.form.FormPanel({
			cls  : 'standardForm',
			
			defaults: {
				xtype	: 'button',
				ui		: 'normal',
				cls		: 'forwardListButton'
			},
		
			items: [{
				xtype: 'fieldset',
				title: Messages.STUDENTS_USE_CASES,
				ui: '',
				cls	 : 'standardFieldset',
				
				defaults: {
					xtype	: 'button',
					ui		: 'normal',
					cls		: 'forwardListButton'
				},
				
				items: [{
					text: Messages.LOG_IN_AND_GIVE_INSTANT_FEEDBACK,
					handler: function () {
						showVideo("V71tsCoESNo");
					}
				}, {
					text: Messages.ASK_A_QUESTION,
					handler: function () {
						showVideo("Ug96vMM19Bs");
					}
				}, {
					text: Messages.ANSWER_A_QUESTION,
					handler: function () {
						showVideo("kq3mhWeXSXU");
					}
				}]
			}, {
				xtype: 'fieldset',
				title: Messages.TEACHERS_USE_CASES,
				ui: '',
				cls: 'standardFieldset',
				
				defaults: {
					xtype	: 'button',
					ui		: 'normal',
					cls		: 'forwardListButton'
				},
				
				items: [{
					text: Messages.CREATE_A_SESSION,
					handler: function () {
						showVideo("_TYjesz_mb0");
					}
				}, {
					text: Messages.CREATE_A_QUESTION,
					handler: function () {
						showVideo("8IYjIXu5Crw");
					}
				}, {
					text: Messages.MANAGE_QUESTIONS_AND_ANSWERS,
					handler: function () {
						showVideo("hZkFspZI_w0");
					}
				}]
			}]
		});
		
		this.dockedItems = [this.toolbar];
		this.items 		 = [this.helpPanel];
		
		ARSnova.view.about.HelpMainPanel.superclass.constructor.call(this);
	}
});