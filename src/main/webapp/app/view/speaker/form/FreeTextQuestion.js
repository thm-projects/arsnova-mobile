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
<<<<<<< HEAD
<<<<<<< HEAD
				cls: 'newQuestionOptions',
				scrollable: null
	},
<<<<<<< HEAD
<<<<<<< HEAD
	imageQuestion: false,
=======
	isImageQuestion: false,
>>>>>>> 57fb4dc... Added isImageQuestion()-function #15217
=======
	imageQuestion: false,
>>>>>>> 34cbe25... added new field to model #15268
	initialize: function () {
		this.callParent(arguments);

		var me = this;

=======
				cls: 'newQuestionOptions centerFormTitle',
=======
				cls: 'newQuestionOptions',
>>>>>>> e417753... Changed alignment of "Antwortmoeglichkeiten" to left. #15216
				scrollable: null
	},
	initialize: function () {
		this.callParent(arguments);

>>>>>>> 8a9bbc2... Added ToggleButton for imagequestion to freetext question. #15216
		this.imgUploadBtn = Ext.create('Ext.field.Toggle', {
				name:'image-upload-button',
				label:Messages.IMG_UPLOAD_TOGGLE_BUTTON,
				labelCls:'imageUploadButtonLabel',
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
<<<<<<< HEAD
<<<<<<< HEAD
						me.imageQuestion = newValue == 0 ? false : true;
=======
						console.log("toggled");
<<<<<<< HEAD
>>>>>>> 8a9bbc2... Added ToggleButton for imagequestion to freetext question. #15216
=======
						isImageQuestion = newValue;
						console.log(isImageQuestion);
>>>>>>> 57fb4dc... Added isImageQuestion()-function #15217
=======
						imageQuestion = newValue == 0 ? false : true;
>>>>>>> 34cbe25... added new field to model #15268
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
<<<<<<< HEAD
  	},
	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion;
		return result;
=======
  },
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	isImageQuestion: function() {
<<<<<<< HEAD

>>>>>>> 8a9bbc2... Added ToggleButton for imagequestion to freetext question. #15216
=======
		return isImageQuestion;
<<<<<<< HEAD
>>>>>>> 57fb4dc... Added isImageQuestion()-function #15217
=======
=======
	imageQuestion: function() {
		return imageQuestion;
>>>>>>> 34cbe25... added new field to model #15268
=======
	isImageQuestion: function() {
=======
	imageQuestion: function() {
>>>>>>> 348d8ae... Fixed bug #15341
		return this.imageQuestion;
>>>>>>> f4a8fa6... Fixed bug "Uncaught ReferenceError.." #15341
	},
	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion();
		return result;
>>>>>>> dea8be2... Added handler for saving imagequestions. #15217
	}
});
