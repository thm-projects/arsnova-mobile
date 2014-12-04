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
Ext.define('ARSnova.view.FreetextDetailAnswer', {
	extend: 'Ext.Panel',

	config: {
		title: 'FreetextDetailAnswer',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	constructor: function (args) {
		this.callParent(arguments);

		this.answer = args.answer;
		this.sTP = args.sTP;

		var self = this;

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.FREETEXT_DETAIL_HEADER,
			ui: 'light',
			items: [
				Ext.create('Ext.Button', {
					text: Messages.BACK,
					ui: 'back',
					handler: function () {
						self.sTP.items.items.pop(); // Remove this panel from view stack
						self.sTP.animateActiveItem(
							self.sTP.items.items[self.sTP.items.items.length-1], // Switch back to top of view stack
							{
								type: 'slide',
								direction: 'right',
								duration: 700,
								scope: this,
								listeners: {
									animationend: function () {
										self.answer.deselectItem();
										self.hide();
									},
									scope: this
								}
							}
						);
					}
				})
			]
		});

	// Setup question title and text to disply in the same field; markdown handles HTML encoding
	var questionString = this.answer.answerSubject
		+ '\n\n' // inserts one blank line between subject and text
		+ this.answer.answerText;

	// Create standard panel with framework support
	var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
	questionPanel.setContent(questionString, true, true);

		this.add([this.toolbar, {
			xtype: 'formpanel',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [
					{
						xtype: 'textfield',
						label: Messages.QUESTION_DATE,
						value: this.answer.formattedTime + " Uhr am " + this.answer.groupDate,
						disabledCls: 'disableDefault',
						inputCls: 'thm-grey',
						disabled: true
					},
					questionPanel
				]
			}]
		}, {
			xtype: 'button',
			ui: 'decline',
			cls: 'centerButton',
			text: Messages.DELETE,
			scope: this,
			hidden: !this.answer.deletable,
			handler: function () {
				ARSnova.app.questionModel.deleteAnswer(self.answer.questionId, self.answer._id, {
					success: function () {
						self.sTP.items.items.pop(); // Remove this panel from view stack
						self.sTP.animateActiveItem(
							self.sTP.items.items[self.sTP.items.items.length-1], // Switch back to top of view stack
							{
								type: 'slide',
								direction: 'right',
								duration: 700,
								scope: this,
								listeners: {
									animationend: function () {
										self.destroy();
									}
								}
							}
						);
					},
					failure: function () {
						console.log('server-side error: deletion of freetext answer failed');
					}
				});
			}
		}]);
	}
});
