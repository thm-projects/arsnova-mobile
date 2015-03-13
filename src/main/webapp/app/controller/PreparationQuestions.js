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
Ext.define("ARSnova.controller.PreparationQuestions", {
	extend: 'ARSnova.controller.Questions',

	requires: ['ARSnova.model.Question'],

	config: {
		models: ['ARSnova.model.Question']
	},

	listQuestions: function () {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.newQuestionPanel.setVariant('preparation');
		sTP.sortQuestionsPanel.setController(this);
		sTP.sortSubjectsPanel.setController(this);
		sTP.audienceQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setPreparationMode();
		sTP.audienceQuestionPanel.questionStatusButton.setPreparationQuestionsMode();
		sTP.audienceQuestionPanel.toolbar.getTitle().setTitle(Messages.PREPARATION_QUESTIONS);
		sTP.audienceQuestionPanel.newQuestionButton.text = Messages.NEW_PREPARATION_QUESTION;
		sTP.animateActiveItem(sTP.audienceQuestionPanel, 'slide');
	},

	destroyAll: function () {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllPreparationQuestions.apply(question, arguments);
	},

	deleteAllQuestionsAnswers: function (callbacks) {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllPreparationAnswers(sessionStorage.getItem("keyword"), callbacks);
	},

	getQuestions: function () {
		var question = Ext.create('ARSnova.model.Question');
		question.getPreparationQuestions.apply(question, arguments);
	},
	
	getSubjectSort: function (options) {
		ARSnova.app.questionModel.getSubjectPreparationSort(sessionStorage.getItem('keyword'),
			options.callbacks);
	},
	
	setSubjectSort: function (options) {
		ARSnova.app.questionModel.setSubjectPreparationSort(sessionStorage.getItem('keyword'),
			options.sortType, options.subjects, options.callbacks);
	},
	
	getQuestionSort: function (options) {
		ARSnova.app.questionModel.getQuestionPreparationSort(sessionStorage.getItem('keyword'),
			options.subject, options.callbacks);
	},
	
	setQuestionSort: function (options) {
		ARSnova.app.questionModel.setQuestionPreparationSort(sessionStorage.getItem('keyword'),
			options.subject, options.sortType, options.questionIDs, options.callbacks);
	}
});
