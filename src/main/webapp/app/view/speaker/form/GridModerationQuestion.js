/*
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('ARSnova.view.speaker.form.GridModerationQuestion', {
	extend: 'Ext.Carousel',
    
	grid: null,
	
	config: {
		fullscreen: true,
		title: Messages.TEMPLATE,
		layout: {
			type:	'hbox',
			align:	'center'
		},
		defaults:	{flex: 1}
	},
	
	initialize: function () {
		this.callParent(arguments);
		
		this.gridModeration = Ext.create('ARSnova.view.components.GridModerationContainer',{
			itemId: 'gridModearionContainer'
		});
		
		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			text: Messages.BACK,
			scope: this,
			handler: function () {
				var animation = {
					type: 'slide',
					direction: 'right',
					duration: 700
				};
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.newQuestionPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});
		
		this.saveButtonToolbar = Ext.create('Ext.Button', {
			text: Messages.SAVE,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			//TODO save handler-function

			scope: this
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.TEMPLATE,
			docked: 'top',
			ui: 'light',
			items: [
			     this.backButton, 
				{xtype:'spacer'},
			     this.saveButtonToolbar
			]
		});
				
		this.imageArea = Ext.create('Ext.Panel', {
			itemId: 'imageArea',
			layout:{
				type: 'hbox',
				align: 'center',
				pack: 'center'
			},
			items: [
				this.gridModeration,
				{
                    html : 'Item 1',
                    style: 'background-color: #5E99CC'
                }
			],
		});
		
		this.templatePanel = Ext.create('Ext.Panel',{
			 fullscreen: true,
			 layout: 'hbox',
			 items:[ 
			 		this.gridModeration
			    ]
		});
		
		this.add([this.toolbar]);
		this.on('activate', this.getTemplates, this, null, 'before');
		this.on('activate', this.onActivate);
		
	},
		
	onActivate: function () {
		//this.getAllSkillQuestions();
	},
	
	/**
	 * Loads the templates to Carousel. 
	 */
	addTemplate : function(templates) {		
		for(var i = 0; i <= templates.length; i++){
			var template = templates.pop();
			this.add(template);
		}
		
	},
	
	/**
	 * Loads the template JSON file and starts the configuration process on success.
	 * 
	 * @param successCallback(templates) The function which gets called after the templates were
	 * loaded successfully.
	 */
	getTemplates : function() {
		var me = this;
		Ext.Ajax.request({
			url: 'resources/gridTemplates/templates.json',
			success: function(response, opts) {
				var config = JSON.parse(response.responseText);
				var templates = new Array();

				// extract all the templates
				if (typeof(config) != "undefined") {
					config.forEach(function(entry) {
						var template = Ext.create('ARSnova.view.components.GridModerationContainer');
						template.setConfig(entry);
						//console.log(template.getDescription);
						templates.push(template);
					});
				}
				// add templates to Carousel
				me.addTemplate(templates);
			},
			failure: function(response, opts) {
				// iOS in phonegap returns response.status=0 on success
				if(response.status == 0 && response.responseText != ''){
					console.log(response.responseText);
				} else {
					console.error('Could not find template.json');
				}
			}
		});
	}
});