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
		title: 'HelpMainPanel',
		scroll: 	'vertical',
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null
	},

	constructor: function(arguments) {
		this.callParent(arguments);
		
		var standalone = false;
		
		/* check arguments for standalone */
		if(typeof arguments !== 'undefined') {
			if(typeof arguments.standalone !== 'undefined') {
				standalone = arguments.standalone;
			}			
		}
		
		var showVideo = function(videoid) {
			if (standalone) {
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var videoPanel = Ext.create('ARSnova.view.about.HelpVideoPanel', { 
					videoid : videoid, 
					standalone : standalone
				});
				tabPanel.on('activeitemchange', function() { videoPanel.tab.hide(); });
				return tabPanel.setActiveItem(videoPanel, 'slide');
			}
			var me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
			me.helpVideoPanel = Ext.create('ARSnova.view.about.HelpVideoPanel', { videoid : videoid });
			me.setActiveItem(me.helpVideoPanel, 'slide');
		};
		
		this.backButton = Ext.create('Ext.Button', {
			text	: standalone? Messages.BACK : Messages.ABOUT,
			ui		: 'back',
			handler	: function() {
				if (standalone) {
					// our usual parent (infoTabPanel) is not active, go to rolePanel instead
					return ARSnova.app.mainTabPanel.tabPanel.setActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
						type: 'slide',
						direction: 'right',
						duration: 500
					});
				}
				
				me = ARSnova.app.mainTabPanel.tabPanel.infoTabPanel;
				
				me.setActiveItem(me.aboutPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
					scope		: this
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.HELP,
			items: [this.backButton]
		});
		
		this.helpPanel = Ext.create('Ext.form.FormPanel', {
			cls  : 'standardForm',
			scrollable: null,
			
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
		
		this.add([this.toolbar, this.helpPanel]);
	}
});