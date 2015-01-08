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
		wording: {
			stop: Messages.STOP_ALL_QUESTIONS,
			release: Messages.RELEASE_ALL_QUESTIONS,
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
			this.questionIsClosedButton.hide();
			this.questionIsOpenButton.show();
		} else {
			this.isOpen = false;
			this.questionIsClosedButton.show();
			this.questionIsOpenButton.hide();
		}
	},

	changeStatus: function () {
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
						callback: Ext.Function.createSequence(this.questionClosedSuccessfully, function () {
							updateQuestions(false);
						}, this),
						scope: this
					});
				}
			}, this);
		} else {
			/* open all questions */
			ARSnova.app.getController('Questions').setAllActive({
				active: true,
				callback: Ext.Function.createSequence(this.questionOpenedSuccessfully, function () {
					updateQuestions(true);
				}, this),
				scope: this
			});
		}
	}
});
