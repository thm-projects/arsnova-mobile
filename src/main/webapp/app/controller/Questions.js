/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/questions.js
 - Beschreibung: Questions-Controller
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define("ARSnova.controller.Questions", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Question',
		'ARSnova.view.speaker.QuestionDetailsPanel',
		'ARSnova.view.FreetextDetailAnswer',
		'ARSnova.view.feedbackQuestions.DetailsPanel'
	],

	index: function(options){
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.addListener('deactivate', function(panel){
			panel.toolbar.backButton.hide();
		}, this, {single: true});
	},

	lectureIndex: function(options){
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.setLectureMode();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.setTitle(Messages.LECTURE_QUESTIONS);
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.addListener('deactivate', function(panel){
			panel.toolbar.backButton.hide();
		}, this, {single: true});
	},

	preparationIndex: function(options){
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.setPreparationMode();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.toolbar.setTitle(Messages.PREPARATION_QUESTIONS);
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.addListener('deactivate', function(panel){
			panel.toolbar.backButton.hide();
		}, this, {single: true});
	},

	listQuestions: function(){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.newQuestionPanel.setVariant('lecture');
		sTP.audienceQuestionPanel.setController(this);
		sTP.showcaseQuestionPanel.setController(this);
		sTP.audienceQuestionPanel.toolbar.getTitle().setTitle(Messages.LECTURE_QUESTIONS);
		sTP.audienceQuestionPanel.newQuestionButton.text = Messages.NEW_LECTURE_QUESTION;
		sTP.animateActiveItem(sTP.audienceQuestionPanel, 'slide');
	},

	getQuestions: function() {
		var question = Ext.create('ARSnova.model.Question');
		question.getLectureQuestions.apply(question, arguments);
	},

	deleteAnswers: function() {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAnswers.apply(question, arguments);
	},

	deleteAllQuestionsAnswers: function(callbacks) {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllQuestionsAnswers(localStorage.getItem("keyword"), callbacks);
	},

	destroyAll: function() {
		var question = Ext.create('ARSnova.model.Question');
		question.deleteAllLectureQuestions.apply(question, arguments);
	},

	countAnswersByQuestion: function() {
		var question = Ext.create('ARSnova.model.Question');
		question.countAnswersByQuestion.apply(question, arguments);
	},

	listFeedbackQuestions: function(){
		ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel, 'slide');
		ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.addListener('deactivate', function(panel){
			panel.questionsPanel.backButton.hide();
		}, this, {single: true});
	},

	add: function(options){
		var question = Ext.create('ARSnova.model.Question', {
			type		: options.type,
			questionType: options.questionType,
			questionVariant: options.questionVariant,
			sessionKeyword: options.sessionKeyword,
			subject		: options.subject,
			text		: options.text,
			active		: options.active,
			number		: options.number,
			releasedFor	: options.releasedFor,
			possibleAnswers: options.possibleAnswers,
			noCorrect	: options.noCorrect,
			abstention	: options.abstention,
			gridSize	: options.gridSize,
			offsetX		: options.offsetX,
			offsetY		: options.offsetY,
			zoomLvl		: options.zoomLvl,
			image		: options.image,
			gridOffsetX	: options.gridOffsetX,
			gridOffsetY	: options.gridOffsetY,
			gridZoomLvl	: options.gridZoomLvl,
			gridSizeX	: options.gridSizeX,
			gridSizeY	: options.gridSizeY,
			gridIsHidden: options.gridIsHidden,
			imgRotation	: options.imgRotation,
			toggleFieldsLeft : options.toggleFieldsLeft,
			numClickableFields : options.numClickableFields,
			thresholdCorrectAnswers : options.thresholdCorrectAnswers,
			cvIsColored : options.cvIsColored,
			showStatistic: 1
		});
		question.set('_id', undefined);
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		panel.query('textfield').forEach(function(el){
			el.removeCls("required");
		});

		var error = false;
		var errorNoChosenFields = false;
		var validation = question.validate();
		if (!validation.isValid()){
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.getField() + ']').addCls("required");
				error = true;
			});
		}
		switch(question.get('questionType')){
			case 'vote':
				panel.voteQuestion.query('textfield').forEach(function(el){
					if(el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'school':
				panel.schoolQuestion.query('textfield').forEach(function(el){
					if(el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
			case 'mc':
				panel.multipleChoiceQuestion.query('textfield').forEach(function(el) {
					if(!el.getHidden() && el.getValue().toString().trim() == "") {
						error = true;
					}
				});
				break;
			case 'grid':
				if (! panel.gridQuestion.grid.getImageFile()) {
					error = true;
				}
				if (panel.gridQuestion.grid.getChosenFields().length == 0) {
					errorNoChosenFields = true;
				}

				break;
		}
		if(error){
			Ext.Msg.alert('Hinweis', 'Ihre Eingaben sind unvollständig');
			return;
		} else if (errorNoChosenFields) {
			Ext.Msg.alert('Hinweis', 'Sie müssen mindestens ein Feld auswählen');
			return;
		}

		question.saveSkillQuestion({
			success: options.successFunc,
			failure: options.failureFunc
		});
	},

	details: function(options){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.questionDetailsPanel = Ext.create('ARSnova.view.speaker.QuestionDetailsPanel', {
			question: options.question
		});
		sTP.animateActiveItem(sTP.questionDetailsPanel, 'slide');
	},

	freetextDetailAnswer: function(options) {
		var parentPanel;

		var isFromFreetextAnswerPanel = false;
		if(typeof options.panel !== 'undefined') {
			isFromFreetextAnswerPanel = ARSnova.app.mainTabPanel.getActiveItem().constructor === options.panel.constructor;
		}

		// This gets called either by the speaker or by a student
		if (ARSnova.app.isSessionOwner && !isFromFreetextAnswerPanel) {
			parentPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		} else {
			parentPanel = ARSnova.app.mainTabPanel;
		}

	options.answer.deletable = ARSnova.app.isSessionOwner;
		var freetextDetailAnswerPanel = Ext.create('ARSnova.view.FreetextDetailAnswer', {
			sTP		: parentPanel,
			answer	: options.answer
		});

		parentPanel.animateActiveItem(freetextDetailAnswerPanel, {
			type		: 'slide',
			direction	: 'left',
			duration	: 700
		}, 'slide');
	},

	detailsFeedbackQuestion: function(options){
		var questionModel = Ext.create('ARSnova.model.Question', options.question.data);
		questionModel.getInterposed({
			success: function(response){
				var question = Ext.create('ARSnova.model.Question', Ext.decode(response.responseText));
				question.set('formattedTime', options.formattedTime);
				question.set('fullDate', options.fullDate);

				var newPanel = Ext.create('ARSnova.view.feedbackQuestions.DetailsPanel', {
					question: question.data
				});
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.animateActiveItem(newPanel, 'slide');
			},
			failure: function(records, operation){
				console.log(operation);
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM);
			}
		});
	},

	setActive: function(options){
		ARSnova.app.questionModel.getSkillQuestion(options.questionId, {
			success: function(response) {
				var question = Ext.create('ARSnova.model.Question', Ext.decode(response.responseText));
				question.set('active', options.active);

				question.publishSkillQuestion({
					success: function(response){
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						var questionStatus = panel.questionStatusButton;

						if(options.active == 1){
							questionStatus.questionOpenedSuccessfully();
						} else {
							questionStatus.questionClosedSuccessfully();
						}
					},
					failure: function(records, operation){
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
					}
				});
			},
			failure: function(records, operation){
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.CONNECTION_PROBLEM);
			}
		});
	},

	setAllActive: function(options) {
		ARSnova.app.questionModel.publishAllSkillQuestions(localStorage.getItem("keyword"), options.active, {
			success: function() {
				options.callback.apply(options.scope);
			},
			failure: function() {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.QUESTION_COULD_NOT_BE_SAVED);
			}
		});
	},

	adHoc: function(){
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
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
		backButton.setHandler(function(){
			var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.animateActiveItem(sTP.inClassPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700
			});
		});
		backButton.setText("Session");
		sTP.newQuestionPanel.on('deactivate', function(panel){
			panel.backButton.handler = function(){
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			};
			panel.backButton.setText("Fragen");
		}, this, {single:true});
	},

	deleteAllInterposedQuestions: function(callbacks) {
		ARSnova.app.questionModel.deleteAllInterposedQuestions(localStorage.getItem('keyword'), callbacks);
	}
});
