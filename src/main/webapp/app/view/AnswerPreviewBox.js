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
	xtype: 'answerPreview',
	ui: 'normal',

	showPreview: function (answers, questionType) {
		this.answers = answers;

		// answer preview message box
		this.previewBox = Ext.create('Ext.MessageBox', {
			scrollable: true,
			layout: 'vbox',
			style: 'font-size: 110%; border-color: black; maxHeight: 600px; maxWidth: 1000px; width: 80%; height: 80%',
			scope: this
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE,
			docked: 'top',
			ui: 'light',
			/*items: [
			    {xtype: 'spacer'},
			    Ext.create('Ext.Button', {
			    	iconCls: 'icon-chart',
			    	style: 'padding: 0 0.4em',
			    	handler: this.statisticsButtonHandler,
			    	scope: this
			    })
			]*/
		});
		
		// question preview confirm button
		var confirmButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
			id: 'confirmButton',
			xtype: 'button',
			ui: 'confirm',
			//cls: 'previewButtonOK',
			style: 'width: 80%; maxWidth: 250px; margin-top: 10px;',
			scope: this,
			handler: function () {
				this.previewBox.destroy();
			}
		});
		
		var answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		answerStore.add(answers);
		answerStore.each(function (item) {
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
		
		if(questionType === 'flashcard') {
			this.answerList = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
		    	xtype: 'mathJaxMarkDownPanel',
		    	flex: 1,
		    	style: 'margin-left: 0px; margin-right: 0px;word-wrap: break-word;'
			});
			
			this.answerList.setContent(answers[0].text, true, true);
		}
		
		else {	
			this.answerList = Ext.create('Ext.List', {
				store: answerStore,
	
				cls: 'roundedBox',
				variableHeights: true,
				scrollable: {disabled: true},
	
				itemCls: 'arsnova-mathdown x-html',
				itemHeight: '32px',
				itemTpl: new Ext.XTemplate(
					"<tpl if='this.isFormattedStringEmpty(formattedText) === true'>",
						"&nbsp;",
					"<tpl else>",
						"{formattedText}",
					"</tpl>",
					{
						isFormattedStringEmpty: function(formattedString) {						
							if(formattedString === "") {
								return true;
							}
							
							return false;
						}
					}
				),
				listeners: {
					scope: this,
					
					/**
					 * The following events are used to get the computed height of
					 * all list items and finally to set this value to the list
					 * DataView. In order to ensure correct rendering it is also
					 * necessary to get the properties "padding-top" and
					 * "padding-bottom" and add them to the height of the list
					 * DataView.
					 */
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
		}
			
		// answer preview box content panel
		this.mainPanel = Ext.create('Ext.Container', {
			id: 'mainPanel',
			flex: '1',
			xtype: 'container',
			style: 'width: 100%; height: 100%; margin-bottom: 10px;',
			layout: 'vbox',
			fullscreen: false,
			items: [
				this.answerList,
				{
					id: 'buttonLayout',
					xtype: 'container',
					layout: {
						pack: 'center',
						type: 'hbox'
					},
					items: [confirmButton]
				}
			]
		});
		this.mainPanel.setStyleHtmlContent(true);
		
		this.previewBox.add(this.toolbar);
		this.previewBox.add(this.mainPanel);
		this.previewBox.show();
	},
	
	statisticsButtonHandler: function () {
		var questionObj = {};
		questionObj.possibleAnswers = this.answers;
		
		this.questionStatisticChart = Ext.create('ARSnova.view.AnswerPreviewStatisticChart', {
			layout: 'fit',
			answerObj: questionObj
		});
		
		this.previewBox.remove(this.toolbar);
		this.previewBox.remove(this.mainPanel);
		this.previewBox.add(this.questionStatisticChart);
	}
});
