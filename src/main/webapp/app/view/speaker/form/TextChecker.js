/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.form.TextChecker', {
	extend: 'Ext.form.FormPanel',

	config: {
		//Switch between free text/checkable answer
		fixedAnswer: false,
		//When checkable answer, switch strict mode on and off
		strictMode: true,

		scrollable: null,
		ignoreCaseSensitive: false,
		ignoreWhitespaces: false,
		ignorePunctuation: false,

		correctAnswer: "",

		ratingValue: 10,

		cls: 'newQuestionOptions centerFormTitle'
	},

	constructor: function () {
		var me = this;
		this.callParent(arguments);

		var strictOptions = Ext.create('Ext.form.FieldSet', {
			title: Messages.TEXT_CHECKER_STRICT_OPTIONS,
			hidden: !me.config.fixedAnswer,
			items: [{
				xtype: 'segmentedbutton',
				style: 'margin: auto',
				allowMultiple: true,

				//cls: 'yesnoOptions',
				defaults: {
					ui: 'action',
					style: 'width: 33.3%'
				},
				items: [{
					text: Messages.TEXT_CHECKER_IGNORE_CASE_SENSITIVE,
					pressed: this.getIgnoreCaseSensitive(),
					scope: this,
					handler: function () {
						this.setIgnoreCaseSensitive(!this.getIgnoreCaseSensitive());
					}
				}, {
					text: Messages.TEXT_CHECKER_IGNORE_WHITESPACE,
					pressed: this.getIgnoreWhitespaces(),
					scope: this,
					handler: function () {
						this.setIgnoreWhitespaces(!this.getIgnoreWhitespaces());
					}
				}, {
					text: Messages.TEXT_CHECKER_IGNORE_PUNCTUATION,
					pressed: this.getIgnorePunctuation(),
					scope: this,
					handler: function () {
						this.setIgnorePunctuation(!this.getIgnorePunctuation());
					}
				}]
			}]
		});


		this.freeAnswerButton = Ext.create('Ext.Button', {
			text: Messages.TEXT_CHECKER_FREETEXT,
			handler: function () {
				mainFormPanel.hide();
				ratingField.hide();
				strictOptions.hide();
				me.setFixedAnswer(false);
			},
			pressed: this.getFixedAnswer() === false
		});

		this.fixAnswerButton = Ext.create('Ext.Button', {
			text: Messages.TEXT_CHECKER_ADD_SOLUTION,
			handler: function () {
				mainFormPanel.show();
				ratingField.show();
				me.setFixedAnswer(true);
				strictOptions.show();
			},
			pressed: this.getFixedAnswer() === true
		});

		var answerTypeSegmentedButton = Ext.create('Ext.SegmentedButton', {
			style: 'margin: auto;',
			defaults: {
				ui: 'action',
				style: 'width: 50%'
			},
			items: [this.freeAnswerButton, this.fixAnswerButton]
		});
		var freefixField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.TEXT_CHECKER_TITLE,
			items: [answerTypeSegmentedButton]
		});

		this.rating = Ext.create("ARSnova.view.CustomSliderField", {
			minValue: 0,
			maxValue: 10,
			value: me.config.ratingValue,
			increment: 1
		});

		var ratingField = Ext.create('Ext.form.FieldSet', {
			xtype: 'fieldset',
			title: Messages.ANSWER_POINTS,
			items: [this.rating],
			hidden: !me.config.fixedAnswer
		});

		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.FORMAT_PLACEHOLDER,
			value: me.config.correctAnswer
		});

		var mainFormPanel = Ext.create('Ext.form.FormPanel', {
			cls: 'newTest',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				title: Messages.CORRECT_PLACEHOLDER,
				items: [this.textarea]
			}],
			hidden: !me.config.fixedAnswer
		});

		this.add([
			freefixField,
			mainFormPanel,
			strictOptions,
			ratingField
		]);
	},

	getValues: function () {
		var result = {};
		result.fixedAnswer = this.getFixedAnswer();
		result.strictMode = this.getStrictMode();
		result.correctAnswer = this.textarea.getValue();
		result.rating = this.rating.getSliderValue();
		result.ignoreCaseSensitive = this.getIgnoreCaseSensitive();
		result.ignoreWhitespaces = this.getIgnoreWhitespaces();
		result.ignorePunctuation = this.getIgnorePunctuation();
		return result;
	},

	getRating: function () {
		return this.rating.getSliderValue();
	}
});
