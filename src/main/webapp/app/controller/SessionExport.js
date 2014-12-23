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
		
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_EXPORT);
		
		// get export data for each session
		for (var i = 0; i < exportSessionMap.length; i++) {
		
			console.log('Iteration ' + i);
			// continue if session is not selected for export
			if (!exportSessionMap[i][1])
				continue;
			
			// wrapper function to define a namespace for each iteration of for loop
			// otherwise the promises would overwrite the exportData on return and every iteration contains
			// random data of itself and older iterations
			(function(me, i, exportSessionMap, withAnswerStatistics, withFeedbackQuestions, hideLoadMask) {
				
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
				session['type'] = 'session';
				
				// set session in exportData
				exportData['session'] = session;
				
				console.log(session);
				
				// get classroom and preparation questions
				var p1 = me.exportQuestions('Questions', session.keyword, withAnswerStatistics);
				var p2 = me.exportQuestions('PreparationQuestions', session.keyword, withAnswerStatistics);
				
				RSVP.all([p1, p2]).then(function(allQuestions) {
					console.log('promises all:');
					console.log(allQuestions);
					
					var questions = allQuestions[0].concat(allQuestions[1]);
					
					console.log(questions);
					
					var j = 0;
					
					// save questions and check for answers if enabled
					console.log(ARSnova.utils);
					ARSnova.utils.AsyncUtils.promiseWhile(
						function() {
							console.log('checking condition');
							console.log('j: ' + j);
							console.log('length: ' + questions.length);
							// condition for stopping while loop
							return j < questions.length;
						},
						function() {
							console.log('action nr.: ' + j);
							var question = questions[j++];
							return me.exportQuestionWithAnswerStatistics(session.keyword, question, withAnswerStatistics);
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
							
									// set question type for export
									for (var k = 0; k < feedbackQuestions.length; k++) {
										feedbackQuestions[k]['type'] = 'interposed_question';
									}
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
						
						// hide load mask after last iteration
						if (i == exportSessionMap.length - 1) {
							hideLoadMask();
						}
					});
				});
				
				/*
				me.exportQuestions('Questions', session.keyword, withAnswerStatistics)
					.then(function(questions) {
						
						console.log('questions: ');
						console.log(questions);
						
						var j = 0;
						
						promiseWhile(
							function() {
								console.log('checking condition');
								console.log('j: ' + j);
								console.log('length: ' + questions.length);
								// condition for stopping while loop
								return j < questions.length;
							},
							function() {
								console.log('action nr.: ' + j);
								var question = questions[j++];
								return me.exportQuestionWithAnswerStatistics(session.keyword, question, withAnswerStatistics);
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
								
										// set question type for export
										for (var k = 0; k < feedbackQuestions.length; k++) {
											feedbackQuestions[k]['type'] = 'interposed_question';
										}
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
							
							// hide load mask after last iteration
							if (i == exportSessionMap.length - 1) {
								hideLoadMask();
							}
						});
					})*/
				
			})(me, i, exportSessionMap, withAnswerStatistics, withFeedbackQuestions, hideLoadMask);
		}
	},
	
	exportQuestions: function(controller, keyword, withAnswerStatistics) {
		console.log('exportQuestions()');
		var me = this;
		
		var promise = new RSVP.Promise();
		// get preparation questions
		ARSnova.app.getController(controller).getQuestions(
				keyword, {
			success: Ext.bind(function (response) {
				var questions = Ext.decode(response.responseText);
		
				promise.resolve(questions);
		
//						me.writeExportDataToFile();
				
			}, this),
			empty: Ext.bind(function () {
				console.log('no questions');
				// session has no question. So we do not have to export anything else
//						console.log(me.exportData);
				promise.resolve([]);
			}, this),
			failure: function (response) {
//						console.log('server-side error questionModel.getSkillQuestions');
//						console.log(reponse);
				promise.reject('server-side error questionModel.getSkillQuestions');
			}
		});
		return promise;
	},
	
	exportQuestionWithAnswerStatistics: function(keyword, question, withAnswerStatistics) {
		var me = this;
		
		var promise = new RSVP.Promise();
		if (withAnswerStatistics) {
			ARSnova.app.questionModel.countAnswers(keyword, question._id, {
				success: function(response) {
					console.log('Export with answers');
					var answers = Ext.decode(response.responseText);
					
					console.log('No: ' + answers.length);
					// save answer data in question
					question['answers'] = answers;
					// and return the updated question
					promise.resolve(question);
				},
				empty: function() {
					console.log('no answers');
					// return the question without answers
					promise.resolve(question);
				},
				failure: function() {
					console.log('server-side error');
					promise.reject('server-side error');
				}
			});
		} else {
			console.log('Export withOUT answers');
			// return question without answers
			promise.resolve(question);
		}
		return promise;
	},
	
	exportFeedbackQuestions: function(keyword) {
		var me = this;
		
		console.log('exportFeedbackQuestions()');
		
		var promise = new RSVP.Promise();
		ARSnova.app.questionModel.getInterposedQuestions(keyword, {
			success: function(response) {
				var feedbackQuestions = Ext.decode(response.responseText);
//						console.log(feedbackQuestions);
				promise.resolve(feedbackQuestions);
//						me.exportData['feedbackQuestions'] = feedbackQuestions;
			},
			empty: function() {
				console.log('no feedbackQuestions');
				promise.resolve([]);
			},
			failure: function() {
				console.log('server-side error');
				promise.reject('server-side error');
			}
		});
		return promise;
	},
	
	writeExportDataToFile: function(exportData) {
		var jsonData = JSON.stringify({exportData: exportData});

		var dateString = "";
		if (exportData.session.creationTime != 0) {
			var d = new Date(exportData.session.creationTime);
			dateString = "-"+d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()+"-"+d.getHours()+"-"+d.getMinutes();
		}
		
		var filename = exportData.session.name + "-" + exportData.session.keyword + dateString + ".json";
		this.saveFileOnFileSystem(jsonData, filename);
		
		return jsonData;
	},
	
	saveFileOnFileSystem: function(rawJson, filename) {
		 var blob = new Blob([rawJson], {type: "text/plain;charset=utf-8"});
		 var ua   = window.navigator.userAgent;
	     var msie = ua.indexOf("MSIE ");
	     
	     if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
	    	 console.log("### IE ###");
	    	 window.navigator.msSaveBlob(blob, filename);
	     } else {
	    	 
			 var a = window.document.createElement('a');
			 a.href = window.URL.createObjectURL(blob);
			 a.download = filename;

			 // Append anchor to body.
			 document.body.appendChild(a)
			 a.click(); 
	     }
	},
});