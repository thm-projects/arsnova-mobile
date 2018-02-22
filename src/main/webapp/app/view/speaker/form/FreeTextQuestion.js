/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.speaker.form.FreeTextQuestion', {
	extend: 'Ext.Container',

	requires: [
		'Ext.field.Toggle',
		'Ext.form.FieldSet',
		'ARSnova.view.speaker.form.TextChecker'
	],
	config: {
		scrollable: null,
		cls: 'centerFormTitle'
	},

	imageQuestion: false,
	textAnswerEnabled: true,
	textChecker: null,

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.textChecker = Ext.create('ARSnova.view.speaker.form.TextChecker', {
			id: 'textChecker'
		});
		this.add(this.textChecker);

		if (ARSnova.app.globalConfig.features.imageAnswer) {
			this.expectAnswerText = Ext.create('ARSnova.view.MatrixButton', {
				cls: 'actionButton',
				buttonConfig: 'togglefield',
				style: 'margin-top:-20px',
				toggleConfig: {
					scope: this,
					listeners: {
						scope: this,
						change: function (toggle, newValue, oldValue, eOpts) {
							me.textAnswerEnabled = newValue !== 0;
						}
					},
					value: true
				}
			});

			this.textAnswerFieldSet = Ext.create('Ext.form.FieldSet', {
				title: Messages.EXPECT_ANSWER_TEXT,
				style: 'margin-top:-20px; margin-bottom: 0px;',
				hidden: true,
				items: [this.expectAnswerText]
			});

			this.imgUploadBtn = Ext.create('ARSnova.view.MatrixButton', {
				cls: 'actionButton',
				buttonConfig: 'togglefield',
				style: 'margin-top:-20px',
				toggleConfig: {
					scope: this,
					label: false,
					value: 0,
					listeners: {
						scope: this,
						change: function (toggle, newValue, oldValue, eOpts) {
							me.imageQuestion = newValue !== 0;
							if (me.textAnswerFieldSet.isHidden()) {
								me.textAnswerFieldSet.show();
							} else {
								me.textAnswerFieldSet.hide();
								me.expectAnswerText.setToggleFieldValue(true);
							}
						}
					}
				}
			});

			var answerFieldset = Ext.create('Ext.form.FieldSet', {
				//displayed on-top of the button
				title: Messages.IMAGE_QUESTION_LBL,
				style: 'margin-top: 40px;',
				items: [this.imgUploadBtn]
			});

			this.add([
				answerFieldset,
				this.textAnswerFieldSet
			]);
		}
	},

	resetFields: function () {
		this.textAnswerFieldSet.hide();
		this.imgUploadBtn.setToggleFieldValue(false);
		this.expectAnswerText.setToggleFieldValue(true);
	},

	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion;
		result.textAnswerEnabled = this.textAnswerEnabled;
		Ext.apply(result, this.textChecker.getValues());
		return result;
	}
});
