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
				//cls: 'newQuestionOptions',
				scrollable: null
	},
	imageQuestion: false,
	initialize: function () {
		this.callParent(arguments);

		this.imgUploadBtn = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'actionButton',
			buttonConfig: 'togglefield',
			text: Messages.IMAGE_ANSWER_LONG,
			toggleConfig: {
				scope: this,
				label: false,
				value: 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						imageQuestion = newValue == 0 ? false : true;
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
  },
	imageQuestion: function() {
		return this.imageQuestion;
	},
	getQuestionValues: function () {
		var result = {};
		result.imageQuestion = this.imageQuestion();
		return result;
	}
});
