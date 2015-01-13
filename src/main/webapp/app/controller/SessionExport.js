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
	
	cloneSessionFromPublicPool: function(session) {
		var me = this;
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_PP_CLONE);
		
		// call exportSessions() with this session to get all necessary data
		// remove pp-Attributes (public pool)
		// set type = "session"
		// call ImportCtrl to create new session (creator will be set by ImportCtrl)
		
		var sessions = [];
		sessions.push(session);
		
		this.exportSessions(sessions, true, true)
		.then(function(exportData) {
			for (var i = 0; i < exportData.length; i++) {
				// remove public pool attributes from session
				console.log('session', exportData[i].session);
				for (var attrname in exportData[i].session) {
					if (attrname.lastIndexOf('pp', 0) === 0) {
						exportData[i].session[attrname] = null;
					}
				}
				// rewrite session type
				exportData[i]['session']['sessionType'] = null;
			
				console.log('updated exportData', exportData[i]);
				
				// call import ctrl to save cloned session in db
				ARSnova.app.getController("SessionImport").importSession(exportData[i]);
			}
			
			hideLoadMask();
		});
	},
	
	/**
	 * Exports selected sessions from the exportSessionMap to the public pool.
	 * 
	 * @param exportSessionMap		Mapping Session -> bool specifies which sessions the user wants to exort.
	 * @param publicPoolAttributes	An array of attributes to describe the sessions in the public pool.
	 */
	exportSessionsToPublicPool: function(exportSessionMap, publicPoolAttributes) {
		var me = this;
		var sessions = [];
		
		for (var i = 0; i < exportSessionMap.length; i++) {
			if (exportSessionMap[i][1])
				sessions.push(exportSessionMap[i][0]);
		}
		
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_EXPORT);
		
		this.exportSessions(sessions, true, true)
		.then(function(exportData) {
			
			for (var i = 0; i < exportData.length; i++) {
				// set public pool attributes in session
				for (var attrname in publicPoolAttributes) {
					exportData[i]['session'][attrname] = publicPoolAttributes[attrname];
				}
				// rewrite session type
				exportData[i]['session']['sessionType'] = 'public_pool';
			
				// call import ctrl to save public pool session in db
				ARSnova.app.getController("SessionImport").importSession(exportData[i]);
				hideLoadMask();
			}
		});
	},
	
	/**
	 * Exports selected sessions from the exportSessionMap into JSON files. One file for each session.
	 * 
	 * @param exportSessionMap		Mapping Session -> bool specifies which sessions the user wants to exort.
	 * @param withAnswerStatistics	<code>true</code> if the answerStatistics should be exported, <code>false</code> otherwise.
	 * @param withFeedbackQuestions	<code>true</code> if the feedbackQuestions should be exported, <code>false</code> otherwise.
	 */
	exportSessionsToFile: function(exportSessionMap, withAnswerStatistics, withFeedbackQuestions) {
		var me = this;
		var sessions = [];
		
		for (var i = 0; i < exportSessionMap.length; i++) {
			if (exportSessionMap[i][1])
				sessions.push(exportSessionMap[i][0]);
		}
		
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_EXPORT);
		
		this.exportSessions(sessions, withAnswerStatistics, withFeedbackQuestions)
		.then(function(exportData) {
			for (var i = 0; i < exportData.length; i++) {
				me.writeExportDataToFile(exportData[i]);
			}
			hideLoadMask();
		});
	},

	/**
	 * Exports selected sessions from the given session map.
	 * 
	 * @param sessions				The array of sessions to export.
	 * @param withAnswerStatistics	<code>true</code> if the answerStatistics should be exported, <code>false</code> otherwise.
	 * @param withFeedbackQuestions	<code>true</code> if the feedbackQuestions should be exported, <code>false</code> otherwise.
	 */
	exportSessions: function(sessions, withAnswerStatistics, withFeedbackQuestions) {
		var me = this;
		
		var promise = new RSVP.Promise();
		
		var exportData = [];
		var j = 0;
		
		// save questions and check for answers if enabled
		ARSnova.utils.AsyncUtils.promiseWhile(
			function() {
				console.log('condition', j, sessions.length);
				// condition for stopping while loop
				return j < sessions.length;
			},
			function() {
				var session = sessions[j++];
				return me.exportSession(session, withAnswerStatistics, withFeedbackQuestions);
			},
			function(session) {
				console.log('session', session);
				exportData.push(session);
			}
		).then(function() {
			promise.resolve(exportData);
		});
		
		return promise;
	},
	
	/**
	 * Collects all for the export necessary information about the given session.
	 * 
	 * @param session				The session to export.
	 * @param withAnswerStatistics	<code>true</code> if the answerStatistics should be exported, <code>false</code> otherwise.
	 * @param withFeedbackQuestions	<code>true</code> if the feedbackQuestions should be exported, <code>false</code> otherwise.
	 */
	exportSession: function(session, withAnswerStatistics, withFeedbackQuestions) {
		console.log('exportSession()');
		var me = this;
		var promise = new RSVP.Promise();
		// create export data structure
		var exportData = {};
		exportData['session'] = null;
		exportData['questions'] = [];
		exportData['feedbackQuestions'] = [];
		
		// otherwise export this session
		session['type'] = 'session';
		
		// set session in exportData
		exportData['session'] = session;
		
		// get classroom and preparation questions
		var p1 = me.exportQuestions('Questions', session.keyword, withAnswerStatistics);
		var p2 = me.exportQuestions('PreparationQuestions', session.keyword, withAnswerStatistics);
		
		RSVP.all([p1, p2]).then(function(allQuestions) {
			console.log('allQuestions', allQuestions);
			var questions = allQuestions[0].concat(allQuestions[1]);
			var j = 0;
			
			// save questions and check for answers if enabled
			ARSnova.utils.AsyncUtils.promiseWhile(
				function() {
					// condition for stopping while loop
					return j < questions.length;
				},
				function() {
					var question = questions[j++];
					return me.exportQuestionWithAnswerStatistics(session.keyword, question, withAnswerStatistics);
				},
				function(question) {
					exportData['questions'].push(question);
				}
			).then(function() {
				if (withFeedbackQuestions) {
					me.exportFeedbackQuestions(session.keyword)
						.then(function(feedbackQuestions) {
							// set question type for export
							for (var k = 0; k < feedbackQuestions.length; k++) {
								feedbackQuestions[k]['type'] = 'interposed_question';
							}
							// set feedback questions in export data
							exportData['feedbackQuestions'] = feedbackQuestions;
							
							promise.resolve(exportData);
							// create json file
//							me.writeExportDataToFile(exportData);
							
						}, function(error) {
							console.log(error);
							promise.reject(error);
						}
					)
				} else {
					promise.resolve(exportData);
					// write data without feedback questions
//					me.writeExportDataToFile(exportData);	
				}
				
				// hide load mask after last iteration
//				if (i == exportSessionMap.length - 1) {
//					hideLoadMask();
//				}
			}, function(error) {
				console.log(error);
				promise.reject(error);
			});
		}, function(error) {
			console.log(error);
			promise.reject(error);
		});
		
		return promise;
	},
	
	exportQuestions: function(controller, keyword, withAnswerStatistics) {
		var me = this;
		
		var promise = new RSVP.Promise();
		// get preparation questions
		ARSnova.app.getController(controller).getQuestions(
				keyword, {
			success: Ext.bind(function (response) {
				var questions = Ext.decode(response.responseText);
				promise.resolve(questions);
			}, this),
			empty: Ext.bind(function () {
				// session has no question. So we do not have to export anything else
				promise.resolve([]);
			}, this),
			failure: function (response) {
				console.log(response);
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
					var answers = Ext.decode(response.responseText);
					// save answer data in question
					question['answers'] = answers;
					// and return the updated question
					promise.resolve(question);
				},
				empty: function() {
					// return the question without answers
					promise.resolve(question);
				},
				failure: function() {
					promise.reject('server-side error');
				}
			});
		} else {
			// return question without answers
			promise.resolve(question);
		}
		return promise;
	},
	
	exportFeedbackQuestions: function(keyword) {
		var me = this;
		var promise = new RSVP.Promise();
		ARSnova.app.questionModel.getInterposedQuestions(keyword, {
			success: function(response) {
				var feedbackQuestions = Ext.decode(response.responseText);
				promise.resolve(feedbackQuestions);
			},
			empty: function() {
				promise.resolve([]);
			},
			failure: function() {
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
	    	 window.navigator.msSaveBlob(blob, filename);
	     } else {
	    	 
			 var a = window.document.createElement('a');
			 a.className = "session-export";
			 a.href = window.URL.createObjectURL(blob);
			 a.download = filename;

			 // Append anchor to body.
			 document.body.appendChild(a)
			 console.log(a);
			 a.click(); 
	     }
	     var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
			hTP.animateActiveItem(hTP.mySessionsPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700
			});
	},
});