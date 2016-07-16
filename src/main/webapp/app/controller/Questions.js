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
Ext.define("ARSnova.controller.Questions", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Question',
		'ARSnova.view.speaker.QuestionDetailsPanel',
		'ARSnova.view.FreetextDetailAnswer',
		'ARSnova.view.feedbackQuestions.DetailsPanel'
	],

	index: function (options) {
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
	},

	lectureIndex: function (options) {
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.setLectureMode();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.setTitle(Messages.LECTURE_QUESTIONS);
		if (options && options.renew) {
			ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.renew(options.ids);
		}
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
	},

	preparationIndex: function (options) {
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.setPreparationMode();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.setTitle(Messages.PREPARATION_QUESTIONS);
		if (options && options.renew) {
			ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.renew(options.ids);
		}
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
	},

	listQuestions: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.newQuestionPanel.setVariant('lecture');
		sTP.sortQuestionsPanel.setController(this);
		sTP.sortSubjectsPanel.setController(this);
		sTP.audienceQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setLectureMode();
		sTP.audienceQuestionPanel.prepareQuestionList();
		sTP.audienceQuestionPanel.voteStatusButton.setLecturerQuestionsMode();
		sTP.audienceQuestionPanel.questionStatusButton.setLecturerQuestionsMode();
		sTP.audienceQuestionPanel.toolbar.getTitle().setTitle(Messages.LECTURE_QUESTIONS);
		sTP.audienceQuestionPanel.newQuestionButton.text = Messages.NEW_LECTURE_QUESTION;
		sTP.animateActiveItem(sTP.audienceQuestionPanel, 'slide');
	},

	getQuestions: function () {
		ARSnova.app.questionModel.getLectureQuestions.apply(ARSnova.app.questionModel, arguments);
	},

	deleteAnswers: function () {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAnswers.apply(question, arguments);
	},

	deleteAllQuestionsAnswers: function (callbacks) {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllQuestionsAnswers(sessionStorage.getItem("keyword"), callbacks);
	},

	destroyAll: function () {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllLectureQuestions.apply(question, arguments);
	},

	getTotalAnswerCountByQuestion: function () {
		var question = Ext.create('ARSnova.model.Question');
		question.getTotalAnswerCountByQuestion.apply(question, arguments);
	},

	getAllRoundAnswerCountByQuestion: function (questionId, callbacks) {
		ARSnova.app.questionModel.getAllRoundAnswerCountByQuestion(questionId, callbacks);
	},

	listFeedbackQuestions: function (animation) {
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
			ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel,
			animation || 'slide'
		);
	},

	saveUnansweredLectureQuestions: function (questionIds) {
		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			sessionStorage.setItem('unansweredLectureQuestions', JSON.stringify(questionIds));
		}
	},

	saveUnansweredPreparationQuestions: function (questionIds) {
		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			sessionStorage.setItem('unansweredPreparationQuestions', JSON.stringify(questionIds));
		}
	},

	add: function (options) {
		var question = Ext.create('ARSnova.model.Question', {
			type: options.type,
			questionType: options.questionType,
			questionVariant: options.questionVariant,
			sessionKeyword: options.sessionKeyword,
			subject: options.subject,
			text: options.text,
			active: options.active,
			number: options.number,
			releasedFor: options.releasedFor,
			possibleAnswers: options.possibleAnswers,
			noCorrect: options.noCorrect,
			abstention: options.abstention,
			fixedAnswer: options.fixedAnswer,
			strictMode: options.strictMode,
			rating: options.rating,
			correctAnswer: options.correctAnswer,
			ignoreCaseSensitive: options.ignoreCaseSensitive,
			ignoreWhitespaces: options.ignoreWhitespaces,
			ignorePunctuation: options.ignorePunctuation,
			gridSize: options.gridSize,
			offsetX: options.offsetX,
			offsetY: options.offsetY,
			zoomLvl: options.zoomLvl,
			image: options.image,
			fcImage: options.fcImage,
			gridOffsetX: options.gridOffsetX,
			gridOffsetY: options.gridOffsetY,
			gridZoomLvl: options.gridZoomLvl,
			gridSizeX: options.gridSizeX,
			gridSizeY: options.gridSizeY,
			gridIsHidden: options.gridIsHidden,
			imgRotation: options.imgRotation,
			toggleFieldsLeft: options.toggleFieldsLeft,
			numClickableFields: options.numClickableFields,
			thresholdCorrectAnswers: options.thresholdCorrectAnswers,
			cvIsColored: options.cvIsColored,
			gridLineColor: options.gridLineColor,
			numberOfDots: options.numberOfDots,
			gridType: options.gridType,
			showStatistic: options.showStatistic,
			votingDisabled: options.votingDisabled,
			scaleFactor: options.scaleFactor,
			gridScaleFactor: options.gridScaleFactor,
			timestamp: options.timestamp,
			imageQuestion: options.imageQuestion,
			textAnswerEnabled: options.textAnswerEnabled,
			hint: options.hint,
			solution: options.solution
		});
		question.set('_id', undefined);
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		panel.query('textfield').forEach(function (el) {
			el.removeCls("required");
		});

		var error = false;
		var gridError = false;
		var answersError = false;
		var subjectError = false;
		var checkedError = false;
		var questionError = false;
		var freetextError = false;

		var validation = question.validate();
		if (!validation.isValid()) {
			validation.items.forEach(function (el) {
				panel.down('textfield[name=' + el.getField() + ']').addCls("required");

				if (el._field === "subject") {
					subjectError = true;
				} else if (el._field === "text") {
					questionError = true;
				}

				error = true;
			});
		}
		switch (question.get('questionType')) {
			case 'vote':
				panel.voteQuestion.query('textfield').forEach(function (el) {
					if (el.getValue().trim() === "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'flashcard':
				if (panel.flashcardQuestion.isEmpty()) {
					panel.flashcardQuestion.markEmptyFields();
					answersError = true;
					error = true;
				}
				break;
			case 'school':
				panel.schoolQuestion.query('textfield').forEach(function (el) {
					if (el.getValue().trim() === "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'mc':
			case 'abcd':
				var answerCount = 0;
				var checkedCount = 0;
				var questionComponent = question.get('questionType') === 'mc' ?
						panel.multipleChoiceQuestion : panel.abcdQuestion;

				questionComponent.answerComponents.forEach(function (el) {
					var value = el.getValue().toString().trim();
					if (!el.getHidden() && value !== "") {
						if (el.isChecked()) {
							checkedCount++;
						}
						answerCount++;
					}
				});
				if (answerCount < 2) {
					error = true;
					answersError = true;
				} else if (checkedCount === 0) {
					checkedError = true;
				}
				break;
			case 'grid':
				if (panel.gridQuestion.grid) {
					if (!panel.gridQuestion.grid.getImageFile()) {
						error = true;
						gridError = true;
					}
				} else {
					error = true;
					gridError = true;
				}
				break;
			case 'freetext':
				if (question.data.fixedAnswer && question.data.correctAnswer.trim() === "") {
					freetextError = true;
				}
				break;
		}

		if (error) {
			var message = Messages.MISSING_INPUTS + '<ul class="newQuestionWarning"><br>';

			if (subjectError) {
				message += '<li>' + Messages.MISSING_SUBJECT + '</li>';
			}
			if (questionError) {
				message += '<li>' + Messages.MISSING_QUESTION + '</li>';
			}
			if (gridError) {
				message += '<li>' + Messages.MISSING_IMAGE + '</li>';
			}
			if (answersError && question.get('questionType') === 'flashcard') {
				message += '<li>' + Messages.MISSING_FLASHCARD + '</li>';
			}
			if (freetextError) {
				message += '<li>' + Messages.MISSING_FREETEXT_ANSWER + '</li>';
			} else if (answersError) {
				message += '<li>' + Messages.MISSING_ANSWERS + '</li>';
			}

			Ext.Msg.alert(Messages.NOTIFICATION, message + '</ul>');
			options.saveButton.enable();
			return;
		} else if (checkedError) {
			Ext.Msg.show({
				title: Messages.NOTIFICATION,
				message: Messages.NO_ANSWER_MARKED_CORRECT_MESSAGE,
				buttons: [{
					text: Messages.NO_ANSWER_MARKED_CORRECT_OPTION_YES,
					itemId: 'yes',
					ui: 'action'
				}, {
					text: Messages.NO_ANSWER_MARKED_CORRECT_OPTION_NO,
					itemId: 'no',
					ui: 'decline'
				}],
				fn: function (buttonId) {
					if (buttonId === 'yes') {
						question.saveSkillQuestion({
							success: options.successFunc,
							failure: options.failureFunc
						});
					} else {
						options.saveButton.enable();
					}
				}
			});

			return;
		}

		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SAVE);
		question.saveSkillQuestion({
			success: function (response, eOpts) {
				options.successFunc(response, eOpts);
				hideLoadMask();
			},
			failure: function (response, eOpts) {
				options.failureFunc(response, eOpts);
				hideLoadMask();
			}
		});
	},

	details: function (options) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var lastDetailsPanel = sTP.questionDetailsPanel;

		sTP.questionDetailsPanel = Ext.create('ARSnova.view.speaker.QuestionDetailsPanel', {
			index: options.index,
			question: options.question
		});
		sTP.animateActiveItem(sTP.questionDetailsPanel, {
			type: 'slide',
			direction: options.direction || 'left',
			listeners: {
				animationend: function () {
					if (lastDetailsPanel) {
						lastDetailsPanel.destroy();
					}
				}
			}
		});
	},

	freetextDetailAnswer: function (options) {
		var mainTabPanel = ARSnova.app.mainTabPanel;

		options.answer.deletable = ARSnova.app.isSessionOwner;
		var freetextDetailAnswerPanel = Ext.create('ARSnova.view.FreetextDetailAnswer', {
			sTP: mainTabPanel,
			answer: options.answer,
			questionObj: options.panel.questionObj
		});

		if (ARSnova.app.isSessionOwner && !options.answer.read) {
			options.answer.read = true;
			ARSnova.app.socket.readFreetextAnswer(options.answer);
		}

		mainTabPanel.animateActiveItem(freetextDetailAnswerPanel, {
			type: 'slide',
			direction: 'left',
			duration: 700
		}, 'slide');
	},

	detailsFeedbackQuestion: function (options) {
		options.question.read();
		var newPanel = Ext.create('ARSnova.view.feedbackQuestions.DetailsPanel', {
			question: options.question,
			lastPanel: options.lastPanel
		});
		ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.animateActiveItem(newPanel, 'slide');
	},

	setActive: function (options) {
		ARSnova.app.questionModel.getSkillQuestion(options.questionId, {
			success: function (response) {
				var question = Ext.create('ARSnova.model.Question', Ext.decode(response.responseText));
				question.set('active', options.active);

				question.publishSkillQuestion({
					success: function (response) {
						var questionStatus = options.statusButton;

						if (options.active) {
							questionStatus.questionOpenedSuccessfully();
						} else {
							questionStatus.questionClosedSuccessfully();
						}
					},
					failure: function (records, operation) {
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
					}
				});
			},
			failure: function (records, operation) {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM);
			}
		});
	},

	setAllActive: function (options) {
		ARSnova.app.questionModel.publishAllSkillQuestions(sessionStorage.getItem("keyword"),
				options.active, options.isLectureMode, options.isPreparationMode, {
			success: function () {
				options.callback.apply(options.scope);
			},
			failure: function () {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
			}
		});
	},

	handleVotingLock: function (lockedQuestions, disable) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();
			var questionIds = new Array(lockedQuestions.length);

			lockedQuestions.forEach(function (q) {
				questionIds.push(q._id);
			});

			questions.forEach(function (question) {
				if (questionIds.indexOf(question.getItemId()) !== -1 &&
					question.questionObj.questionType !== 'flashcard') {
					question.questionObj.votingDisabled = disable;
					question.countdownTimer.hide();

					if (disable) {
						question.disableQuestion();
					} else {
						question.enableQuestion();
					}

					if (tabPanel.userQuestionsPanel.getActiveItem() === question && disable) {
						Ext.toast(Messages.ACTIVE_QUESTION_VOTING_CLOSED, 2000);
					}
				}
			});
		}
	},

	handleAnswerCountChange: function (id, answerCount, abstentionCount) {
		var mainTabPanel = ARSnova.app.mainTabPanel;
		var tP = mainTabPanel.tabPanel;
		var panel = tP.userQuestionsPanel || tP.speakerTabPanel;

		if (tP.getActiveItem() === tP.speakerTabPanel) {
			var showcasePanel = panel.showcaseQuestionPanel;

			if (tP.speakerTabPanel.getActiveItem() === showcasePanel) {
				if (showcasePanel.getActiveItem().getItemId() === id) {
					if (showcasePanel.getActiveItem().questionObj.questionType === 'slide') {
						showcasePanel.toolbar.setAnswerCounter(answerCount, Messages.COMMENT);
					} else if (!answerCount && abstentionCount) {
						showcasePanel.toolbar.setAnswerCounter(abstentionCount, Messages.ABSTENTION);
					} else {
						showcasePanel.toolbar.updateAnswerCounter(answerCount);
					}
				}
			}
		}
	},

	adHoc: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.sortQuestionsPanel.setController(this);
		sTP.audienceQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setController(this);
		sTP.newQuestionPanel.setVariant('lecture');
		sTP.animateActiveItem(sTP.newQuestionPanel, {
			type: 'slide',
			duration: 700
		});

		/* change the backButton-redirection to inClassPanel,
		 * but only for one function call */
		var backButton = sTP.newQuestionPanel.down('button[ui=back]');
		backButton.setHandler(function () {
			var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.animateActiveItem(sTP.inClassPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700
			});
		});
		backButton.setText(Messages.SESSION);
		sTP.newQuestionPanel.on('deactivate', function (panel) {
			panel.backButton.handler = function () {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			};
			panel.backButton.setText(Messages.QUESTIONS);
		}, this, {single: true});
	},

	deleteAllInterposedQuestions: function (callbacks) {
		ARSnova.app.questionModel.deleteAllInterposedQuestions(sessionStorage.getItem('keyword'), callbacks);
	},

	showLearningProgress: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var uTP = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
		var tapPanel = uTP;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER && sTP) {
			tapPanel = sTP;
		}

		tapPanel.animateActiveItem(tapPanel.learningProgressPanel, {
			type: 'slide'
		});
	},

	leaveLearningProgress: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var uTP = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
		var tapPanel = uTP;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER && sTP) {
			tapPanel = sTP;
		}

		tapPanel.animateActiveItem(tapPanel.inClassPanel, {
			type: 'slide',
			direction: 'right'
		});
	},

	getSubjectSort: function (options) {
		ARSnova.app.questionModel.getSubjectLectureSort(sessionStorage.getItem('keyword'),
			options.callbacks);
	},

	setSubjectSort: function (options) {
		ARSnova.app.questionModel.setSubjectLectureSort(sessionStorage.getItem('keyword'),
			options.sortType, options.subjects, options.callbacks);
	},

	getQuestionSort: function (options) {
		ARSnova.app.questionModel.getQuestionLectureSort(sessionStorage.getItem('keyword'),
			options.subject, options.callbacks);
	},

	setQuestionSort: function (options) {
		ARSnova.app.questionModel.setQuestionLectureSort(sessionStorage.getItem('keyword'),
			options.subject, options.sortType, options.questionIDs, options.callbacks);
	}
});
