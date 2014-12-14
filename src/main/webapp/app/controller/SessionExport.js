/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
Ext.define("ARSnova.controller.SessionExport", {
	extend: 'Ext.app.Controller',
	
	requires: [
	   'ARSnova.model.Session',
	   'ARSnova.model.Answer',
	   'ARSnova.model.Question'
	],
	
	/**
	 * Exports selected sessions from the exportSessionMap into JSON files. One file for each session.
	 * 
	 * @param exportSessionMap		Mapping Session -> bool specifies which sessions the user wants to exort.
	 * @param withAnswerStatistics	<code>true</code> if the answerStatistics should be exported, <code>false</code> otherwise.
	 * @param withFeedbackQuestions	<code>true</code> if the feedbackQuestions should be exported, <code>false</code> otherwise.
	 */
	exportSessionsToFile: function(exportSessionMap, withAnswerStatistics, withFeedbackQuestions) {
		console.log('exportSessionsToFile()');
		console.log(exportSessionMap);
		var me = this;
		
		// create export data structure
		this.exportData = new Array();
		this.exportData['session'] = null;
		this.exportData['questions'] = new Array();
		this.exportData['feedbackQuestions'] = new Array();
		// TODO the rest
		
		// get export data for each session
		for (var i = 0; i < exportSessionMap.length; i++) {
			
			if (!exportSessionMap[i][1])
				continue;
			
			var session = exportSessionMap[i][0];
			
			// TODO collect missing session information like creator and type: "session"
			
			// set session in exportData
			this.exportData['session'] = session;
			
			console.log(session);
			
			// get preparation questions
			ARSnova.app.getController('PreparationQuestions').getQuestions(
					session.keyword, {
				success: Ext.bind(function (response) {
					console.log('success');
					var questions = Ext.decode(response.responseText);
			
					for (var j = 0; j < questions.length; j++) {
						var question = questions[j];
//						console.log('question withOUT answers:');
//						console.log(question);
						
						// just execute if toggle is true
						if (withAnswerStatistics) {
							me.exportAnswerStatistics(session.keyword, question);
						} else {
							console.log('Export withOUT answers')
							// if toggle is not true, only export the question without answers
							me.exportData['questions'].push(question);
							console.log(me.exportData);
						}
					}
				}, this),
				empty: Ext.bind(function () {
					console.log('no questions');
					// session has no question. So we do not have to export anything else
					console.log(me.exportData);
				}, this),
				failure: function (response) {
					console.log('server-side error questionModel.getSkillQuestions');
					console.log(reponse);
				}
			});
			
			// get feedback questions
			this.exportFeedbackQuestions(session.keyword);
		}
	},
	
	exportAnswerStatistics: function(keyword, questionData) {
		var me = this;
		
		ARSnova.app.questionModel.countAnswers(keyword, questionData._id, {
			success: function(response) {
				console.log('Export with answers');
				var answers = Ext.decode(response.responseText);
				questionData['answers'] = answers;
				me.exportData['questions'].push(questionData);
				
				console.log(me.exportData);
			},
			empty: function() {
				console.log('no answers');
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	},
	
	exportFeedbackQuestions: function(keyword) {
		var me = this;
		
		console.log('exportFeedbackQuestions()');
		ARSnova.app.questionModel.getInterposedQuestions(keyword, {
			success: function(response) {
				console.log('feedback success');
				var feedbackQuestions = Ext.decode(response.responseText);
				console.log(feedbackQuestions);
				me.exportData['feedbackQuestions'] = feedbackQuestions;
			},
			empty: function() {
				console.log('no feedbackQuestions');
			},
			failure: function() {
				console.log('server-side error');
			}
		});
	}
});