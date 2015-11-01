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
Ext.define('FreetextAnswer', {
	extend: 'Ext.data.Model',

	require: [
		'ARSnova.view.ImageAnswerPanel',
		'ARSnova.view.FreetextAnswerPanel',
		'ARSnova.view.speaker.form.ExpandingAnswerForm',
		'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
		'ARSnova.view.speaker.form.NullQuestion',
		'ARSnova.view.speaker.form.SchoolQuestion',
		'ARSnova.view.speaker.form.VoteQuestion',
		'ARSnova.view.speaker.form.YesNoQuestion',
		'ARSnova.view.speaker.form.FlashcardQuestion',
		'ARSnova.view.speaker.form.GridStatistic'
	],

	config: {
		idProperty: "_id",

		fields: [
			'answerSubject',
			'timestamp',
			'formattedTime',
			'groupDate',
			'questionId',
			'abstention',
			'answerText',
			'piRound',
			'sessionId',
			'type',
			'_rev',
			'answerThumbnailImage',
			'read'
		]
	}
});

Ext.define('ARSnova.view.speaker.QuestionDetailsPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.speaker.form.AbstentionForm',
		'ARSnova.view.speaker.form.ExpandingAnswerForm',
		'ARSnova.view.speaker.form.HintForSolutionForm',
		'ARSnova.view.speaker.form.IndexedExpandingAnswerForm',
		'ARSnova.view.MultiBadgeButton',
		'ARSnova.view.speaker.form.NullQuestion',
		'ARSnova.view.speaker.form.SchoolQuestion',
		'ARSnova.view.speaker.form.VoteQuestion',
		'ARSnova.view.speaker.form.YesNoQuestion',
		'ARSnova.view.speaker.form.FlashcardQuestion',
		'ARSnova.view.speaker.QuestionStatisticChart'
	],

	config: {
		title: 'QuestionDetailsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	cancelButton: null,
	editButton: null,
	gridStatistic: null,

	questionObj: null,
	answerStore: null,
	abstentionInternalId: 'ARSnova_Abstention',
	abstentionAnswer: null,

	renewAnswerDataTask: {
		name: 'renew the answer table data at question details panel',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel.getQuestionAnswers();
		},
		interval: 20000 // 20 seconds
	},

	constructor: function (args) {
		this.callParent(arguments);

		var me = this;
		this.questionObj = args.question;

		// check if grid question
		this.isGridQuestion = (['grid'].indexOf(this.questionObj.questionType) !== -1);
		this.isFlashcard = this.questionObj.questionType === 'flashcard';

		this.hasCorrectAnswers = true;
		if (['vote', 'school', 'freetext', 'flashcard'].indexOf(this.questionObj.questionType) !== -1
				|| (this.isGridQuestion && this.questionObj.gridType === 'moderation')) {
			this.hasCorrectAnswers = false;
		}

		this.answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		this.answerStore.add(Ext.clone(this.questionObj.possibleAnswers));
		this.formatAnswerText();
		this.addAbstentionAnswer();

		/* BEGIN TOOLBAR OBJECTS */

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.QUESTIONS,
			ui: 'back',
			scope: this,
			handler: function () {
				ARSnova.app.taskManager.stop(this.renewAnswerDataTask);

				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.on('cardswitch', function () {
					this.destroy();
				}, this, {single: true});
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type: 'slide',
					direction: 'right'
				});
			}
		});

		this.cancelButton = Ext.create('Ext.Button', {
			text: Messages.CANCEL,
			ui: 'decline',
			hidden: true,
			handler: function () {
				var panel = this.up('panel');
				var eb = panel.editButton;
				eb.setText(Messages.EDIT);
				eb.removeCls('x-button-action');

				this.hide();
				panel.backButton.show();
				panel.resetFields();
				panel.previewButton.hide();
				panel.editButton.config.setEnableAnswerEdit(panel, false);
				panel.uploadView.hide();
				panel.hintForSolution.hide();
				if (panel.hintForSolution.getActive()) {
					panel.hintForSolutionPreview.show();
				}
			}
		});

		this.editButton = Ext.create('Ext.Button', {
			text: Messages.EDIT,
			handler: function () {
				var panel = this.up('panel');
				var answersChanged = function (prevAnswers, newAnswers) {
					if (prevAnswers.length !== newAnswers.length) {
						return true;
					}

					var changed = false;
					prevAnswers.forEach(function (answer, i) {
						if (answer.text !== newAnswers[i].text) {
							changed = true;
						}
					});
					return changed;
				};

				var contentChanged = function (prevContent, newContent) {
					if (newContent.gridSize !== prevContent.get("gridSize")) {
						return true;
					}
					if (newContent.zoomLvl !== prevContent.get("zoomLvl")) {
						return true;
					}
					if (newContent.offsetX !== prevContent.get("offsetX")) {
						return true;
					}
					if (newContent.offsetY !== prevContent.get("offsetY")) {
						return true;
					}
					if (newContent.gridOffsetX !== prevContent.get("gridOffsetX")) {
						return true;
					}
					if (newContent.gridOffsetY !== prevContent.get("gridOffsetY")) {
						return true;
					}
					if (newContent.gridZoomLvl !== prevContent.get("gridZoomLvl")) {
						return true;
					}
					if (newContent.gridSizeX !== prevContent.get("gridSizeX")) {
						return true;
					}
					if (newContent.gridSizeY !== prevContent.get("gridSizeY")) {
						return true;
					}
					if (newContent.gridIsHidden !== prevContent.get("gridIsHidden")) {
						return true;
					}
					if (newContent.imgRotation !== prevContent.get("imgRotation")) {
						return true;
					}
					if (newContent.toggleFieldsLeft !== prevContent.get("toggleFieldsLeft")) {
						return true;
					}
					if (newContent.numClickableFields !== prevContent.get("numClickableFields")) {
						return true;
					}
					if (newContent.thresholdCorrectAnswers !== prevContent.get("thresholdCorrectAnswers")) {
						return true;
					}
					if (newContent.cvIsColored !== prevContent.get("cvIsColored")) {
						return true;
					}
					if (newContent.gridLineColor !== prevContent.get("gridLineColor")) {
						return true;
					}
					if (newContent.numberOfDots !== prevContent.get("numberOfDots")) {
						return true;
					}
					if (newContent.gridType !== prevContent.get("gridType")) {
						return true;
					}

					var changed = false;
					prevContent.get("possibleAnswers").forEach(function (answer, i) {
						if (answer.correct !== newContent.possibleAnswers[i].correct) {
							changed = true;
						}

						if (answer.value !== newContent.possibleAnswers[i].value) {
							changed = true;
						}
					});
					return changed;
				};

				var saveQuestion = function (question) {
					var questionValues = panel.answerEditForm.getQuestionValues();

					if (panel.image) {
						question.set("image", panel.image);
					}

					if (panel.hintForSolution.getActive() && !panel.hintForSolution.isEmpty()) {
						question.set("hint", panel.hintForSolution.getHintValue());
						question.set("solution", panel.hintForSolution.getSolutionValue());
					} else {
						question.set("hint", null);
						question.set("solution", null);
						panel.hintForSolution.clear();
					}
					question.raw.hint = question.get("hint");
					question.raw.solution = question.get("solution");

					if (questionValues.gridSize !== undefined) {
						question.set("gridSize", questionValues.gridSize);
					}
					if (questionValues.offsetX !== undefined) {
						question.set("offsetX", questionValues.offsetX);
					}
					if (questionValues.offsetY !== undefined) {
						question.set("offsetY", questionValues.offsetY);
					}
					if (questionValues.zoomLvl !== undefined) {
						question.set("zoomLvl", questionValues.zoomLvl);
					}
					if (questionValues.gridOffsetX !== undefined) {
						question.set("gridOffsetX", questionValues.gridOffsetX);
					}
					if (questionValues.gridOffsetY !== undefined) {
						question.set("gridOffsetY", questionValues.gridOffsetY);
					}
					if (questionValues.gridZoomLvl !== undefined) {
						question.set("gridZoomLvl", questionValues.gridZoomLvl);
					}
					if (questionValues.gridSizeX !== undefined) {
						question.set("gridSizeX", questionValues.gridSizeX);
					}
					if (questionValues.gridSizeY !== undefined) {
						question.set("gridSizeY", questionValues.gridSizeY);
					}
					if (questionValues.gridIsHidden !== undefined) {
						question.set("gridIsHidden", questionValues.gridIsHidden);
					}
					if (questionValues.imgRotation !== undefined) {
						question.set("imgRotation", questionValues.imgRotation);
					}
					if (questionValues.toggleFieldsLeft !== undefined) {
						question.set("toggleFieldsLeft", questionValues.toggleFieldsLeft);
					}
					if (questionValues.numClickableFields !== undefined) {
						question.set("numClickableFields", questionValues.numClickableFields);
					}
					if (questionValues.thresholdCorrectAnswers !== undefined) {
						question.set("thresholdCorrectAnswers", questionValues.thresholdCorrectAnswers);
					}
					if (questionValues.cvIsColored !== undefined) {
						question.set("cvIsColored", questionValues.cvIsColored);
					}
					if (questionValues.gridLineColor !== undefined) {
						question.set("gridLineColor", questionValues.gridLineColor);
					}
					if (questionValues.numberOfDots !== undefined) {
						question.set("numberOfDots", questionValues.numberOfDots);
					}
					if (questionValues.gridType !== undefined) {
						question.set("gridType", questionValues.gridType);
					}
					if (questionValues.scaleFactor !== undefined) {
						question.set("scaleFactor", questionValues.scaleFactor);
					}
					if (questionValues.gridScaleFactor !== undefined) {
						question.set("gridScaleFactor", questionValues.gridScaleFactor);
					}

					question.set("possibleAnswers", questionValues.possibleAnswers);
					question.set("noCorrect", questionValues.noCorrect);
					Ext.apply(question.raw, questionValues);

					question.saveSkillQuestion({
						success: function (response) {
							panel.questionObj = question.data;
							panel.answerStore.removeAll();
							panel.answerStore.add(questionValues.possibleAnswers);
							panel.formatAnswerText();
							panel.addAbstentionAnswer();
							panel.getQuestionAnswers();
							panel.setCorrectAnswerToggleState();
							panel.setContentFormContent(panel.questionObj);
							if (panel.hintForSolution.isEmpty()) {
								panel.hintForSolutionPreview.hide();
							} else {
								panel.hintPreview.setContent(question.get("hint") || "—", true, true);
								panel.solutionPreview.setContent(question.get("solution") || "—", true, true);
							}

							if (panel.questionObj.questionType === 'grid') {
								panel.gridStatistic.setQuestionObj(panel.questionObj);
								panel.gridStatistic.updateGrid();
							}

							if (panel.questionObj.questionType === 'flashcard') {
								panel.answerListPanel.setContent(
									panel.questionObj.possibleAnswers[0].text, true, true
								);
							}
						}
					});
				};
				var finishEdit = Ext.bind(function () {
					this.setText(Messages.EDIT);
					this.removeCls('x-button-action');
					this.config.disableFields(panel);
					this.config.setEnableAnswerEdit(panel, false);
				}, this);
				var hasEmptyAnswers = function (possibleAnswers) {
					var empty = false;
					possibleAnswers.forEach(function (answer) {
						if (answer.text === "") {
							empty = true;
						}
					});
					return empty;
				};
				var questionValues;
				if (this.getText() === Messages.EDIT) {
					panel.answerEditForm.initWithQuestion(panel.questionObj);
					questionValues = panel.answerEditForm.getQuestionValues();

					panel.setContentFormContent(panel.questionObj);
					panel.contentForm.hide();
					panel.contentEditForm.show();
					panel.previewButton.show();
					panel.markdownEditPanel.show();
					panel.cancelButton.show();
					panel.backButton.hide();

					this.setText(Messages.SAVE);
					this.addCls('x-button-action');

					this.config.enableFields(panel);
					this.config.setEnableAnswerEdit(panel, true);
					panel.hintForSolution.show();
					panel.hintForSolutionPreview.hide();

					if (panel.questionObj.questionType === 'flashcard') {
						panel.abstentionPart.hide();
						panel.abstentionAlternative.hide();
						panel.hintForSolution.hide();
					} else if (panel.questionObj.questionType === 'grid') {
						panel.uploadView.show();
					}

					if (questionValues.gridType === "moderation") {
						panel.abstentionPart.setHidden(true);
						panel.abstentionAlternative.show();
					} else {
						panel.abstentionAlternative.hide();
					}
				} else {
					var values = this.up('panel').down('#contentEditForm').getValues();
					var question = Ext.create('ARSnova.model.Question', panel.questionObj);
					var afterEdit = function () {
						panel.contentForm.show();
						panel.contentEditForm.hide();
						panel.uploadView.hide();
						panel.previewButton.hide();
						panel.markdownEditPanel.hide();
						panel.cancelButton.hide();
						panel.backButton.show();
						panel.hintForSolution.hide();
						if (panel.hintForSolution.getActive()) {
							panel.hintForSolutionPreview.show();
						}
						question.set("subject", values.subject);
						question.set("text", values.questionText);
						question.set("abstention", panel.abstentionPart.getAbstention());
						question.raw.subject = values.subject;
						question.raw.text = values.questionText;
						question.raw.abstention = panel.abstentionPart.getAbstention();

						panel.subject.resetOriginalValue();
						panel.textarea.resetOriginalValue();
					};
					var needsConfirmation = false;
					var empty = false;
					if (panel.image !== panel.questionObj.image) {
						needsConfirmation = true;
					}
					if (!panel.answerEditForm.isHidden()) {
						questionValues = panel.answerEditForm.getQuestionValues();

						if (hasEmptyAnswers(questionValues.possibleAnswers)) {
							empty = true;
						}

						if (question.get("questionType") === 'grid') {
							if (contentChanged(question, questionValues)) {
								needsConfirmation = true;
							}
						} else {
							if (answersChanged(question.get("possibleAnswers"), questionValues.possibleAnswers)) {
								needsConfirmation = true;
							}
						}
					}
					if (empty) {
						panel.answerEditForm.markEmptyFields();
						return;
					}
					if (needsConfirmation) {
						Ext.Msg.confirm(Messages.ARE_YOU_SURE, Messages.CONFIRM_ANSWERS_CHANGED, function (answer) {
							if (answer === "yes") {
								ARSnova.app.questionModel.deleteAnswers(panel.questionObj._id, {
									success: function () {
										afterEdit();
										saveQuestion(question);
										finishEdit();
										panel.showCorrectAnswerButton.setToggleFieldValue(0);
									},
									failure: function (response) {
										console.log('server-side error delete question');
										Ext.Msg.alert(Messages.ERROR, Messages.QUESTION_COULD_NOT_BE_SAVED);
										finishEdit();
									}
								});
							}
						}, this);
					} else {
						afterEdit();
						saveQuestion(question);
						finishEdit();
					}
				}
			},


			enableFields: function (panel) {
				var fields = panel.contentEditFieldset.getItems().items;
				var fieldsLength = fields.length;

				for (var i = 0; i < fieldsLength; i++) {
					var field = fields[i];

					switch (field.config.label) {
						case Messages.CATEGORY:
							field.setDisabled(false);
							break;
						case Messages.QUESTION:
							field.setDisabled(false);
							break;
						case Messages.DURATION:
							field.setDisabled(false);
							break;
						default:
							break;
					}
				}
			},

			disableFields: function (panel) {
				var fields = panel.contentEditFieldset.getItems().items;
				var fieldsLength = fields.length;

				for (var i = 0; i < fieldsLength; i++) {
					var field = fields[i];
					switch (field.config.label) {
						case Messages.CATEGORY:
							field.setDisabled(true);
							break;
						case Messages.QUESTION:
							field.setDisabled(true);
							break;
						case Messages.DURATION:
							field.setDisabled(true);
							break;
						default:
							break;
					}
				}
			},

			setEnableAnswerEdit: function (panel, enable) {
				if (enable) {
					panel.answerForm.hide(true);
				} else {
					panel.answerForm.show(true);
				}
				panel.answerEditForm.setHidden(!enable);
				panel.abstentionPart.setHidden(!enable);
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: this.getType() + '-' + Messages.QUESTION,
			cls: 'speakerTitleText',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				this.cancelButton,
				{xtype: 'spacer'},
				this.editButton
			]
		});

		/* END TOOLBAR OBJECTS */

		/* BEGIN ACTIONS PANEL */

		this.questionStatusButton = Ext.create('ARSnova.view.QuestionStatusButton', {
			questionObj: this.questionObj
		});

		this.releaseStatisticButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			text: Messages.RELEASE_STATISTIC,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.questionObj.showStatistic || 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						if (newValue === (this.questionObj.showStatistic || 0)) {
							return;
						}

						var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', this.questionObj);

						switch (newValue) {
							case 0:
								delete question.data.showStatistic;
								delete question.raw.showStatistic;
								break;
							case 1:
								question.set('showStatistic', true);
								question.raw.showStatistic = true;
								break;
						}
						question.publishSkillQuestionStatistics({
							success: function (response) {
								hideLoadMask();
								me.questionObj = question.getData();
							},
							failure: function () {
								hideLoadMask();
								console.log('could not save showStatistic flag');
							}
						});
					}
				}
			}
		});

		this.showCorrectAnswerButton = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			text: Messages.MARK_CORRECT_ANSWER,
			toggleConfig: {
				scope: this,
				label: false,
				value: this.questionObj.showAnswer || 0,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						var panel = this;

						if (newValue === (this.questionObj.showAnswer || 0)) {
							return;
						}

						var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_ACTIVATION);
						var question = Ext.create('ARSnova.model.Question', this.questionObj);

						switch (newValue) {
							case 0:
								delete question.data.showAnswer;
								delete question.raw.showAnswer;
								break;
							case 1:
								question.set('showAnswer', 1);
								question.raw.showAnswer = 1;
								break;
						}
						question.publishCorrectSkillQuestionAnswer({
							success: function (response) {
								hideLoadMask();
								panel.questionObj = question.getData();
							},
							failure: function () {
								hideLoadMask();
								console.log('could not save showAnswer flag');
							}
						});
					}
				}
			}
		});

		this.deleteAnswersButton = Ext.create('ARSnova.view.MatrixButton', {
			hidden: this.isFlashcard,
			buttonConfig: 'icon',
			text: Messages.DELETE_ANSWERS,
			imageCls: 'icon-close thm-orange',
			scope: this,
			handler: function () {
				Ext.Msg.confirm(Messages.DELETE_ANSWERS_REQUEST, Messages.QUESTION_REMAINS, function (answer) {
					if (answer === 'yes') {
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						ARSnova.app.questionModel.deleteAnswers(panel.questionObj._id, {
							success: function () {
								panel.getQuestionAnswers();
								panel.showCorrectAnswerButton.setToggleFieldValue(0);
							},
							failure: function (response) {
								console.log('server-side error delete question');
							}
						});
					}
				});
			}
		});

		this.statisticButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SHOW_STATISTIC,
			buttonConfig: 'icon',
			imageCls: 'icon-chart thm-green',
			scope: this,
			handler: function () {
				ARSnova.app.taskManager.stop(this.renewAnswerDataTask);
				ARSnova.app.getController('Statistics').prepareStatistics(this);
			}
		});

		this.deleteQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			xtype: 'button',
			buttonConfig: 'icon',
			text: Messages.DELETE_QUESTION,
			imageCls: 'icon-close thm-red',
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE;
				if (this.questionObj.active) {
					msg += "<br>" + Messages.DELETE_ALL_ANSWERS_INFO;
				}
				Ext.Msg.confirm(Messages.DELETE_QUESTION_TITLE, msg, function (answer) {
					if (answer === 'yes') {
						var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
						ARSnova.app.questionModel.destroy(sTP.questionDetailsPanel.questionObj, {
							success: function () {
								var me = sTP.questionDetailsPanel;

								sTP.animateActiveItem(sTP.audienceQuestionPanel, {
									type: 'slide',
									direction: 'right',
									duration: 700,
									listeners: {
										animationend: function () {
											ARSnova.app.taskManager.stop(me.renewAnswerDataTask);
											me.destroy();
										}
									}
								});
							},
							failure: function (response) {
								console.log('server-side error delete question');
							}
						});
					}
				});
			}
		});

		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			cls: Ext.os.is.Desktop ?
				'previewButtonLong' :
				'previewButton',
			hidden: true,
			scope: this,
			handler: function () {
				this.previewHandler();
			}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}],
			style: "margin-bottom: 1.5em; margin-left: 12px"
		});

		this.firstRow = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			hidden: this.isFlashcard,

			style: {
				marginTop: '30px'
			},

			items: [
				this.questionStatusButton,
				this.releaseStatisticButton
			]
		});

		this.secondRow = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			style: {
				marginTop: '15px'
			},

			items: [
				this.isFlashcard ? this.questionStatusButton : {},
				this.questionObj.questionType !== "freetext" && !this.isFlashcard ?
					this.statisticButton : {},
				this.deleteAnswersButton,
				this.deleteQuestionButton
			]
		});

		/* END ACTIONS PANEL */

		this.releasePart = Ext.create('Ext.Panel', {
			items: [
				{
					cls: 'gravure icon',
					style: {margin: '20px'},
					html: '<span class="coursemembersonlymessage">' + Messages.MEMBERS_ONLY + '</span>'
				}
			],
			hidden: !localStorage.getItem('courseId')
		});

		this.actionsPanel = Ext.create('Ext.Panel', {
			style: 'margin-bottom: 25px',
			items: [
				this.releasePart,
				this.firstRow,
				this.secondRow
			]
		});

		/* BEGIN QUESTION DETAILS */

		this.subject = Ext.create('Ext.field.Text', {
			label: Messages.CATEGORY,
			name: 'subject',
			value: this.questionObj.subject,
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});

		this.textarea = Ext.create('Ext.plugins.ResizableTextArea', {
			label: Messages.QUESTION,
			name: 'questionText',
			value: this.questionObj.text,
			disabledCls: 'disableDefault',
			inputCls: 'thm-grey',
			disabled: true
		});

		this.markdownEditPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.textarea,
			hidden: true
		});

		this.titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
		this.contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			style: 'min-height: 150px'
		});

		this.contentFieldset = Ext.create('Ext.form.FieldSet', {
			items: [this.titlePanel, this.contentPanel]
		});

		this.contentEditFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			itemId: 'contentEditFieldset',
			items: [this.markdownEditPanel, this.subject, this.textarea, {
				xtype: 'textfield',
				label: Messages.TYPE,
				value: this.getType(),
				disabledCls: 'disableDefault',
				inputCls: 'thm-grey',
				disabled: true
			}]
		});

		this.abstentionPart = Ext.create('ARSnova.view.speaker.form.AbstentionForm', {
			abstention: this.questionObj.abstention,
			hidden: true
		});

		this.abstentionAlternative = Ext.create('Ext.Spacer', {
			hidden:	true,
			height: 40
		});

		this.hintForSolution = Ext.create('ARSnova.view.speaker.form.HintForSolutionForm', {
			active: !!(this.questionObj.hint || this.questionObj.solution),
			hint: this.questionObj.hint,
			solution: this.questionObj.solution,
			hidden: true
		});

		this.hintPreview = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
		this.solutionPreview = Ext.create('ARSnova.view.MathJaxMarkDownPanel');

		this.hintPreview.setContent(this.questionObj.hint || "—", true, true);
		this.solutionPreview.setContent(this.questionObj.solution || "—", true, true);

		this.hintForSolutionPreview = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			hidden: !this.hintForSolution.getActive(),
			items: [{
				xtype: 'fieldset',
				title: Messages.HINT_FOR_SOLUTION,
				style: {
					marginBottom: "0"
				},
				items: [this.hintPreview]
			}, {
				xtype: 'fieldset',
				title: Messages.SAMPLE_SOLUTION,
				style: {
					marginTop: "0"
				},
				items: [this.solutionPreview]
			}]
		});

		this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
			handlerScope: this,
			addRemoveButton: true,
			activateTemplates: false,
			urlUploadHandler: this.setImage,
			fsUploadHandler: this.setImage,
			hidden: true,
			style: "margin-top: 10px"
		});

		this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
			itemId: 'gridImageContainer' + this.questionObj._id,
			editable: false,
			gridIsHidden: true,
			hidden: true
		});

		if (this.isGridQuestion) {
			this.gridStatistic = Ext.create('ARSnova.view.components.GridStatistic', {
				questionObj: this.questionObj
			});
		}

		this.contentForm = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			itemId: 'contentForm',
			style: {marginTop: '15px', marginBottom: '-15px'},
			items: [this.contentFieldset]
		});

		this.contentEditForm = Ext.create('Ext.form.FormPanel', {
			hidden: true,
			scrollable: null,
			itemId: 'contentEditForm',
			style: {marginTop: '15px', marginLeft: '12px', marginRight: '12px'},
			items: [this.contentEditFieldset]
		});

		this.answerFormFieldset = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset centerFormTitle',
			title: this.questionObj.questionType !== "flashcard" ? Messages.ANSWERS : Messages.ANSWER
		});

		this.answerForm = Ext.create('Ext.form.FormPanel', {
			itemId: 'answerForm',
			scroll: false,
			scrollable: null,
			items: [this.answerFormFieldset]
		});

		var answerEditFormClass = 'ARSnova.view.speaker.form.NullQuestion';
		if (this.questionObj.questionType === 'mc') {
			answerEditFormClass = 'ARSnova.view.speaker.form.ExpandingAnswerForm';
		} else if (this.questionObj.questionType === 'abcd') {
			answerEditFormClass = 'ARSnova.view.speaker.form.IndexedExpandingAnswerForm';
		} else if (this.questionObj.questionType === 'yesno') {
			answerEditFormClass = 'ARSnova.view.speaker.form.YesNoQuestion';
		} else if (this.questionObj.questionType === 'school') {
			answerEditFormClass = 'ARSnova.view.speaker.form.SchoolQuestion';
		} else if (this.questionObj.questionType === 'vote') {
			answerEditFormClass = 'ARSnova.view.speaker.form.VoteQuestion';
		} else if (this.questionObj.questionType === 'flashcard') {
			answerEditFormClass = 'ARSnova.view.speaker.form.FlashcardQuestion';
		} else if (this.questionObj.questionType === 'grid') {
			answerEditFormClass = 'ARSnova.view.speaker.form.GridQuestion';
		}

		this.answerEditForm = Ext.create(answerEditFormClass, {
			editPanel: true,
			hidden: true
		});
		this.answerEditForm.initWithQuestion(Ext.clone(this.questionObj));
		this.setContentFormContent(this.questionObj);
		this.image = this.questionObj.image;

		this.possibleAnswers = {};

		if (this.questionObj.questionType === 'flashcard') {
			this.answerListPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				style: 'word-wrap: break-word;',
				cls: ''
			});
		}

		/* END QUESTION DETAILS */

		this.add([
			this.toolbar,
			this.actionsPanel, {
				xtype: 'formpanel',
				scrollable: null,
				items: [this.contentForm, this.contentEditForm, this.previewPart]
			},
			this.abstentionPart,
			this.abstentionAlternative,
			this.grid,
			this.uploadView,
			this.answerForm,
			this.hintForSolutionPreview,
			this.answerEditForm,
			this.hintForSolution,
			this.actionsPanel
		]);

		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		this.on('painted', this.onPainted);
	},

	prevNewCard: null,
	prevOldCard: null,
	cardSwitchHandler: function (panel, newCard, oldCard, index, animated) {
		if (this.prevNewCard === oldCard) {
			ARSnova.app.taskManager.start(this.renewAnswerDataTask);
			return;
		}
		this.prevNewCard = newCard;
		this.prevOldCard = oldCard;
	},

	onActivate: function () {
		this.getPossibleAnswers();
		this.updateActionButtons();
		this.setCorrectAnswerToggleState();

		if (this.hasCorrectAnswers) {
			this.firstRow.add(this.showCorrectAnswerButton);
		}

		ARSnova.app.taskManager.start(this.renewAnswerDataTask);
		ARSnova.app.mainTabPanel.on('cardswitch', this.cardSwitchHandler, this);
		this.on('beforedestroy', function () {
			ARSnova.app.mainTabPanel.removeListener('cardswitch', this.cardSwitchHandler, this);
		}, this);
	},

	onDeactivate: function () {
	},

	onPainted: function () {
		this.updateActionButtons();
	},

	setCorrectAnswerToggleState: function () {
		if (this.questionObj.noCorrect) {
			this.showCorrectAnswerButton.hide();
		} else {
			this.showCorrectAnswerButton.show();
		}
	},

	updateActionButtons: function () {
		var active = this.questionObj.active,
			showAnswer = this.questionObj.showAnswer ? 1 : 0,
			showStatistic = this.questionObj.showStatistic ? 1 : 0;

		this.questionStatusButton.button.setToggleFieldValue(active);
		this.showCorrectAnswerButton.setToggleFieldValue(showAnswer);
		this.releaseStatisticButton.setToggleFieldValue(showStatistic);

		if (this.questionObj.piRoundActive) {
			this.firstRow.hide();
			this.deleteAnswersButton.hide();
		} else {
			this.firstRow.setHidden(this.isFlashcard);
			this.deleteAnswersButton.show();
		}
	},

	getPossibleAnswers: function () {
		var me = this;
		var isGridQuestion = (['grid'].indexOf(this.questionObj.questionType) !== -1);

		if (this.questionObj.questionType === 'flashcard') {
			this.answerList = Ext.create('Ext.Container', {
				layout: 'vbox',
				cls: 'roundedBox',
				style: 'margin-bottom: 10px;',
				styleHtmlContent: true,
				items: [this.answerListPanel]
			});

			// remove padding around panel
			this.answerList.bodyElement.dom.style.padding = "0";

			// set content
			this.answerListPanel.setContent(this.questionObj.possibleAnswers[0].text, true, true);
		} else {
			this.answerList = Ext.create('ARSnova.view.components.List', {
				hidden: isGridQuestion,
				store: this.answerStore,
				cls: 'roundedBox',

				itemCls: 'arsnova-mathdown x-html answerListButton noPadding',
				itemTpl: new Ext.XTemplate(
					'{formattedText}',
					'<tpl if="this.isFlashcard() === false">',
						'<tpl if="typeof value === \'number\'">',
							'&nbsp;<span class="x-hasbadge {[this.getPointColors(values.value)]}">{[this.formatPoints(values.value)]}</span>',
						'</tpl>',
						'<tpl if="correct === true">',
							'&nbsp;<span class="listCorrectItem x-list-item-correct">&#10003; </span>',
						'</tpl>',
						'</div><div class="x-button x-hasbadge questionDetailsListBadge">',
						'<span class="answersBadgeIcon badgefixed">{answerCount}</span>',
					'</tpl>',
					{
						isFlashcard: function () {
							return me.isFlashcard;
						},
						getPointColors: function (value) {
							if (value < 0) {
								return 'redbadgeicon';
							} else if (value > 0) {
								return 'greenbadgeicon';
							} else {
								return 'greybadgeicon';
							}
						},
						formatPoints: function (value) {
							// Always add a '+' sign for positive values
							return (value > 0 ? "+" : "") + value + " P";
						}
					}
				),
				mode: this.questionObj.questionType === "mc" ? 'MULTI' : 'SINGLE'
			});
		}

		if (this.questionObj.questionType !== "freetext") {
			this.answerFormFieldset.add(this.answerList);
		}

		var prepareGridStatistic = function (questionObj) {
			me.gridStatistic.config.questionObj.image = questionObj.image;
			me.answerFormFieldset.add(me.gridStatistic);
			me.getQuestionAnswers();
		};

		if (this.questionObj.image) {
			if (this.questionObj.image === 'true') {
				this.grid.prepareRemoteImage(this.questionObj._id, false, false, function (dataUrl) {
					me.questionObj.image = dataUrl;

					if (isGridQuestion) {
						prepareGridStatistic(me.questionObj);
					}
				});
				this.uploadView.toggleImagePresent();
				this.grid.show();
			} else if (isGridQuestion) {
				prepareGridStatistic(me.questionObj);
			} else {
				this.grid.setImage(this.questionObj.image);
				this.uploadView.toggleImagePresent();
				this.grid.show();
			}
		}
	},

	getType: function () {
		var self = this;
		if (this.questionObj.questionType) {
			switch (this.questionObj.questionType) {
				case "vote":
					return Messages.EVALUATION;
				case "school":
					return Messages.SCHOOL;
				case "mc":
					return Messages.MC;
				case "abcd":
					return Messages.ABCD;
				case "yesno":
					return Messages.YESNO;
				case "freetext":
					if (self.questionObj.imageQuestion) {
						return Messages.IMAGE_ANSWER_LONG;
					}
					return Messages.FREETEXT;
				case "flashcard":
					return Messages.FLASHCARD;
				case "grid":
					return Messages.GRID;
				default:
					return this.questionObj.questionType;
			}
		} else {
			/**
			 * only for older questions:
			 * try to define the question type
			 */
			if (this.questionObj.possibleAnswers.length === 2) {
				return Messages.YESNO;
			} else if (this.questionObj.possibleAnswers[0].correct) {
				return Messages.MC;
			} else if (this.questionObj.possibleAnswers.length === 5) {
				return Messages.EVALUATION;
			}
			return Messages.SCHOOL;
		}
	},

	getDuration: function () {
		switch (this.questionObj.duration) {
			case 0:
				return Messages.INFINITE;
			case 1:
				return this.questionObj.duration + " " + Messages.MINUTE;
			case "unbegrenzt":
				return Messages.INFINITE;
			case undefined:
				return Messages.INFINITE;
			default:
				return this.questionObj.duration + " " + Messages.MINUTES;
		}
	},

	getQuestionAnswers: function () {
		if (this.questionObj.possibleAnswers) {
			if (this.questionObj.questionType === "freetext") {
				var self = this;

				ARSnova.app.questionModel.getAnsweredFreetextQuestions(sessionStorage.getItem("keyword"), this.questionObj._id, {
					success: function (response) {
						var responseObj = Ext.decode(response.responseText);
						var listItems = responseObj.map(function (item) {
							var v = item;
							var date = new Date(v.timestamp);
							return Ext.apply(item, {
								formattedTime: Ext.Date.format(date, "H:i"),
								groupDate: Ext.Date.format(date, "d.m.y")
							});
						});

						var abstentions = listItems.filter(function (item) {
							return item.abstention;
						});
						var answers = listItems.filter(function (item) {
							return !item.abstention;
						});

						self.answerFormFieldset.removeAll();
						var abstentionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
							ui: 'normal',
							cls: 'standardListButton',
							text: Messages.ABSTENTION
						});
						abstentionButton.setBadge([{badgeText: abstentions.length + '', badgeCls: "answersBadgeIcon"}]);
						var answerCountButton = Ext.create('ARSnova.view.MultiBadgeButton', {
							cls: 'forwardListButton',
							text: Messages.ANSWERS,
							handler: function () {
								ARSnova.app.getController('Statistics').prepareStatistics(self);
							}
						});

						answerCountButton.setBadge([{badgeText: answers.length + '', badgeCls: "answersBadgeIcon"}]);
						self.answerFormFieldset.add([answerCountButton]);
						if (self.questionObj.abstention) {
							self.answerFormFieldset.add([abstentionButton]);
						}
					},
					failure: function () {
						console.log('server-side error');
					}
				});
			} else {
				ARSnova.app.questionModel.countAllAnswers(sessionStorage.getItem('keyword'), this.questionObj._id, {
					success: function (response) {
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						var answers = Ext.decode(response.responseText);

						var abstentionIndex = panel.answerStore.find('id', panel.abstentionInternalId);
						// reset answer badges
						panel.answerStore.each(function (item) {
							item.set('answerCount', 0);
						});

						var i, el,
							abstentionCount = 0;
						if (panel.questionObj.questionType === "mc") {
							var mcAnswerCount = [];
							var answerValuesMapFunc = function (answered) {
								return parseInt(answered, 10);
							};
							var answerValuesForEachFunc = function (selected, index) {
								this[index] = this[index] || 0;
								if (selected === 1) {
									this[index] += 1;
								}
							};
							for (i = 0; i < answers.length; i++) {
								el = answers[i];
								if (!el.answerText) {
									abstentionCount = el.abstentionCount;
									continue;
								}
								var values = el.answerText.split(",").map(answerValuesMapFunc);
								if (values.length !== panel.questionObj.possibleAnswers.length) {
									return;
								}
								for (var j = 0; j < el.answerCount; j++) {
									values.forEach(answerValuesForEachFunc, mcAnswerCount);
								}
							}
							panel.answerStore.each(function (item, index) {
								item.set('answerCount', mcAnswerCount[index] || 0);
							});
							if (abstentionIndex !== -1) {
								panel.answerStore.getAt(abstentionIndex).set('answerCount', abstentionCount);
							}
						} else if (panel.questionObj.questionType === "grid") {
							panel.gridStatistic.answers = answers;
							panel.gridStatistic.setQuestionObj(panel.questionObj);
							panel.gridStatistic.updateGrid();
						} else {
							for (i = 0; i < answers.length; i++) {
								el = answers[i];
								if (!el.answerText) {
									abstentionCount = el.abstentionCount;
									continue;
								}

								var answerIndex = panel.answerStore.find('text', el.answerText);
								if (answerIndex !== -1) {
									panel.answerStore.getAt(answerIndex).set('answerCount', el.answerCount);
								}
							}

							if (abstentionIndex !== -1) {
								panel.answerStore.getAt(abstentionIndex).set('answerCount', abstentionCount);
							}
						}
					},
					failure: function () {
						console.log('server-side error');
					}
				});
			}
		}
	},

	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.subject.getValue(), this.textarea.getValue());
	},

	resetFields: function () {
		var fields = this.down('#contentEditFieldset').items.items;
		fields.forEach(function (field) {
			if (field.reset) {
				field.reset();
			}
			field.setDisabled(true);
		});

		this.contentForm.show();
		this.contentEditForm.hide();

		// reset image view if grid question
		if (this.questionObj.questionType === 'grid') {
			this.answerEditForm.initWithQuestion(Ext.clone(this.questionObj));
		}
		this.hintForSolution.resetOriginalValue();
	},

	formatAnswerText: function () {
		this.answerStore.each(function (item) {
			if (ARSnova.app.globalConfig.parseAnswerOptionFormatting) {
				var md = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
				md.setContent(item.get('text'), true, false, function (html) {
					item.set('formattedText', html.getHtml());
					md.destroy();
				});
			} else {
				item.set('formattedText', Ext.util.Format.htmlEncode(item.get('text')));
			}
		});
	},

	setContentFormContent: function (questionObj) {
		if (questionObj && questionObj.subject && questionObj.text) {
			this.titlePanel.setContent(questionObj.subject.replace(/\./, "\\."), false, true);
			this.contentPanel.setContent(questionObj.text, true, true);
		}
	},

	addAbstentionAnswer: function () {
		if (this.questionObj.abstention) {
			this.abstentionAnswer = this.answerStore.add({
				id: this.abstentionInternalId,
				text: Messages.ABSTENTION,
				correct: false,
				answerCount: 0
			})[0];
			// has to be set this way as it does not conform to the model
			this.abstentionAnswer.set('formattedText', Messages.ABSTENTION);
		}
	},

	setImage: function (image) {
		this.image = image;
		if (image) {
			this.grid.setImage(image);
			this.grid.show();
		} else {
			this.grid.hide();
			this.grid.clearImage();
			// clearImage resets everything, so make sure that some settings remain present
			this.grid.setEditable(false);
			this.grid.setGridIsHidden(true);
		}
	}
});
