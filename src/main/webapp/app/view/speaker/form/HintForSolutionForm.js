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
Ext.define('ARSnova.view.speaker.form.HintForSolutionForm', {
	extend: 'Ext.form.FormPanel',

	config: {
		active: true,
		hint: null,
		solution: null,

		scrollable: null,
		cls: 'centerFormTitle'
	},

	constructor: function () {
		this.callParent(arguments);

		this.hintTextArea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.HINT_FOR_SOLUTION,
			value: this.getHint()
		});

		this.hintFormat = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.hintTextArea
		});

		this.hint = Ext.create('Ext.Container', {
			hidden: !this.getActive(),
			items: [this.hintFormat, this.hintTextArea]
		});

		this.solutionTextArea = Ext.create('Ext.plugins.ResizableTextArea', {
			name: 'text',
			placeHolder: Messages.SAMPLE_SOLUTION,
			value: this.getSolution()
		});

		this.solutionFormat = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.solutionTextArea
		});

		this.solution = Ext.create('Ext.Container', {
			style: {
				marginTop: "0.5em"
			},
			hidden: !this.getActive(),
			items: [this.solutionFormat, this.solutionTextArea]
		});

		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong' :
				'previewButton',
			scope: this,
			hidden: !this.getActive(),
			style: {
				marginTop: "1.5em"
			},
			handler: function () {
				this.previewHandler();
			}
		});

		this.add([{
			xtype: 'fieldset',
			title: Messages.HINT_FOR_SOLUTION_EDIT,
			items: [{
				xtype: 'segmentedbutton',
				style: 'margin: auto; padding-bottom: 1em',
				cls: 'yesnoOptions',
				defaults: {
					ui: 'action'
				},
				items: [{
					text: Messages.YES,
					pressed: this.getActive(),
					scope: this,
					handler: function () {
						this.setActive(true);
						this.hint.show();
						this.solution.show();
						this.previewButton.show();
					}
				}, {
					text: Messages.NO,
					pressed: !this.getActive(),
					scope: this,
					handler: function () {
						this.setActive(false);
						this.hint.hide();
						this.solution.hide();
						this.previewButton.hide();
					}
				}]
			}, this.hint, this.solution, this.previewButton]
		}]);
	},

	getHintValue: function () {
		return this.hintTextArea.getValue();
	},

	getSolutionValue: function () {
		return this.solutionTextArea.getValue();
	},

	reset: function () {
		this.hintTextArea.reset();
		this.solutionTextArea.reset();
	},

	resetOriginalValue: function () {
		this.hintTextArea.resetOriginalValue();
		this.solutionTextArea.resetOriginalValue();
	},

	clear: function () {
		this.setHint(null);
		this.setSolution(null);
		this.hintTextArea.setValue(null);
		this.solutionTextArea.setValue(null);
	},

	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			equalPanelSize: true,
			toolbarTitle: Messages.QUESTION_PREVIEW_BUTTON_TITLE
		});
		questionPreview.showPreview(this.getHintValue(), this.getSolutionValue());
	},

	isEmpty: function () {
		return this.getHintValue().trim() === "" && this.getSolutionValue().trim() === "";
	}
});
