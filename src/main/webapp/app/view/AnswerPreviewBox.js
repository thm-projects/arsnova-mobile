/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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

Ext.define('ARSnova.view.AnswerPreviewBox', {
	extend: 'Ext.MessageBox',
	
	config: {
		scrollable: true,
		hideOnMaskTap: true,
		layout: 'vbox'
	},
	
	initialize: function(args) {
		this.callParent(args);
		
		this.setStyle({
			'font-size': '110%',
			'border-color': 'black',
			'maxHeight': '600px',
			'maxWidth': '1000px',
			'margin-bottom': '18px',
			'height': '79%',
			'width': '95%'
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE,
			docked: 'top',
			ui: 'light',
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				handler: this.hide,
				scope: this,
				style: {
					'height': '36px',
					'font-size': '0.9em',
					'padding': '0 0.4em'
				}
			}, {xtype: 'spacer'},
				this.statisticButton = Ext.create('Ext.Button', {
					iconCls: 'icon-chart',
					style: 'padding: 0 0.4em',
					handler: this.statisticsButtonHandler,
					scope: this
				})
			]
		});
		
		this.confirmButton = Ext.create('Ext.Container', {
			layout: {
				pack: 'center',
				type: 'hbox'
			},
			items: [
				Ext.create('Ext.Button', {
					text: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
					ui: 'confirm',
					style: 'width: 80%; maxWidth: 250px; margin-top: 10px;',
					scope: this,
					handler: function () {
						this.hide();
					}
				})
			]
		});
		
		// Create standard panel with framework support
		this.questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: "roundedBox allCapsHeader",
			style: 'min-height: 82px;'
		});
		
		// answer preview box content panel
		this.mainPanel = Ext.create('Ext.Container', {
			layout: 'vbox',
			style: 'margin-bottom: 10px;',
			styleHtmlContent: true,
			items: [this.questionPanel]
		});
		
		// remove padding around mainPanel
		this.mainPanel.bodyElement.dom.style.padding="0";
		
		this.on('hide', this.destroy);
		
		this.add([
			this.toolbar,
			this.mainPanel
		]);
	},
	
	showPreview: function (options) {
		this.answers = options.answers;
		this.setQuestionPanelContent(options.title, options.content);

		if (options.image) {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				itemId: 'previewGridImageContainer',
				gridIsHidden: true,
				editable: false
			});
			
			this.grid.setImage(options.image);
			this.mainPanel.add(this.grid);
		}
		
		if(options.questionType === 'grid') {
			if(options.image) {
				this.grid.setGridIsHidden(false);
				this.grid.setEditable(true);
			}
		}
		
		else if(options.questionType === 'flashcard') {
			this.answerList = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
		    	style: 'min-height: 100px; word-wrap: break-word;'
			});
			
			this.statisticButton.setHidden(true);
			this.answerList.setContent(this.answers[0].text, true, true);
			this.mainPanel.add([this.answerList]);
		}
		
		else {
			this.answerList = Ext.create('Ext.List', {
				store: Ext.create('Ext.data.Store', {
					model: 'ARSnova.model.Answer'
				}),
	
				cls: 'roundedBox',
				variableHeights: true,
				scrollable: {disabled: true},
	
				itemHeight: '32px',
				itemCls: 'arsnova-mathdown x-html answerListButton noPadding',
				itemTpl: new Ext.XTemplate(
					"<tpl if='this.isFormattedStringEmpty(formattedText) === true'>",
						"&nbsp;",
					"<tpl else>",
						"{formattedText}",
					"</tpl>",
					"<tpl if='correct === true'>",
						"&nbsp;<span class='listCorrectItem x-list-item-correct'>&#10003; </span>",
					"</tpl>",
					{
						isFormattedStringEmpty: function(formattedString) {						
							if(formattedString === "") { return true; }
							else { return false; }
						}
					}
				),
				listeners: {
					scope: this,
					painted: function (list, eOpts) {
						this.answerList.fireEvent("resizeList", list);
					},
					resizeList: function (list) {
						var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];
	
						this.answerList.setHeight(
							parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top")) +
							parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom"))
						);
					}
				}
			});
			
			this.answerList.getStore().add(this.answers);
			this.answerList.getStore().each(function (item) {
				if (ARSnova.app.globalConfig.parseAnswerOptionFormatting) {
					var md = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
					md.setContent(item.get('text'), true, true, function (html) {
						item.set('formattedText', html.getHtml());
						md.destroy();
					});
				} else {
					item.set('formattedText', Ext.util.Format.htmlEncode(item.get('text')));
				}
			});
			
			this.mainPanel.add([this.answerList]);
		}		

		this.mainPanel.add([
    		this.confirmButton
		]);

		this.show();
		
		// for IE: unblock input fields
		Ext.util.InputBlocker.unblockInputs();
	},
	
	setQuestionPanelContent: function(title, content) {
		// Setup question title and text to display in the same field; markdown handles HTML encoding
		var questionString = title.replace(/\./, "\\.")
			+ '\n\n' // inserts one blank line between subject and text
			+ content;
		
		this.questionPanel.setContent(questionString, true, true);
	},
	
	statisticsButtonHandler: function () {
		var questionObj = {};
		questionObj.possibleAnswers = this.answers;
		
		this.questionStatisticChart = Ext.create('ARSnova.view.AnswerPreviewStatisticChart', {
			question: questionObj,
			lastPanel: this
		});
			
		this.remove(this.toolbar, false);
		this.remove(this.mainPanel, false);
		this.setScrollable(false);
		
		this.add([	
	    	this.questionStatisticChart
		]);
	}
});
