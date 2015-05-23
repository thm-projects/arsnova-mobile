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
Ext.define('ARSnova.view.speaker.MultiVoteStatusButton', {
	extend: 'ARSnova.view.VoteStatusButton',

	config: {
		questionStore: null,
		isLectureMode: false,
		isPreparationMode: false,
		wording: {
			release: Messages.RELEASE_VOTE,
			releaseAll: Messages.RELEASE_ALL_VOTES,
			confirm: Messages.CONFIRM_CLOSE_ALL_VOTES,
			confirmMessage: Messages.CONFIRM_CLOSE_ALL_VOTES_MESSAGE
		}
	},

	constructor: function () {
		this.callParent(arguments);
		this.checkInitialStatus();
	},

	checkInitialStatus: function () {
		// Initial status is always "open" unless all questions are already closed
		var hasDisabledVotes = false;
		this.getQuestionStore().each(function (item) {
			hasDisabledVotes = hasDisabledVotes || item.get("votingDisabled");
		});

		if (hasDisabledVotes) {
			this.isOpen = false;
			this.button.setToggleFieldValue(false);
		} else {
			this.isOpen = true;
			this.button.setToggleFieldValue(true);
		}
	},

	setLecturerQuestionsMode: function () {
		this.setIsLectureMode(true);
		this.setIsPreparationMode(false);
	},

	setPreparationQuestionsMode: function () {
		this.setIsLectureMode(false);
		this.setIsPreparationMode(true);
	},

	setSingleQuestionMode: function () {
		this.button.setButtonText(this.getWording().release);
	},

	setMultiQuestionMode: function () {
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

		var updateQuestions = function (votingDisabled) {
			questions.forEach(function (q) {
				if (q.get('questionType') !== 'flashcard') {
					q.set("votingDisabled", votingDisabled);
					q.raw.votingDisabled = votingDisabled;
				}
			});
		};

		if (this.isOpen) {
			Ext.Msg.confirm(this.getWording().confirm, this.getWording().confirmMessage, function (buttonId) {
				if (buttonId !== "no") {
					/* close all votings */
					ARSnova.app.questionModel.disableAllQuestionVotings(sessionStorage.getItem("keyword"),
						true,
						this.getIsLectureMode(),
						this.getIsPreparationMode(), {
							success: function () {
								me.isOpen = false;
								updateQuestions(true);
							},
							failure: function () {
								Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
							}
						}
					);
				} else {
					me.button.setToggleFieldValue(true);
				}
			}, this);
		} else {
			/* open all votings */
			ARSnova.app.questionModel.disableAllQuestionVotings(sessionStorage.getItem("keyword"),
				false,
				this.getIsLectureMode(),
				this.getIsPreparationMode(), {
					success: function () {
						me.isOpen = true;
						updateQuestions(false);
					},
					failure: function () {
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
					}
				}
			);
		}
	}
});
