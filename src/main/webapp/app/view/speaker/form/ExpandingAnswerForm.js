/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel zum Angeben der exakten Fragenanzahl
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.speaker.form.ExpandingAnswerForm', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.CustomSliderField'],

	config: {
		minAnswers: 2,
		maxAnswers: 8,
		start: 4,
		step: 1,
		wording: {
			placeHolder: Messages.OPTION_PLACEHOLDER,
			/** 'arabic' or 'alphabet' **/
			enumeration: 'arabic'
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.questionValueComponents = [];
		this.answerComponents = [];

		this.selectAnswerCount = Ext.create('Ext.field.Spinner', {
			label: Messages.COUNT,
			minValue: this.getMinAnswers(),
			maxValue: ARSnova.app.globalConfig.answerOptionLimit,
			stepValue: this.getStep(),
			value: this.getStart(),
			listeners: {
				scope: this,
				spin: function (selectField, value) {
					for (var i = 0; i < ARSnova.app.globalConfig.answerOptionLimit; i++) {
						this.answerComponents[i].setHidden(i >= value);
						if (ARSnova.app.globalConfig.features.learningProgress) {
							this.questionValueComponents[i].setHidden(i >= value);
						}
					}
				}
			}
		});

		var previewButton = Ext.create('Ext.Button', {
			text: Messages.ANSWER_PREVIEW_BUTTON_TITLE,
			ui: 'confirm',
			style: 'width:200px; margin-left: 8px; margin-top: 0px;',
			scope: this,
			handler: function () {
					this.previewHandler();
				}
		});

		var answerFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWERS,
			items: [this.selectAnswerCount]
		});

		var questionValueFieldset = null;
		if (ARSnova.app.globalConfig.features.learningProgress) {
			questionValueFieldset = Ext.create('Ext.form.FieldSet', {
				title: Messages.ANSWER_POINTS,
				hidden: true
			});
		}

		var answerOptions = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			submitOnAction: false,
			items: [answerFieldset]
		});

		if (ARSnova.app.globalConfig.parseAnswerOptionFormatting) {
			answerOptions.add(previewButton);
		}

		var answerOptionEntryId = Ext.id();

		for (var i = 0; i < ARSnova.app.globalConfig.answerOptionLimit; i++) {
			(function (i) {
				var theComponentId = answerOptionEntryId + "-" + i;
				this.answerComponents[i] = Ext.create('ARSnova.view.TextCheckfield', {
					id: theComponentId,
					name: theComponentId,
					placeHolder: Messages.ANSWER,
					hidden: this.getStart() <= i,
					container: this,
					listeners: {
						scope: this,
						checkchange: function (field, isChecked) {
							if (ARSnova.app.globalConfig.features.learningProgress) {
								var component = this.questionValueComponents[i];
								var checked = this.answerComponents.filter(function (c) {
									return c.isChecked();
								});
								questionValueFieldset.setHidden(checked.length === 0);
								if (checked.length === 0) {
									this.questionValueComponents.forEach(function (c) {
										c.reset();
									});
								} else if (checked.length > 0) {
									this.questionValueComponents.forEach(function (c, j) {
											c.setSliderValue(this.answerComponents[j].isChecked() ? c.getMaxValue() : c.getMinValue());
									}, this);
								} else {
									component.setSliderValue(isChecked ? component.getMaxValue() : component.getMinValue());
								}
							}
						},
						change: function (field, newValue, oldValue) {
							if (ARSnova.app.globalConfig.features.learningProgress) {
								this.questionValueComponents[i].setLabel(newValue || Messages.ANSWER);
							}
						}
					}
				});
				answerFieldset.add(this.answerComponents[i]);
			}).call(this, i);
		}

		if (ARSnova.app.globalConfig.features.learningProgress) {
			for (var i = 0; i < this.getMaxAnswers(); i++) {
				(function (i) {
					var theComponentId = answerOptionEntryId + "-qv-" + i;
					this.questionValueComponents[i] = Ext.create("ARSnova.view.CustomSliderField", {
						id: theComponentId,
						name: theComponentId,
						hidden: this.getStart() <= i,
						minValue: -10,
						maxValue: 10,
						value: 0,
						increment: 1,
						label: this.answerComponents[i].getValue() || Messages.ANSWER
					});
					questionValueFieldset.add(this.questionValueComponents[i]);
				}).call(this, i);
			}
		}
		this.add([answerOptions]);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.add([questionValueFieldset]);
		}
	},

	getEnumeration: function () {
		switch (this.getWording().enumeration.toLowerCase()) {
			case 'alphabet':
				var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
				return function (index) {
					return alphabet[index];
				};
			case 'arabic':
			default:
				return function (index) {
					return index + 1;
				};
		}
	},

	getValues: function () {
		var values = [], obj;
		for (var i = 0; i < this.selectAnswerCount.getValue(); i++) {
			obj = {
				text: this.answerComponents[i].getValue(),
				correct: this.answerComponents[i].isChecked()
			};
			if (ARSnova.app.globalConfig.features.learningProgress) {
				obj.value = this.questionValueComponents[i].getSliderValue();
			}
			values.push(obj);
		}
		return values;
	},

	hasCorrectOptions: function () {
		var hasCorrectOptions = false;
		for (var i = 0; i < this.selectAnswerCount.getValue(); i++) {
			hasCorrectOptions = hasCorrectOptions || !!this.answerComponents[i].isChecked();
		}
		return hasCorrectOptions;
	},

	initWithQuestion: function (question) {
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length < this.getMinAnswers() || possibleAnswers.length > ARSnova.app.globalConfig.answerOptionLimit) {
			return;
		}
		this.initSpinnerField(possibleAnswers.length);
		this.initAnswerComponents(possibleAnswers);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.initQuestionValueComponents(possibleAnswers);
		}
	},

	initSpinnerField: function (startValue) {
		this.setStart(startValue);
		this.selectAnswerCount.setValue(startValue);
		this.selectAnswerCount.fireEvent('spin', this.selectAnswerCount, this.getStart());
	},

	initAnswerComponents: function (possibleAnswers) {
		possibleAnswers.forEach(function (answer, index) {
			this.answerComponents[index].setValue(answer.text);
			if (answer.correct) this.answerComponents[index].check();
		}, this);
	},

	initQuestionValueComponents: function (possibleAnswers) {
		possibleAnswers.forEach(function (answer, index) {
			this.questionValueComponents[index].setSliderValue(answer.value);
		}, this);
	},

	getQuestionValues: function () {
		var result = {};

		result.possibleAnswers = this.getValues();

		if (!this.hasCorrectOptions()) {
			result.noCorrect = 1;
		}
		return result;
	},

	previewHandler: function () {
		var answerPreview = Ext.create('ARSnova.view.AnswerPreviewBox', {
			xtype: 'answerPreview'
		});
		answerPreview.showPreview(this.getValues());
	},

	markEmptyFields: function () {
		var field;
		for (var i = 0; i < this.selectAnswerCount.getValue(); i++) {
			field = this.answerComponents[i];
			if (field.getValue().trim() === "") {
				field.element.select(".x-input-text").addCls('formInvalid');
			}
		}
	}
});
