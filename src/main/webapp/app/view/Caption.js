/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.Caption', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.MultiBadgeButton'],

	config: {
		translation: {
			active: Messages.OPEN_SESSION,
			inactive: Messages.CLOSED_SESSION
		},
		badgeTranslation: {
			feedback: Messages.COMMENTS,
			unreadFeedback: Messages.UNREAD_QUESTIONS_FROM_STUDENTS,
			flashcards: Messages.FLASHCARDS,
			questions: Messages.QUESTIONS,
			answers: Messages.ANSWERS
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.listButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'small',
			text: "",
			disabled: true,
			disabledCls: '',
			cls: 'forwardListButton caption',
			style: this.getStyle()
		});

		var minScreenWidth = this.config.minScreenWidth ?
			this.config.minScreenWidth : 410;

		this.add([].concat(window.innerWidth > minScreenWidth ? [{
			cls: 'gravure',
			style: {
				fontSize: "0.6em"
			},
			html: Messages.LEGEND
		}, this.listButton] : []));
	},

	explainStatus: function (items) {
		var listButtonText = "";

		var hasActiveItems = false;
		var hasInactiveItems = false;
		var hasVotingDisabledItems = false;
		items.forEach(function (item) {
			hasActiveItems = hasActiveItems || item.active;
			hasInactiveItems = hasInactiveItems || !item.active;

			if (item.active && item.votingDisabled) {
				hasVotingDisabledItems = hasVotingDisabledItems || item.votingDisabled;
			}
		});

		var activeText = "";
		if (hasActiveItems) {
			activeText = this.getTranslation().active;
		}
		var inactiveText = "";
		if (hasInactiveItems) {
			inactiveText = "<span class='isInactive'>" + this.getTranslation().inactive + "</span>";
		}
		var votingDisabledText = "";
		if (hasVotingDisabledItems) {
			votingDisabledText = "<span class='isVoteInactive'>" + this.getTranslation().disabledVote + "</span>";
		}

		if (hasActiveItems) {
			listButtonText = activeText;
		}
		if (hasVotingDisabledItems) {
			listButtonText = listButtonText ?
				listButtonText + " / " + votingDisabledText :
				votingDisabledText;
		}
		if (hasInactiveItems) {
			listButtonText = listButtonText ?
				listButtonText + " / " + inactiveText :
				inactiveText;
		}

		this.listButton.setText(listButtonText);
	},

	summarize: function (sessions, options) {
		var flat = [].concat.apply([], sessions);
		this.explainBadges(flat, options);
		this.explainStatus(flat);
	},

	explainBadges: function (badges, opt) {
		var options = Ext.apply({}, opt, {
			questions: true,
			answers: true,
			interposed: true,
			unreadInterposed: true,
			flashcards: true,
			unanswered: false
		});

		var hasFeedbackQuestions = false;
		var hasUnreadFeedbackQuestions = false;
		var hasQuestions = false;
		var hasUnansweredQuestions = false;
		var hasFlashcards = false;
		var hasAnswers = false;
		badges.forEach(function (item) {
			if (Ext.isNumber(item)) {
				hasQuestions = hasQuestions || item > 0;
			} else {
				hasFeedbackQuestions = hasFeedbackQuestions || item.hasFeedbackQuestions || item.numInterposed > 0;
				hasUnreadFeedbackQuestions = hasUnreadFeedbackQuestions || item.hasUnreadFeedbackQuestions || item.numUnreadInterposed > 0;
				hasQuestions = hasQuestions || item.hasQuestions || item.numQuestions > 0 || item.numPrepQuestions > 0;
				hasUnansweredQuestions = hasUnansweredQuestions || item.hasUnansweredQuestions || item.numUnanswered > 0;
				hasFlashcards = hasFlashcards || item.hasFlashcards || item.numFlashcards > 0;
				hasAnswers = hasAnswers || item.hasAnswers || item.numAnswers > 0 || item.numPrepAnswers > 0;
			}
		});

		this.listButton.setBadge([{
				badgeText: options.interposed && hasFeedbackQuestions ? this.getBadgeTranslation().feedback : "",
				badgeCls: "feedbackQuestionsBadgeIcon"
			}, {
				badgeText: (options.unreadInterposed && hasUnreadFeedbackQuestions) ? this.getBadgeTranslation().unreadQuestions : "",
				badgeCls: "unreadFeedbackQuestionsBadgeIcon"
			}, {
				badgeText: options.flashcards && hasFlashcards ? this.getBadgeTranslation().flashcards : "",
				badgeCls: "flashcardBadgeIcon"
			}, {
				badgeText: (options.questions && hasQuestions) || (options.unanswered && hasUnansweredQuestions) ? this.getBadgeTranslation().questions : "",
				badgeCls: "questionsBadgeIcon"
			}, {
				badgeText: options.answers && hasAnswers ? this.getBadgeTranslation().answers : "",
				badgeCls: "answersBadgeIcon"
			}
		]);

		return badges;
	},

	connectToStore: function (store) {
		store.on('updaterecord', function (theStore, record) {
			var records = [];
			store.each(function (r) {
				records.push(r.data);
			});
			this.explainStatus(records);
		}, this);
	}
});
