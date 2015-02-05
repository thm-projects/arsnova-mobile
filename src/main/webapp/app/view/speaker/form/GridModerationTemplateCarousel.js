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

Ext.define('ARSnova.view.speaker.form.GridModerationTemplateCarousel', {
	extend: 'Ext.Carousel',

	allTemplates: null,

	config: {
		fullscreen: true,
		title: Messages.TEMPLATE,
		direction: 'horizontal',

		saveHandlerScope: null,
		templateAdoptionHandler: Ext.emptyFn
	},

	initialize: function () {
		var me = this;

		this.callParent(arguments);
		this.allTemplates = [];

		this.gridModeration = Ext.create('ARSnova.view.components.GridModerationContainer', {
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

				// pre-select image question
				var newQuestionPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
				newQuestionPanel.activateButtonWithText(Messages.GRID);
			}
		});

		this.saveButtonToolbar = Ext.create('Ext.Button', {
			text: Messages.APPLY,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 99px',

			scope: this,
			handler: function() {
				Ext.bind(this.getTemplateAdoptionHandler(), this.getSaveHandlerScope())(this.allTemplates[me.getActiveIndex()]);
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.TEMPLATE,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype: 'spacer'},
				this.saveButtonToolbar
			]
		});

		this.add([this.toolbar]);

		this.on('activate', this.getTemplates, this, null, 'before');
	},

	/**
	 * Loads the templates to Carousel.
	 */
	setTemplates: function(templates) {
		var me = this;

		templates.forEach(function(templateContainer) {
			templateContainer.setEditable(false);

			// panel for question content
			var contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype: 'mathJaxMarkDownPanel',
				id: 'questionContent',
				style: 'color: black;'
			});
			contentPanel.setContent(templateContainer.getDescription(), true, true);

			// panel for question subject
			var titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype: 'mathJaxMarkDownPanel',
				id: 'questionTitle',
				style: 'background-color: transparent; padding: 0;font-weight: bold; font-size: 1.4em;'
			});
			titlePanel.setContent(templateContainer.getName(), false, true);

			me.singleTemplatePanel = Ext.create('Ext.Panel', {
				scrollable: {
					direction: 'vertical',
					directionLock: true
				},
				layout:	{
					type: 'vbox',
					pack: 'center',
					align: 'center'
				},
				items: [titlePanel, {
					xtype: 'formpanel',
					scrollable: null,
					items: [
						templateContainer,
						contentPanel,
						{
							ui: 'action',
							xtype:	'button',
							text:	Messages.DOWNLOAD,
							handler: function() {
								var index = me.getActiveIndex();
								var src = me.allTemplates[index].getImageFile().src;
								window.open(src);
							}
						}, {
							xtype: 'spacer',
							height: 25,
							docked: 'bottom'
						}
					]
				}]
			});
			me.BtnSpacer = Ext.create('Ext.Spacer');

			me.add([me.singleTemplatePanel]);
			me.allTemplates.push(templateContainer);
			me.setActiveItem(0);
		});
	},

	/**
	 * Loads the template JSON file and starts the configuration process on success.
	 *
	 * @param successCallback(templates) The function which gets called after the templates were
	 * loaded successfully.
	 */
	getTemplates: function() {
		var me = this;
		this.removeAll();
		Ext.Ajax.request({
			url: 'resources/gridTemplates/templates.json',
			success: function(response, opts) {
				var config = JSON.parse(response.responseText);
				var templates = [];

				// extract all the templates
				if (typeof(config) !== "undefined") {
					config.forEach(function(entry) {
						var template = Ext.create('ARSnova.view.components.GridModerationContainer');
						switch (lang) {
							case 'en':case 'en-en':case 'en-us':case 'en-gb':
								entry.name = entry.name.en;
								entry.description = entry.description.en;
								break;
							default:
								entry.name = entry.name.de;
								entry.description = entry.description.de;
						}
						template.setConfig(entry);
						templates.push(template);
					});
				}
				// add templates to Carousel
				me.setTemplates(templates);
			},
			failure: function(response, opts) {
				// iOS in phonegap returns response.status=0 on success
				if (response.status === 0 && response.responseText !== '') {
					console.log(response.responseText);
				} else {
					console.error('Could not find template.json');
				}
			}
		});
	}
});
