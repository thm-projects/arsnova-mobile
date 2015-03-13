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

	handleRoundStart: function(object) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if(tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundStart(object);
		} else if(tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundStart(object);
		}
	},

	handleRoundEnd: function(questionId) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if(tabPanel.userTabPanel) {
			ARSnova.app.getController('RoundManagement').handleUserRoundEnd(questionId);
		} else if(tabPanel.speakerTabPanel) {
			ARSnova.app.getController('RoundManagement').handleSpeakerRoundEnd(questionId);
		}
	},

	updateQuestionOnRoundStart: function(question, object) {
		question.questionObj.active = true;
		question.questionObj.piRoundActive = true;
		question.questionObj.piRoundStartTime = object.startTime;
		question.questionObj.piRoundEndTime = object.endTime;
	},

	updateQuestionOnRoundEnd: function(question) {
		question.questionObj.active = false;
		question.questionObj.piRoundActive = false;
		question.questionObj.piRoundStartTime = 0;
		question.questionObj.piRoundEndTime = 0;
	},

	handleUserRoundStart: function(object) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if(tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function(question) {
				if(question.getItemId() === object.id) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(question, object);
					question.countdownTimer.start(object.startTime, object.endTime);
					question.countdownTimer.show();
				}
			});
		}
	},

	handleSpeakerRoundStart: function(object) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel;

		if(speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function(question) {
				if(question.getItemId() === object.id) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(question, object);
					question.updateEditButtons();
					question.editButtons.hide();

					if(speakerTabPanel.showcaseQuestionPanel.getActiveItem() === question &&
						mainTabPanel.getActiveItem() === mainTabPanel.tabPanel) {
						question.countdownTimer.start(object.startTime, object.endTime);
						question.countdownTimer.show();
					}
				}
			});
		}

		if(mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if(question.questionObj._id === object.id) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundStart(question, object);
				statisticTabPanel.peerInstructionPanel.countdownTimer.start(object.startTime, object.endTime);
				statisticTabPanel.peerInstructionPanel.updateEditButtons();
			}
		}
	},

	handleUserRoundEnd: function(questionId) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		if(tabPanel.getActiveItem() === tabPanel.userQuestionsPanel) {
			var questions = tabPanel.userQuestionsPanel.getInnerItems();

			questions.forEach(function(question) {
				if(question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question);
					question.countdownTimer.hide();
					question.disableQuestion();
				}
			});
		}
	},

	handleSpeakerRoundEnd: function(questionId) {
		var mainTabPanel = ARSnova.app.mainTabPanel,
			speakerTabPanel = mainTabPanel.tabPanel.speakerTabPanel,
			statisticTabPanel = speakerTabPanel.statisticTabPanel;

		if(speakerTabPanel.getActiveItem() === speakerTabPanel.showcaseQuestionPanel) {
			var questions = speakerTabPanel.showcaseQuestionPanel.getInnerItems();

			questions.forEach(function(question) {
				if(question.getItemId() === questionId) {
					ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question);
					question.countdownTimer.hide();
					question.updateEditButtons();
					question.editButtons.show();
				}
			});
		}

		if(mainTabPanel.getActiveItem() === statisticTabPanel) {
			var question = speakerTabPanel.questionStatisticChart;

			if(question.questionObj._id === questionId) {
				ARSnova.app.getController('RoundManagement').updateQuestionOnRoundEnd(question);
				statisticTabPanel.peerInstructionPanel.changePiRound(questionId);
				statisticTabPanel.peerInstructionPanel.updateEditButtons();
			}
		}
	}
});
