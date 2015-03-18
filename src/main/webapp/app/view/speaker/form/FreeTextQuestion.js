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
Ext.define('ARSnova.view.speaker.form.FreeTextQuestion', {
	extend: 'Ext.Container',

	requires: [
		'Ext.field.Toggle',
		'Ext.form.FieldSet'
	],
	config: {
				scrollable: null,
				cls:'centerFormTitle'
	},

	imageQuestion: false,
	textAnswerEnabled: true,

	initialize: function () {
		this.callParent(arguments);
		var me = this;

		this.expectAnswerText = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'actionButton',
			buttonConfig: 'togglefield',
			style:'margin-top:-20px',
			toggleConfig: {
				scope: this,
				value: true,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						me.textAnswerEnabled = newValue == 0 ? true : false;

					}
				}
			}
		});

		this.textAnswerFieldSet = Ext.create('Ext.form.FieldSet', {
			title:Messages.EXPECT_ANSWER_TEXT,
			style:'margin-top:45px;',
			hidden: true,
			items:[this.expectAnswerText]
		});

		this.imgUploadBtn = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'actionButton',
			buttonConfig: 'togglefield',
			style:'margin-top:-20px',
			toggleConfig: {
				scope: this,
				label: false,
				value: 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						me.imageQuestion = newValue == 0 ? false : true;
						if(me.textAnswerFieldSet.isHidden()) {
							me.textAnswerFieldSet.show();
						} else {
							me.textAnswerFieldSet.hide();
						}
					}
				}
			}
		});

		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			//displayed on-top of the button
			title:Messages.IMAGE_QUESTION_LBL,
			style:'margin-top:45px;',
			items:[this.imgUploadBtn]
		});

		this.add([answerFieldset, this.textAnswerFieldSet]);
    },

	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion;
		result.textAnswerEnabled = this.textAnswerEnabled;
		return result;
	}
});
