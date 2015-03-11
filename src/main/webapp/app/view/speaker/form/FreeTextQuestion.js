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
<<<<<<< HEAD
				cls: 'newQuestionOptions',
=======
				//cls: 'newQuestionOptions',
>>>>>>> 2691e71... Fixed style for the togglebutton. #15325
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

<<<<<<< HEAD
		var me = this;

<<<<<<< HEAD
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
=======
>>>>>>> af8610a... fixed toggle button
		this.imgUploadBtn = Ext.create('Ext.field.Toggle', {
				name:'image-upload-button',
				label:Messages.IMG_UPLOAD_TOGGLE_BUTTON,
				labelCls:'imageUploadButtonLabel',
=======
		this.imgUploadBtn = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'actionButton',
			buttonConfig: 'togglefield',
			text: Messages.IMAGE_ANSWER_LONG,
			toggleConfig: {
				scope: this,
				label: false,
				value: 0,
>>>>>>> 2691e71... Fixed style for the togglebutton. #15325
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
<<<<<<< HEAD
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
=======
						me.imageQuestion = newValue == 0 ? false : true;
>>>>>>> af8610a... fixed toggle button
					}
				}
			}
		});

		var answerOptions = Ext.create('Ext.Panel', {
				scrollable: null,
				layout: {
					type:'hbox',
					pack:'center'
				},
				items: [this.imgUploadBtn]
			});

		this.add([answerOptions]);
<<<<<<< HEAD
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
=======
  	},
>>>>>>> af8610a... fixed toggle button
	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion;
		return result;
>>>>>>> dea8be2... Added handler for saving imagequestions. #15217
	}
});
