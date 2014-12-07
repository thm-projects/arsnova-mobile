/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.listButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'small',
			text: "",
			cls: 'forwardListButton caption'
		});

		this.add([].concat(window.innerWidth > 320 ? [{
			cls: 'gravure',
			style: {
				fontSize: "0.6em"
			},
			html: Messages.LEGEND
		}, this.listButton]: []));
	},

	explainStatus: function (items) {
		var hasActiveItems = false;
		items.forEach(function (item) {
			hasActiveItems = hasActiveItems || !!item.active;
		});
		var hasInactiveItems = false;
		items.forEach(function (item) {
			hasInactiveItems = hasInactiveItems || !!!item.active;
		});

		var activeText = "";
		if (hasActiveItems) {
			activeText = this.getTranslation().active;
		}
		var inactiveText = "";
		if (hasInactiveItems) {
			inactiveText = "<span class='isInactive'>" + this.getTranslation().inactive + "</span>";
		}
		if (hasActiveItems && hasInactiveItems) {
			this.listButton.setText(inactiveText + " / " + activeText);
		} else {
			this.listButton.setText(activeText || inactiveText);
		}
	},

	explainBadges: function (badges, opt) {
		var options = Ext.apply({}, opt, {
			questions: true,
			answers: true,
			interposed: true,
			unanswered: false
		});
		var hasFeedbackQuestions = false;
		var hasQuestions = false;
		var hasUnansweredQuestions = false;
		var hasAnswers = false;
		badges.forEach(function (item) {
			if (Ext.isNumber(item)) {
				hasQuestions = hasQuestions || item > 0;
			} else {
				hasFeedbackQuestions = hasFeedbackQuestions || item.hasFeedbackQuestions || item.numInterposed > 0;
				hasQuestions = hasQuestions || item.hasQuestions || item.numQuestions > 0;
				hasUnansweredQuestions = hasUnansweredQuestions || item.hasUnansweredQuestions || item.numUnanswered > 0;
				hasAnswers = hasAnswers || item.hasAnswers || item.numAnswers > 0;
			}
		});
		this.listButton.setBadge([{
				badgeText: options.interposed && hasFeedbackQuestions ? Messages.QUESTIONS_FROM_STUDENTS : "",
				badgeCls: "feedbackQuestionsBadgeIcon"
			}, {
				badgeText: (options.questions && hasQuestions) || (options.unanswered && hasUnansweredQuestions) ? Messages.QUESTIONS : "",
				badgeCls: "questionsBadgeIcon"
			}, {
				badgeText: options.answers && hasAnswers ? Messages.ANSWERS : "",
				badgeCls: "answersBadgeIcon"
		}]);
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
