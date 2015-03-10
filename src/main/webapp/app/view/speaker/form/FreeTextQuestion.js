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
				cls: 'newQuestionOptions',
				scrollable: null
	},
	isImageQuestion: false,
	initialize: function () {
		this.callParent(arguments);

		this.imgUploadBtn = Ext.create('Ext.field.Toggle', {
				name:'image-upload-button',
				label:Messages.IMG_UPLOAD_TOGGLE_BUTTON,
				labelCls:'imageUploadButtonLabel',
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						console.log("toggled");
						isImageQuestion = newValue;
						console.log(isImageQuestion);
					}
				}
		});

		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWER_OPTIONS,
			items: [this.imgUploadBtn]
		});

		var answerOptions = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			submitOnAction: false,
			items: [answerFieldset]
		});

		this.add([answerOptions]);
  },
	isImageQuestion: function() {
		return isImageQuestion;
	},
	getQuestionValues: function () {
		var result = {};
		result.isImageQuestion = this.isImageQuestion();
		console.log(result.isImageQuestion);

		return result;
	}
});
