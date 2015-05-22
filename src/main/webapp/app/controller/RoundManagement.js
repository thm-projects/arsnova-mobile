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
Ext.define("ARSnova.controller.RoundManagement", {
	extend: 'Ext.app.Controller',

	handleRoundStart: function (questionId, variant, round, startTime, endTime) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundStart(
				questionId, variant, round, startTime, endTime
			);
		} else if (tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundStart(
				questionId, variant, round, startTime, endTime
			);
		}
	},

	handleRoundEnd: function (questionId, variant) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundEnd(questionId, variant);
		} else if (tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundEnd(questionId, variant);
		}
	},

	handleRoundCancel: function (questionId) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundCancel(questionId);
		} else if (tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundCancel(questionId);
		}
	},

	handleQuestionReset: function (questionId, variant) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundReset(questionId, variant);
		} else if (tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundReset(questionId, variant);
		}
	},

	updateQuestionOnRoundStart: function (question, startTime, endTime, round, questionObj) {
		if (!questionObj) {
			question.questionObj.piRound = round;
			question.questionObj.active = true;
			question.questionObj.votingDisabled = false;
			question.questionObj.showStatistic = false;
			question.questionObj.showAnswer = false;
			question.questionObj.piRoundActive = true;
			question.questionObj.piRoundFinished = false;
			question.questionObj.piRoundStartTime = startTime;
			question.questionObj.piRoundEndTime = endTime;
		} else {
			question.questionObj = questionObj;
		}
	},

	updateQuestionOnRoundEnd: function (question, questionObj) {
		if (!questionObj) {
			question.questionObj.votingDisabled = true;
			question.questionObj.piRoundActive = false;
			question.questionObj.piRoundFinished = true;
			question.questionObj.piRoundStartTime = 0;
			question.questionObj.piRoundEndTime = 0;
		} else {
			question.questionObj = questionObj;
		}
	},

	updateQuestionOnRoundCancel: function (question, questionObj) {
		if (!questionObj) {
			if (question.questionObj.piRound === 0 ||
				question.questionObj.piRound === 1) {
				question.questionObj.piRoundFinished = false;
			} else {
				question.questionObj.piRound = 1;
				question.questionObj.piRoundFinished = true;
			}

			question.questionObj.showAnswer = false;
			question.questionObj.votingDisabled = true;
			question.questionObj.piRoundActive = false;
			question.questionObj.piRoundStartTime = 0;
			question.questionObj.piRoundEndTime = 0;
		} else {
			question.questionObj = questionObj;
		}
	},

	updateQuestionOnRoundReset: function (question, questionObj) {
		if (!questionObj) {
			question.questionObj.piRound = 1;
			question.questionObj.active = false;
			question.questionObj.votingDisabled = true;
			question.questionObj.showStatistic = false;
			question.questionObj.piRoundActive = false;
			question.questionObj.piRoundFinished = false;
			question.questionObj.piRoundStartTime = 0;
			question.questionObj.piRoundEndTime = 0;

			if (question.questionObj.questionType === 'freetext') {
				question.questionObj.piRound = 0;
			}
		} else {
			question.questionObj = questionObj;
		}
	},

	handleUserRoundStart: function (questionId, variant, round, startTime, endTime) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		ARSnova.app.getController('RoundManagement').checkAndRemoveCanceledQuestionAnswers(questionId, variant);

		if (tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(
						question, startTime, endTime, round);
					question.countdownTimer.start(startTime, endTime);
					question.countdownTimer.show();
					question.enableQuestion();
				}
			});
		}
	},

	handleSpeakerRoundStart: function (questionId, variant, round, startTime, endTime) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel,
			questionObj = null;

		if (speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(
						question, startTime, endTime, round);
					question.updateEditButtons();
					question.editButtons.hideElements(true);

					if (speakerTabPanel.showcaseQuestionPanel.getActiveItem() === question &&
						mainTabPanel.getActiveItem() === mainTabPanel.tabPanel) {
						question.countdownTimer.start(startTime, endTime);
						question.countdownTimer.show();
					}
				}
			});
		}

		if (mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if (question.questionObj._id === questionId) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(
					question, startTime, endTime, round, questionObj);
				statisticTabPanel.roundManagementPanel.countdownTimer.start(startTime, endTime);
				statisticTabPanel.roundManagementPanel.updateEditButtons();
			}
		}
	},

	handleUserRoundEnd: function (questionId, variant) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if (tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question);
					question.countdownTimer.hide();
					question.disableQuestion();
				}
			});
		}
	},

	handleSpeakerRoundEnd: function (questionId, variant) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel,
			questionObj = null;

		if (speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question);
					question.countdownTimer.hide();
					question.updateEditButtons();
					question.editButtons.changeHiddenState();
				}
			});
		}

		if (mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if (question.questionObj._id === questionId) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question, questionObj);
				statisticTabPanel.roundManagementPanel.changePiRound(questionId);
				statisticTabPanel.roundManagementPanel.updateEditButtons();
			}
		}
	},

	handleUserRoundCancel: function (questionId) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		ARSnova.app.getController('RoundManagement').storeAnsweredQuestionInformation(questionId);

		if (tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundCancel(question);
					question.countdownTimer.hide();
					question.disableQuestion();
				}
			});
		}
	},

	handleSpeakerRoundCancel: function (questionId) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel,
			questionObj = null;

		if (speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundCancel(question);
					questionObj = question.questionObj;
					question.countdownTimer.hide();
					question.updateEditButtons();
					question.editButtons.changeHiddenState();
				}
			});
		}

		if (mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if (question.questionObj._id === questionId) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundCancel(question, questionObj);
				statisticTabPanel.roundManagementPanel.changePiRound(questionId);
				statisticTabPanel.roundManagementPanel.updateEditButtons();
			}
		}
	},

	handleUserRoundReset: function (questionId, variant) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		ARSnova.app.getController('RoundManagement').checkAndRemoveCanceledQuestionAnswers(questionId, variant);
		ARSnova.app.getController('RoundManagement').addUnansweredQuestion(questionId, variant);

		if (tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundReset(question);
					question.countdownTimer.hide();
					question.disableQuestion();
				}
			});
		}
	},

	handleSpeakerRoundReset: function (questionId, variant) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel,
			questionObj = null;

		if (mainTabPanel.getActiveItem() === speakerTabPanel
			&& speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function (question) {
				if (question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundReset(question);
					question.countdownTimer.hide();
					question.updateEditButtons();
					question.editButtons.changeHiddenState();
				}
			});
		}

		if (mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if (question.questionObj._id === questionId) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundReset(question, questionObj);
				statisticTabPanel.roundManagementPanel.changePiRound(questionId);
				statisticTabPanel.roundManagementPanel.updateEditButtons();
			}
		}
	},

	addUnansweredQuestion: function (questionId, variant) {
		var storageKey = variant === 'lecture' ? 'unansweredLectureQuestions' : 'unansweredPreparationQuestions';
		var unansweredQuestionIds = JSON.parse(sessionStorage.getItem(storageKey));

		if (!Ext.Array.contains(unansweredQuestionIds, questionId)) {
			unansweredQuestionIds.push(questionId);
			sessionStorage.setItem(storageKey, JSON.stringify(unansweredQuestionIds));
		}
	},

	checkAndRemoveCanceledQuestionAnswers: function (questionId, variant) {
		var answeredCanceledPiQuestions = JSON.parse(sessionStorage.getItem('answeredCanceledPiQuestions'));

		if (!!answeredCanceledPiQuestions && Array.isArray(answeredCanceledPiQuestions) &&
			Ext.Array.contains(answeredCanceledPiQuestions, questionId)) {
			Ext.Array.remove(answeredCanceledPiQuestions, questionId);

			if (answeredCanceledPiQuestions.length === 0) {
				sessionStorage.removeItem('answeredCanceledPiQuestions');
			} else {
				sessionStorage.setItem('answeredCanceledPiQuestions',
					JSON.stringify(answeredCanceledPiQuestions));
			}
		} else {
			ARSnova.app.getController('RoundManagement').addUnansweredQuestion(questionId, variant);
		}
	},

	storeAnsweredQuestionInformation: function (questionId) {
		var answeredCanceledPiQuestions = JSON.parse(sessionStorage.getItem('answeredCanceledPiQuestions'));
		var unansweredLecQuestionIds = JSON.parse(sessionStorage.getItem('unansweredLectureQuestions'));
		var unansweredPrepQuestionIds = JSON.parse(sessionStorage.getItem('unansweredPreparationQuestions'));

		if (!!unansweredLecQuestionIds && !Ext.Array.contains(unansweredLecQuestionIds, questionId) &&
			!!unansweredPrepQuestionIds && !Ext.Array.contains(unansweredPrepQuestionIds, questionId)) {
			if (!!answeredCanceledPiQuestions && Array.isArray(answeredCanceledPiQuestions)) {
				answeredCanceledPiQuestions.push(questionId);
			} else {
				answeredCanceledPiQuestions = [questionId];
			}

			sessionStorage.setItem('answeredCanceledPiQuestions', JSON.stringify(answeredCanceledPiQuestions));
		}
	}
});
