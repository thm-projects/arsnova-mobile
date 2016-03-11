/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define('ARSnova.view.FreetextQuestion', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.model.Answer',
		'ARSnova.view.CustomMask',
		'ARSnova.view.components.GridImageContainer',
		'ARSnova.view.speaker.form.ImageUploadPanel',
		'ARSnova.view.ImageAnswerPanel'
	],

	config: {
		viewOnly: false,
		padding: '0 0 20 0',

		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	initialize: function () {
		this.callParent(arguments);

		var me = this;
		this.questionObj = this.config.questionObj;
		this.viewOnly = this.config.viewOnly;

		this.customMask = Ext.create('ARSnova.view.CustomMask', {
			mainPanel: this
		});

		this.answerSubject = Ext.create('Ext.form.Text', {
			name: "answerSubject",
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER,
			label: Messages.QUESTION_SUBJECT,
			maxLength: 140
		});

		this.answerText = Ext.create('Ext.form.TextArea', {
			placeHolder: Messages.FORMAT_PLACEHOLDER,
			label: Messages.FREETEXT_ANSWER_TEXT,
			name: 'text',
			maxLength: 2500,
			maxRows: 7,
			hidden: this.questionObj.imageQuestion &&
				!this.questionObj.textAnswerEnabled
		});

		this.markdownEditPanel = Ext.create('ARSnova.view.MarkDownEditorPanel', {
			processElement: this.answerText,
			hidden: this.questionObj.imageQuestion &&
				!this.questionObj.textAnswerEnabled
		});

		// Create standard panel with framework support
		this.questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
		this.updateQuestionText();
		this.hintIcon = Ext.create('Ext.Button', {
			cls: 'sessionInfoButton maskClickable',
			iconCls: 'info',
			scope: this,
			style: 'float: right',
			hidden: !(this.questionObj.hint),
			handler: function (button) {
				me.hintPanel.show();
			}
		});

		this.questionContainer = Ext.create('Ext.Container', {
			cls: "roundedBox questionPanel",
			items: [this.hintIcon, this.questionPanel]
		});

		this.hintPanel = Ext.create('ARSnova.view.components.MarkdownMessageBox', {
			content: this.questionObj.hint
		});

		this.solutionPanel = Ext.create('ARSnova.view.components.MarkdownMessageBox', {
			content: this.questionObj.solution
		});

		this.buttonContainer = Ext.create('Ext.Container', {
			layout: {
				type: 'hbox',
				align: 'stretch',
				pack: 'center'
			},
			defaults: {
				style: {
					margin: '10px'
				}
			},
			hidden: this.viewOnly || !!this.questionObj.userAnswered || this.questionObj.isAbstentionAnswer,
			items: [{
				flex: 1,
				xtype: 'button',
				ui: 'confirm',
				cls: 'saveButton noMargin',
				text: Messages.SAVE,
				handler: this.saveHandler,
				scope: this
			}, !this.questionObj.abstention ? {hidden: true} : {
				flex: 1,
				xtype: 'button',
				ui: 'action',
				cls: 'saveButton noMargin',
				text: Messages.ABSTENTION,
				handler: this.abstentionHandler,
				scope: this
			}]
		});

		this.previewButton = Ext.create('Ext.Button', {
			text: Ext.os.is.Desktop ?
				Messages.QUESTION_PREVIEW_BUTTON_TITLE_DESKTOP :
				Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'action',
			hidden: this.viewOnly,
			cls: 'centerButton previewButton',
			scope: this,
			handler: function () {
				this.previewHandler();
			}
		});

		this.buttonPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}, this.buttonContainer]
		});

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			docked: 'top',
			hidden: true,
			viewOnly: true,
			viewOnlyOpacity: ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER ?
				0.9 : 0.75
		});

		var innerItems = [
			this.markdownEditPanel,
			this.answerSubject,
			this.answerText
		];

		if (this.questionObj.image) {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				editable: false,
				gridIsHidden: true,
				style: 'margin-bottom: 10px'
			});
			this.grid.prepareRemoteImage(me.questionObj);
		}

		if (this.questionObj.imageQuestion) {
			this.gridQuestion = Ext.create('ARSnova.view.components.GridImageContainer', {
				hidden: true,
				gridIsHidden: true,
				editable: false,
				style: "margin-top: 5px;"
			});

			this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
				handlerScope: this,
				addRemoveButton: true,
				activateTemplates: false,
				urlUploadHandler: this.setImage,
				fsUploadHandler: this.setImage,
				style: 'margin-bottom: 30px',
				disableURLUpload: true
			});

			this.needImageLabel = Ext.create('Ext.Label', {
				html: Messages.IMAGE_NEEDED,
				style: "width: 100%; text-align: center;"
			});

			innerItems = innerItems.concat([
				this.uploadView,
				this.gridQuestion,
				this.needImageLabel
			]);
		}

		/* update disabled state on initialize */
		if (this.questionObj.votingDisabled) {
			this.disableQuestion(false);
		}

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.editButtons = Ext.create('ARSnova.view.speaker.ShowcaseEditButtons', {
				questionObj: this.questionObj,
				buttonClass: 'smallerActionButton'
			});

			this.on('painted', function () {
				this.updateEditButtons();
			});
		}

		this.formPanel = Ext.create('Ext.form.Panel', {
			xtype: 'formpanel',
			scrollable: null,
			submitOnAction: false,
			items: [
				this.questionContainer,
				this.questionObj.image ? this.grid : {},
				this.viewOnly ? {} : {
					xtype: 'fieldset',
					items: innerItems
				}, this.buttonPart
			]
		});

		this.add([
			this.countdownTimer,
			Ext.create('Ext.Panel', {
				items: [this.formPanel]
			}), this.editButtons ? this.editButtons : {}
		]);

		this.on('activate', function () {
			this.checkPiRoundActivation();

			if (this.isDisabled() || this.questionObj.votingDisabled) {
				this.disableQuestion(false);
			}

			if (this.viewOnly) {
				this.setAnswerCount();
			}

			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.editButtons.changeHiddenState();
			}
		});

		this.on('preparestatisticsbutton', function (button) {
			var scope = me;
			button.scope = this;
			button.setHandler(function () {
				scope.statisticButtonHandler(scope);
			});
		});

		this.on('deactivate', function () {
			this.countdownTimer.stop();
		});
	},

	updateEditButtons: function () {
		this.editButtons.questionObj = this.questionObj;
		this.editButtons.updateData(this.questionObj);
	},

	setImage: function (image) {
		if (this.gridQuestion) {
			this.answerImage = image;
			this.gridQuestion.setImage(image);
			var me = this;
			if (this.answerImage) {
				me.gridQuestion.show();
				me.needImageLabel.hide();
				me.setGridConfiguration(me.gridQuestion);
			} else {
				me.needImageLabel.show();
				me.gridQuestion.hide();
				me.gridQuestion.clearImage();
				me.setGridConfiguration(me.gridQuestion);
			}
		}
	},

	setGridConfiguration: function (image) {
		this.gridQuestion.setEditable(false);
		this.gridQuestion.setGridIsHidden(true);
	},

	checkPiRoundActivation: function () {
		if (this.questionObj.piRoundActive) {
			this.countdownTimer.start(this.questionObj.piRoundStartTime, this.questionObj.piRoundEndTime);
			this.countdownTimer.show();
		} else {
			this.countdownTimer.hide();
		}
	},

	updateQuestionText: function () {
		var questionString = '\n' + this.questionObj.text + '\n';
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if (screenWidth < 520 && this.viewOnly) {
			this.questionPanel.addCls('allCapsHeader');
			questionString = this.questionObj.subject.replace(/\./, "\\.")
			+ '\n\n' // inserts one blank line between subject and text
			+ this.questionObj.text;
		} else {
			this.questionPanel.removeCls('allCapsHeader');
		}

		this.questionPanel.setContent(questionString, true, true);
	},

	getQuestionTypeMessage: function () {
		return this.questionObj.subject;
	},

	setAnswerCount: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		ARSnova.app.answerModel.getAnswerAndAbstentionCount(this.questionObj._id, {
			success: function (response) {
				var numAnswers = JSON.parse(response.responseText),
					answerCount = parseInt(numAnswers[0]),
					abstentionCount = parseInt(numAnswers[1]);

				if (!answerCount && abstentionCount) {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(abstentionCount, Messages.ABSTENTION);
				} else {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(answerCount);
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	saveHandler: function (button, event) {
		if (this.isEmptyAnswer()) {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.MISSING_INPUT);
			return;
		}

		if (this.questionObj.imageQuestion) {
			Ext.Msg.confirm('', Messages.PICTURE_RIGHT_INFORMATION, function (button) {
				if (button === "yes") {
					this.storeAnswer();
					this.buttonContainer.setHidden(true);
				}
			}, this);
		} else {
			Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
				if (button === "yes") {
					this.storeAnswer();
					this.buttonContainer.setHidden(true);
				}
			}, this);
		}
	},

	statisticButtonHandler: function (scope) {
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.questionObj = this.editButtons.questionObj;
		}

		ARSnova.app.getController('Statistics').prepareStatistics(scope);
	},

	abstentionHandler: function (button, event) {
		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button === "yes") {
				this.storeAbstention();
				this.buttonContainer.setHidden(true);
			}
		}, this);
	},

	selectAbstentionAnswer: function () {},

	isEmptyAnswer: function () {
		return this.answerSubject.getValue().trim() === "" || (this.answerText.getValue().trim() === "" && this.questionObj.textAnswerEnabled) || (!this.answerImage && this.questionObj.imageQuestion);
	},

	saveAnswer: function (answer) {
		var me = this;

		answer.saveAnswer(me.questionObj._id, {
			success: function () {
				var questionsArr = Ext.decode(localStorage.getItem(me.questionObj.questionVariant + 'QuestionIds'));
				if (questionsArr.indexOf(me.questionObj._id) === -1) {
					questionsArr.push(me.questionObj._id);
				}
				localStorage.setItem(me.questionObj.questionVariant + 'QuestionIds', Ext.encode(questionsArr));
				if (answer.get('abstention')) {
					me.questionObj.isAbstentionAnswer = true;
				} else {
					me.questionObj.userAnswered = true;
				}

				if (me.questionObj.imageQuestion) {
					me.uploadView.hide();
				}

				me.disableQuestion(true);
				ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
			},
			failure: function (response, opts) {
				console.log('server-side error');
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
				Ext.Msg.doComponentLayout();
			}
		});
	},

	storeAnswer: function () {
		var me = this;

		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer', {
					answerSubject: me.answerSubject.getValue(),
					answerText: me.answerText.getValue(),
					answerImage: me.answerImage
				});

				me.saveAnswer(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('answerSubject', me.answerSubject.getValue());
				answer.set('answerText', me.answerText.getValue());
				answer.set('answerImage', me.answerImage);
				answer.set('abstention', false);
				me.saveAnswer(answer);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	storeAbstention: function () {
		var me = this;

		ARSnova.app.answerModel.getUserAnswer(this.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer', {
					abstention: true
				});

				me.saveAnswer(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				answer.set('abstention', true);
				me.saveAnswer(answer);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	disableQuestion: function (afterInitialization) {
		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			this.setDisabled(true);
			this.mask(this.customMask);

			if (afterInitialization) {
				var carousel = this.getParent();
				carousel.getIndicator().setIndicatorColorAnswered(carousel.getActiveIndex(), true);
			}

			if (this.questionObj.imageQuestion) {
				this.uploadView.hide();
			}

			if (this.questionObj.userAnswered) {
				this.customMask.setTextMessage(Messages.MASK_ALREADY_ANSWERED, 'alreadyAnswered');
				// Display icon with sample solution popup
				if (this.questionObj.showAnswer) {
					this.hintIcon.setHidden(!this.questionObj.solution);
					this.hintIcon.setIconCls('icon-bullhorn');
					this.hintIcon.setHandler(function (button) {
						this.solutionPanel.show();
					});
				} else {
					this.hintIcon.setHidden(true);
				}
			} else if (this.questionObj.isAbstentionAnswer) {
				this.customMask.setTextMessage(Messages.MASK_IS_ABSTENTION_ANSWER, 'alreadyAnswered');
			} else if (this.questionObj.votingDisabled) {
				this.customMask.setTextMessage(Messages.MASK_VOTE_CLOSED, 'voteClosed');
			}
		}
	},

	enableQuestion: function () {
		if (!this.questionObj.userAnswered) {
			this.setDisabled(false);
			this.setMasked(false);

			if (this.questionObj.imageQuestion) {
				this.uploadView.show();
			}
		}
	},

	setZoomLevel: function (size) {
		this.questionPanel.setStyle('font-size: ' + size + '%;');
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
	},

	setAnswerText: function (subject, answer, answerThumbnailImage) {
		this.answerSubject.setValue(subject);
		this.answerText.setValue(answer);
		this.setImage(answerThumbnailImage);
	},

	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.answerSubject.getValue(), this.answerText.getValue());
	}
});
