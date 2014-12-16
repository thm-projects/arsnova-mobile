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
		var me = this;
		
//		this.test();
		
		// TODO show load mask
		
		// get export data for each session
		for (var i = 0; i < exportSessionMap.length; i++) {
		
			console.log('Iteration ' + i);
			// continue if session is not selected for export
			if (!exportSessionMap[i][1])
				continue;
			
			// wrapper function to define a namespace for each iteration of for loop
			// otherwise the promises would overwrite the exportData on return and every iteration contains
			// random data of itself and older iterations
			(function(me, i, exportSessionMap, withAnswerStatistics, withFeedbackQuestions) {
				
				console.log('inside function');
				
				console.log('withAnswerStatistics:');
				console.log(withAnswerStatistics);
				
				console.log('withFeedbackQuestions:');
				console.log(withFeedbackQuestions);
				
				// create export data structure
				var exportData = {};
				exportData['session'] = null;
				exportData['questions'] = [];
				exportData['feedbackQuestions'] = [];
				
				// otherwise export this session
				var session = exportSessionMap[i][0];
				
				// TODO collect missing session information like creator and type: "session"
				// TODO type: session hardcoded
				
				// set session in exportData
				exportData['session'] = session;
				
				console.log(session);
				
				me.exportQuestions('Questions', session.keyword, withAnswerStatistics)
					.then(function(questions) {
						
						console.log('questions: ');
						console.log(questions);
						
						var promiseWhile = function(condition, action, actionOnResult) {
							console.log('promiseWhile()');
							var dfd = Ext.create('Ext.ux.Deferred'),
								task = setInterval(function() {
								
									var loop = function(result) {
										console.log('loop()');
										
										console.log('result:');
										console.log(result);
										if (result) {
											actionOnResult(result);
										}
										if (!condition()) {
											console.log('condition false');
											return dfd.resolve();
										}
										return action().then(loop,
												function(error) {
													console.log(error);
												}
										);
									}
									
									loop(null);
									
									clearInterval(task);
								}, 1000);
							
							return dfd.promise();
						}
						
						var pendingQuestions = questions.length;
						var i = 0;
						
						promiseWhile(
							function() {
								console.log('checking condition');
								console.log('i: ' + i);
								console.log('length: ' + questions.length);
								// condition for stopping while loop
								return i < questions.length;
							},
							function() {
								console.log('action nr.: ' + i);
								var question = questions[i++];
//								console.log(question);
//								i++;
								return me.exportQuestionWithAnswerStatistics(session.keyword, question, withAnswerStatistics); /*.then(
									function(question) {
										// save updated question in exportData
										exportData['questions'].push(question);
									}, function(error) {
										console.log(error);
									}
								);*/
							},
							function(question) {
								console.log('result()');
								exportData['questions'].push(question);
							}
						).then(function() {
							console.log('done');
							
							if (withFeedbackQuestions) {
								me.exportFeedbackQuestions(session.keyword)
								.then(function(feedbackQuestions) {
								
										// set feedback questions in export data
										exportData['feedbackQuestions'] = feedbackQuestions;
										
										// create json file
										me.writeExportDataToFile(exportData);
										
									}, function(error) {
										console.log(error);
									}
								)
							} else {
								// write data without feedback questions
								me.writeExportDataToFile(exportData);
							}
							
						});
					})
				
			})(me, i, exportSessionMap, withAnswerStatistics, withFeedbackQuestions);
			
		}
	},
	
	exportQuestions: function(controller, keyword, withAnswerStatistics) {
		console.log('exportQuestions()');
		var me = this;
		
		var dfd = Ext.create('Ext.ux.Deferred'),
			task = setInterval(function() {
			
				// get preparation questions
				ARSnova.app.getController(controller).getQuestions(
						keyword, {
					success: Ext.bind(function (response) {
						var questions = Ext.decode(response.responseText);
				
						dfd.resolve(questions);
				
//						me.writeExportDataToFile();
						
					}, this),
					empty: Ext.bind(function () {
						console.log('no questions');
						// session has no question. So we do not have to export anything else
//						console.log(me.exportData);
						dfd.resolve([]);
					}, this),
					failure: function (response) {
//						console.log('server-side error questionModel.getSkillQuestions');
//						console.log(reponse);
						dfd.reject('server-side error questionModel.getSkillQuestions');
					}
				});
				
				clearInterval(task);
			}, 1000);
		return dfd.promise();
	},
	
	exportQuestionWithAnswerStatistics: function(keyword, question, withAnswerStatistics) {
		var me = this;
		
		var dfd = Ext.create('Ext.ux.Deferred'),
			task = setInterval(function() {
				
				if (withAnswerStatistics) {
					ARSnova.app.questionModel.countAnswers(keyword, question._id, {
						success: function(response) {
							console.log('Export with answers');
							var answers = Ext.decode(response.responseText);
							// save answer data in question
							question['answers'] = answers;
							// and return the updated question
							dfd.resolve(question);
						},
						empty: function() {
							console.log('no answers');
							// return the question without answers
							dfd.resolve(question);
						},
						failure: function() {
							console.log('server-side error');
							dfd.reject('server-side error');
						}
					});
				} else {
					console.log('Export withOUT answers');
					// return question without answers
					dfd.resolve(question);
				}
				clearInterval(task);
			}, 1000);
		return dfd.promise();
	},
	
	exportFeedbackQuestions: function(keyword) {
		var me = this;
		
		console.log('exportFeedbackQuestions()');
		
		var dfd = Ext.create('Ext.ux.Deferred'),
			task = setInterval(function() {
				ARSnova.app.questionModel.getInterposedQuestions(keyword, {
					success: function(response) {
						var feedbackQuestions = Ext.decode(response.responseText);
//						console.log(feedbackQuestions);
						dfd.resolve(feedbackQuestions);
//						me.exportData['feedbackQuestions'] = feedbackQuestions;
					},
					empty: function() {
						console.log('no feedbackQuestions');
						dfd.resolve([]);
					},
					failure: function() {
						console.log('server-side error');
						dfd.reject('server-side error');
					}
				});
				clearInterval(task);
			}, 1000);
		return dfd.promise();
	},
	
	writeExportDataToFile: function(exportData) {
		console.log('writeExportDataToFile()');
//		console.log(exportData);
		// TODO metadata field
		var jsonData = JSON.stringify({exportData: exportData});
		
		this.saveFileOnFileSystem(jsonData,"export.json");
		
		console.log(jsonData);
		
		// TODO hide load mask
		return jsonData;
	},
	
	 saveFileOnFileSystem: function(rawJson, fileName) {
		 var blob = new Blob([rawJson], {type: "text/plain;charset=utf-8"});
		 var a = window.document.createElement('a');
		 a.href = window.URL.createObjectURL(blob);
		 a.download = filename;

		 // Append anchor to body.
		 document.body.appendChild(a)
		 a.click();
	},
});