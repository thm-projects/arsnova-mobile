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
Ext.define('ARSnova.view.speaker.MultiQuestionStatusButton', {
	extend: 'ARSnova.view.QuestionStatusButton',

	config: {
		questionStore: null,
		isLectureMode: false,
		isPreparationMode: false,
		wording: {
			release: Messages.RELEASE_QUESTION,	
			releaseAll: Messages.RELEASE_ALL_QUESTIONS,
			confirm: Messages.CONFIRM_CLOSE_ALL_QUESTIONS,
			confirmMessage: Messages.CONFIRM_CLOSE_ALL_QUESTIONS_MESSAGE
		}
	},

	constructor: function () {
		this.callParent(arguments);
		
		this.checkInitialStatus();
	},

	checkInitialStatus: function () {
		// Initial status is always "open" unless all questions are already closed
		var hasActiveQuestions = false;
		this.getQuestionStore().each(function (item) {
			hasActiveQuestions = hasActiveQuestions || item.get("active");
		});
		
		if (hasActiveQuestions) {
			this.isOpen = true;
			this.button.setToggleFieldValue(true);
		} else {
			this.isOpen = false;
			this.button.setToggleFieldValue(false);
		}
	},
	
	setLecturerQuestionsMode: function() {
		this.setIsLectureMode(true);
		this.setIsPreparationMode(false);
	},
	
	setPreparationQuestionsMode: function() {
		this.setIsLectureMode(false);
		this.setIsPreparationMode(true);
	},
	
	setSingleQuestionMode: function() {
		this.button.setButtonText(this.getWording().release);
	},
	
	setMultiQuestionMode: function() {
		this.button.setButtonText(this.getWording().releaseAll);
	},

	changeStatus: function () {
		var me = this;
		
		if (!this.getQuestionStore()) {
			return;
		}

		var questions = [];
		this.getQuestionStore().each(function (question) {
			questions.push(question);
		});

		var updateQuestions = function (active) {
			questions.forEach(function (q) {
				q.set("active", active);
				q.raw.active = active;
			});
		};

		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId != "no") {
					/* close all questions */
					ARSnova.app.getController('Questions').setAllActive({
						active: false,
						isLectureMode: this.getIsLectureMode(),
						isPreparationMode: this.getIsPreparationMode(),
						callback: Ext.Function.createSequence(this.questionClosedSuccessfully, function () {
							updateQuestions(false);
						}, this),
						scope: this
					});
				} else {
					me.button.setToggleFieldValue(true);
				}
			}, this);
		} else {
			/* open all questions */
			ARSnova.app.getController('Questions').setAllActive({
				active: true,
				isLectureMode: this.getIsLectureMode(),
				isPreparationMode: this.getIsPreparationMode(),
				callback: Ext.Function.createSequence(this.questionOpenedSuccessfully, function () {
					updateQuestions(true);
				}, this),
				scope: this
			});
		}
	}
});
