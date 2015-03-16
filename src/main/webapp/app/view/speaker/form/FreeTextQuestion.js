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
<<<<<<< HEAD
				cls: 'newQuestionOptions',
=======
				//cls: 'newQuestionOptions',
>>>>>>> 2691e71... Fixed style for the togglebutton. #15325
				scrollable: null
=======
				scrollable: null,
				cls:'centerFormTitle'
>>>>>>> a3061cf... Set the title of the ToggleButton on-top the button.
	},
<<<<<<< HEAD
<<<<<<< HEAD
	imageQuestion: false,
<<<<<<< HEAD
<<<<<<< HEAD
=======
	isImageQuestion: false,
>>>>>>> 57fb4dc... Added isImageQuestion()-function #15217
=======
	imageQuestion: false,
>>>>>>> 34cbe25... added new field to model #15268
=======
	textAnswerEnabled: false,
>>>>>>> 25ce6bf... Simon added toggle button disabling freetext answer test #15377
=======
	textAnswerEnabled: true,
>>>>>>> dc25235... fixed small issue  #15377
	initialize: function () {
		this.callParent(arguments);

<<<<<<< HEAD
		var me = this;

<<<<<<< HEAD
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
=======
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

>>>>>>> 25ce6bf... Simon added toggle button disabling freetext answer test #15377
		this.imgUploadBtn = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'actionButton',
			buttonConfig: 'togglefield',
			style:'margin-top:-20px',
			//would be displayed below the button
			//text: Messages.IMAGE_QUESTION_LBL,
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
<<<<<<< HEAD
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
=======
						if(me.textAnswerFieldSet.isHidden()) {
							me.textAnswerFieldSet.show();
						} else {
							me.textAnswerFieldSet.hide();
						}
>>>>>>> 25ce6bf... Simon added toggle button disabling freetext answer test #15377
					}
				}
			}
		});

<<<<<<< HEAD
		var answerOptions = Ext.create('Ext.Panel', {
				scrollable: null,
				layout: {
					type:'hbox',
					pack:'center'
				},
				items: [this.imgUploadBtn]
			});
=======
>>>>>>> dc25235... fixed small issue  #15377

<<<<<<< HEAD
		this.add([answerOptions]);
<<<<<<< HEAD
<<<<<<< HEAD
  	},
	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion;
		return result;
=======
=======
		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			//displayed on-top of the button
			title:Messages.IMAGE_QUESTION_LBL,
			style:'margin-top:45px;',
			items:[this.imgUploadBtn]
		});

<<<<<<< HEAD
		this.add([answerFieldset]);
>>>>>>> a3061cf... Set the title of the ToggleButton on-top the button.
=======
		this.add([answerFieldset, this.textAnswerFieldSet]);
>>>>>>> 25ce6bf... Simon added toggle button disabling freetext answer test #15377
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
		result.textAnswerEnabled = this.textAnswerEnabled;
		return result;
>>>>>>> dea8be2... Added handler for saving imagequestions. #15217
	}
});
