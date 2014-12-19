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
Ext.define('ARSnova.view.speaker.form.SchoolQuestion', {
	extend: 'Ext.Container',

	config: {
		maxAnswers: 6,
		wording: [
			Messages.SCHOOL_A,
			Messages.SCHOOL_B,
			Messages.SCHOOL_C,
			Messages.SCHOOL_D,
			Messages.SCHOOL_E,
			Messages.SCHOOL_F
		]
	},

	constructor: function () {
		this.callParent(arguments);

		this.fields = [];
		for (var i = 0; i < this.getMaxAnswers(); i++) {
			this.fields.push(Ext.create('Ext.field.Text', {
				label: (i + 1) + '. ',
				labelWidth: '15%',
				value: this.getWording()[i]
			}));
		}

		var previewButton = Ext.create('Ext.Button', {
			text: Messages.ANSWER_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			style: 'width:200px; margin-left: 8px; margin-top: 0px;',
			scope: this,
			handler: function () {
				this.previewHandler();
			}
		});

		this.add([{
			xtype: 'fieldset',
			title: Messages.ANSWER_OPTIONS,
			items: this.fields
		}, previewButton]);
	},

	initWithQuestion: function (question) {
		var possibleAnswers = question.possibleAnswers;

		this.setMaxAnswers(possibleAnswers.length);
		for (var i = 0; i < this.fields.length; i++) {
			this.fields[i].setValue(possibleAnswers[i].text);
		}
	},

	getQuestionValues: function () {
		return {possibleAnswers: this.getValues()};
	},

	getValues: function () {
		return this.fields.map(function (item) {
			return {
				text: item.getValue(),
				correct: false
			};
		});
	},

	markEmptyFields: function () {
		var field;
		for (var i = 0; i < this.fields.length; i++) {
			field = this.fields[i];
			if (field.getValue().trim() === "") {
				field.addCls("required");
			}
		}
	},

	previewHandler: function () {
		var answerPreview = Ext.create('ARSnova.view.AnswerPreviewBox', {
			xtype: 'answerPreview'
		});
		answerPreview.showPreview(this.getValues());
	}
});
