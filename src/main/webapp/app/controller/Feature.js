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
Ext.define("ARSnova.controller.Feature", {
	extend: 'Ext.app.Controller',

	applyFeatures: function () {
		var controller = ARSnova.app.getController('Feature');
		var features = Ext.decode(sessionStorage.getItem("features"));

		var functions = {
			pi: controller.applyPiFeature,
			jitt: controller.applyJittFeature,
			lecture: controller.applyLectureFeature,
			feedback: controller.applyFeedbackFeature,
			interposed: controller.applyInterposedFeature,
			learningProgress: controller.applyLearningProgressFeature
		};

		for (var property in features) {
			if (typeof functions[property] === 'function') {
				functions[property].call(controller, features[property]);
			}
		}

		controller.applyAdditionalChanges(features);
	},

	applyLectureFeature: function (enable) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var tabPanel, container, button, position;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			tabPanel = tP.speakerTabPanel;
			position = 1;
		} else {
			tabPanel = tP.userTabPanel;
			position = 0;
		}

		container = tabPanel.inClassPanel.inClassButtons;
		button = tabPanel.inClassPanel.lectureQuestionButton;
		this.applyButtonChange(container, button, enable, position);
	},

	applyJittFeature: function (enable) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var tabPanel, container, button, position;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			tabPanel = tP.speakerTabPanel;
			position = 2;
		} else {
			tabPanel = tP.userTabPanel;
			position = 1;
		}

		container = tabPanel.inClassPanel.inClassButtons;
		button = tabPanel.inClassPanel.preparationQuestionButton;
		this.applyButtonChange(container, button, enable, position);
	},

	applyFeedbackFeature: function (enable) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		tP.feedbackTabPanel.tab.setHidden(!enable);

		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			var inClassPanel = tP.userTabPanel.inClassPanel;
			var container = inClassPanel.actionButtonPanel;
			this.applyButtonChange(container, inClassPanel.voteButton, enable, 5);
		}
	},

	applyInterposedFeature: function (enable) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var tabPanel, container, button, position;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			tabPanel = tP.speakerTabPanel;
			container = tabPanel.inClassPanel.inClassButtons;
			button = tabPanel.inClassPanel.feedbackQuestionButton;
			tP.feedbackQuestionsPanel.tab.setHidden(!enable);
			position = 0;
		} else {
			tabPanel = tP.userTabPanel;
			container = tabPanel.inClassPanel.inClassButtons;
			button = tabPanel.inClassPanel.myQuestionsButton;
			tabPanel.inClassPanel.feedbackButton.setHidden(!enable);
			position = 2;
		}

		this.applyButtonChange(container, button, enable, position);
	},

	applyLearningProgressFeature: function (enable) {
		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var tabPanel, container, button;

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			tabPanel = tP.speakerTabPanel;
			container = tabPanel.inClassPanel.inClassButtons;
			button = tabPanel.inClassPanel.courseLearningProgressButton;
		} else {
			tabPanel = tP.userTabPanel;
			container = tabPanel.inClassPanel.inClassButtons;
			button = tabPanel.inClassPanel.myLearningProgressButton;
		}

		this.applyButtonChange(container, button, enable, 3);
	},

	applyButtonChange: function (container, button, addButton, index) {
		if (!container || !button) {
			return;
		}

		if (typeof addButton !== 'boolean') {
			addButton = false;
		}

		if (addButton) {
			container.insert(index, button);
		} else {
			container.remove(button, false);
		}
	},

	applyAdditionalChanges: function (features) {
		console.log(features);
		var hasQuestionFeatures = features.lecture || features.jitt;
		var feedbackWithoutInterposed = features.feedback && !features.interposed;
		var isSpeaker = ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER;

		var tP = ARSnova.app.mainTabPanel.tabPanel;
		var tabPanel = isSpeaker ? tP.speakerTabPanel : tP.userTabPanel;

		if (isSpeaker) {
			if (!hasQuestionFeatures) {
				tabPanel.inClassPanel.showcaseActionButton.hide();
				tabPanel.inClassPanel.createAdHocQuestionButton.hide();
			}

			if (features.jitt && !features.lecture) {
				tabPanel.inClassPanel.changeActionButtonsMode('preparation');
				tabPanel.showcaseQuestionPanel.setController(ARSnova.app.getController('PreparationQuestions'));
				tabPanel.showcaseQuestionPanel.setPreparationMode();
				tabPanel.newQuestionPanel.setVariant('preparation');
			} else {
				tabPanel.inClassPanel.changeActionButtonsMode('lecture');
				tabPanel.showcaseQuestionPanel.setController(ARSnova.app.getController('Question'));
				tabPanel.showcaseQuestionPanel.setLectureMode();
				tabPanel.newQuestionPanel.setVariant('lecture');
			}
		} else {
			/** hide questionsPanel tab when session has no question features active **/
			tP.userQuestionsPanel.tab.setHidden(!hasQuestionFeatures);

			/** hide question request button if interposed feature is disabled **/
			tP.feedbackTabPanel.votePanel.questionRequestButton.setHidden(feedbackWithoutInterposed);

			if (!hasQuestionFeatures && features.interposed) {
				// TODO: show interposed questions panel on login
			} else if (!hasQuestionFeatures && !features.interposed && features.feedback) {
				// TODO: show feedback panel on login
			}

			if (features.jitt && !features.lecture) {
				tP.userQuestionsPanel.setPreparationMode();
				tabPanel.inClassPanel.updateQuestionsPanelBadge();
				tP.userQuestionsPanel.tab.setTitle(Messages.TASKS);
			} else {
				tP.userQuestionsPanel.setLectureMode();
				tabPanel.inClassPanel.updateQuestionsPanelBadge();
				tP.userQuestionsPanel.tab.setTitle(Messages.QUESTIONS);
			}
		}

		if (features.learningProgress) {
			var hideQuestionVariantField = false;
			var sessionController = ARSnova.app.getController('Sessions');
			var progressOptions = Object.create(sessionController.getLearningProgressOptions());
			var questionVariant = progressOptions.questionVariant;

			if (!features.lecture || !features.jitt) {
				hideQuestionVariantField = true;
				if (questionVariant !== 'preparation' && !features.lecture) {
					progressOptions.questionVariant = 'preparation';
				} else if (questionVariant !== 'lecture' && !features.jitt) {
					progressOptions.questionVariant = 'lecture';
				}
			}

			tabPanel.learningProgressPanel.setQuestionVariantFieldHidden(hideQuestionVariantField);
			if (progressOptions !== sessionController.getLearningProgressOptions()) {
				sessionController.setLearningProgressOptions(progressOptions);
				tabPanel.learningProgressPanel.refreshQuestionVariantFields();
			}
		}
	}
});
