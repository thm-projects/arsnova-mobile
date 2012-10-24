/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/models/restProxy.js
 - Beschreibung: Proxy für die Verbindung zur CouchDB
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
var restProxy = new Ext.data.RestProxy({
	url : '/couchdb/arsnova',
	appendId: true,
	noCache: false,
	
	writer: {
		writeRecords: function(request, data){
			request.jsonData = data[0];
			return request;
		}
	},
	
	listeners: {
		exception: function(proxy, response, operation){
			operation.exceptionReason = response.status;
		},
	},
	
	create: function(operation, callback, scope) {
		var callbackFn = operation.callback,
	        successFn  = operation.success,
	        failureFn  = operation.failure;
		
		callback = function(operation){			
            if (operation.wasSuccessful()) {
            	record = Ext.decode(operation.response.responseText);
            	this.set('_id', record.id);
            	this.set('_rev', record.rev);
            	
	            if (typeof successFn == 'function') {
	                successFn.call(scope, record, operation);
		        }
            } else {
	            if (typeof failureFn == 'function') {
	                failureFn.call(scope, operation);
	            }
	        }
	            
	        if (typeof callbackFn == 'function') {
	            callbackFn.call(scope, record, operation);
	        } 
		};
		
		request = this.buildRequest(operation, callback, scope);
		
		this.doRequest(operation, callback, scope, request);	                
	},
	
	read: function(operation, callback, scope) {
	 	var callbackFn = operation.callback,
            successFn  = operation.success,
            failureFn  = operation.failure;
		
		callback = function(operation) {
	        if (operation.wasSuccessful()) {
            	record = operation.getRecords()[0];
                if (typeof successFn == 'function') {
                    successFn.call(scope, record, operation);
                }
            } else {
                if (typeof failureFn == 'function') {
                    failureFn.call(scope, record, operation);
                }
            }
	            
            if (typeof callbackFn == 'function') {
                callbackFn.call(scope, record, operation);
            }
       	};
		
		Ext.data.RestProxy.superclass.read.apply(this, arguments);
	},
	
	buildUrl: function(request) {
        var records = request.operation.records || [],
            record  = records[0],
            format  = this.format,
            url     = request.url || this.url;
        	id      = record ? record.getId() : request.operation.id; // FIX
        
        
        	if (this.appendId && id) { // FIX
        		if (!url.match(/\/$/)) {
                url += '/';
            }
            
            url += id; // FIX
        }
        
        if (format) {
            if (!url.match(/\.$/)) {
                url += '.';
            }
            
            url += format;
        }
        
        request.url = url;
        
        return Ext.data.RestProxy.superclass.buildUrl.apply(this, arguments);
    },
    
	/**
	 * Search for a session with specified keyword
	 * @param keyword of session
	 * @param object with success- and failure-callbacks
	 * @return session-object, if found
	 * @return false, if nothing found 
	 */
	checkSessionLogin: function(keyword, callbacks){
		Ext.Ajax.request({
			url: "session/" + keyword,
			success: callbacks.success,
			failure: function(response) {
				if (response.status === 404) {
					callbacks.notFound.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
	
	/**
	 * Get the sessions where user is creator
	 * @param login from user
	 * @param object with success-, failure- and empty-callbacks
	 * @return session-objects, if found
	 * @return false, if nothing found 
	 */
	getMySessions: function(callbacks) {
		Ext.Ajax.request({
			url: "mySessions",
			success: callbacks.success,
			failure: function(response) {
				if (response.status === 404) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
    
    /**
     * Get the sessions where user is visitor
     * @param login from user
     * @param object with success- and failure-callbacks
     * @return session-objects, if found
     * @return false, if nothing found 
     */
    getMyVisitedSessions: function(login, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/logged_in/_view/visited_sessions_by_user',
    		method: 'GET',
    		params: {
    			key: "\"" + login + "\"",
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getQuestionById: function(id, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/by_id',
    		method: 'GET',
    		params: {
    			key: "\"" + id + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
	/**
	 * Get skill questions for this session, sorted by subject and text
	 * @param sessionKeyword
	 * @param object with success-, failure- and empty-callbacks
	 */
	getSkillQuestionsSortBySubjectAndText: function(sessionKeyword, callbacks) {
		Ext.Ajax.request({
			url: "session/" + sessionKeyword + "/skillquestions",
			success: callbacks.success,
			failure: function (response) {
				if (response.status === 404) {
					callbacks.empty.apply(this, arguments);
				} else {
					callbacks.failure.apply(this, arguments);
				}
			}
		});
	},
    
    countSkillQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/count_by_session',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
	
	countTotalAnswers: function(sessionId, callbacks) {
		Ext.Ajax.request({
			url: this.url + '/_design/skill_question/_view/count_answers_by_session',
			method: 'GET',
			
			params: {
				key: "\"" + sessionId + "\""
			},
			success: callbacks.success,
			failure: callbacks.failure,
		});
	},
    
    /**
     * Get interposed questions for this session
     * @param sessionId
     * @param object with success- and failure-callbacks
     * @return session-objects, if found
     * @return false, if nothing found 
     */
    getInterposedQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/interposed_question/_view/by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    countFeedbackQuestions: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/interposed_question/_view/count_by_session_reading?group=true',
    		method: 'GET',
    		
    		params: {
    			startkey: "[\"" + sessionId + "\"]",
    			endkey	: "[\"" + sessionId + "\", {}]",
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    delQuestion: function(queObj, callbacks){
    	restProxy.removeEntry(queObj._id, queObj._rev, callbacks); 	//delete Question
    	restProxy.delAnswers(queObj._id, callbacks);				//delete Answers
    },
    
    delAnswers: function(questionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/cleanup',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + questionId + "\""
    		},
    		
    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			if (resRows.length > 0) {
					for ( var i = 0; i < resRows.length; i++) {
						el = resRows[i];
						restProxy.removeEntry(el.id, el.value, callbacks);
					}
				}
    		},
    		failure: callbacks.failure,
    	});
    },
    
    delSession: function(sessionId, creator, callbacks){
    	Ext.ModelMgr.getModel("Session").load(sessionId, {
    		success: function(record, operation) {
    			var sessionObj = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Session');
    			if(sessionObj.data.creator != creator){
    				console.log('unauthorized');
    				return;
    			}
		    	restProxy.getSkillQuestionsForDelete(sessionId, {
		    		success: function(response){
		    			var skillQuestions = Ext.decode(response.responseText).rows;
		    			if (skillQuestions.length > 0) {
							for ( var i = 0; i < skillQuestions.length; i++) {
								skillQuestion = skillQuestions[i];
								restProxy.delQuestion(skillQuestion.value, {
									success: function(){}, //nothing to do
									failure: function(){}, //nothing to do
								});
							}
						}
						restProxy.removeEntry(sessionObj.data._id, sessionObj.data._rev, callbacks);
					}
				});
    		},
    		failure: function(){console.log('failure');},
    	});
    },
    
//    delLoggedIn: function(callbacks){
//    	Ext.Ajax.request({
//    		url: this.url + '/_design/logged_in/_view/all',
//    		method: 'GET',
//    		
//    		success: function(response){
//    			var resRows = Ext.decode(response.responseText).rows;
//    			if (resRows.length > 0) {
//					for ( var i = 0; i < resRows.length; i++) {
//						el = resRows[i];
//						console.log(el.value);
//						restProxy.removeEntry(el.id, el.value._rev, callbacks);
//					}
//				}
//    		},
//    	})
//    },
    
    getSkillQuestionsForDelete: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/for_delete',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getAnswerByUserAndSession: function(userLogin, sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_user_and_session',
    		method: 'GET',
    		params: {
    			key: "[\"" + userLogin + "\", \"" + sessionId + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getAnsweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/unanswered',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			var questions = [];
    			var answeredQuestions = [];
    			var retQuestions = [];
    			
    			resRows.forEach(function(element){
    				if (element.value.type == 'skill_question') {
						questions.push(element);
					} else {
						if (element.value.user == userLogin)
							answeredQuestions.push(element.value.questionId);
					}
    			});
    			
    			questions.forEach(function(element){
    				if (element.value.active && element.value.active == 1) {
						if (answeredQuestions.indexOf(element.id) != -1) {
							unansweredQuestions.push(element.value);
						}
    				}
    			});
    			callbacks.success(retQuestions);
    		},
    		failure: callbacks.failure,
    	});
    },
    
    /**
     * First fetch all answered skill_questions of this user.
     * Then fetch all skill_questions for this session and check each question if it is active and not in the answered questions array.
     */
    getUnansweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + userLogin + "\", \"" + sessionId + "\"]",
    		},

    		success: function(response){
    			var resRows = Ext.decode(response.responseText).rows;
    			var answered = [];
    			
    			resRows.forEach(function(question){
    				answered.push(question.value);
    			});
    			
    			restProxy.getSkillQuestionsOnlyId(sessionId, {
    				success: function(response){
    					var allQuestions = Ext.decode(response.responseText).rows;
    					var unanswered = [];
    					
    					allQuestions.forEach(function(question){
    						if(answered.indexOf(question.id) == -1)
    							unanswered.push(question.id);
    					});
    					callbacks.success(unanswered);
    				},
    				failure: callbacks.failure,
    			});
    		},
    		failure: callbacks.failure,
    	});
    },
    
    getSkillQuestionsOnlyId: function(sessionId, callbacks){
    	var requestUrl = this.url;
    	
    	switch(ARSnova.loginMode){
    		case ARSnova.LOGIN_GUEST:
    			requestUrl += '/_design/skill_question/_view/by_session_only_id_for_all';
    			break;
    		case ARSnova.LOGIN_THM:
    			requestUrl += '/_design/skill_question/_view/by_session_only_id_for_thm';
    			break;
			default:
				requestUrl += '/_design/skill_question/_view/by_session_only_id_for_all';
				break;
    	}
    	
    	Ext.Ajax.request({
    		url: requestUrl,
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},
    		
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    
    
    getUserAnswer: function(questionId, userLogin, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/answer/_view/by_question_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + questionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },

    countAnswers: function(questionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/count_answers?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + questionId + "\"]",
    			endkey	: "[\"" + questionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },

	countAnswersByQuestion: function(questionId, callbacks) {
		Ext.Ajax.request({
			url: this.url + '/_design/skill_question/_view/count_answers_by_question',
			method: 'GET',
			params: {
				key: "\"" + questionId + "\"",
			},
			
			success: callbacks.success,
			failure: callbacks.failure,
			callback: callbacks.callback || function() {}
		});
	},

	getAnsweredFreetextQuestions: function(questionId, callbacks) {
		Ext.Ajax.request({
			url: this.url + '/_design/skill_question/_view/freetext_answers',
			method: 'GET',
			params: {
				key: "\"" + questionId + "\"",
			},
			
			success: callbacks.success,
			failure: callbacks.failure,
		});
	},
    
    getSessionFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/by_session?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + sessionId + "\"]",
    			endkey	: "[\"" + sessionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    /**
     * Remove all feedback votes older than 'timeLimit'
     * default: 10 minutes
     */
    cleanSessionFeedback: function() {
    	var timeLimit = 10; //min
    	var time = new Date().getTime() - (timeLimit * 60 * 1000);
    	
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/cleanup',
    		method: 'GET',
    		params: {
    			startkey: "null",
    			endkey	: time,
    		},

    		success: function(response){
    			var responseObj = Ext.decode(response.responseText).rows;
    			if (responseObj.length > 0){
    				for ( var i = 0; i < responseObj.length; i++) {
						var el = responseObj[i];
						restProxy.removeEntry(el.id, el.value, {
							success: function(){},
							failure: function(){console.log('error - clean session feedback');},
						});
					}
    			}
    		},
    		failure: function(){
    			console.log('server-side error cleanSessionFeedback');
    		}
    	});
    },
    
//    cleanLoggedIn: function() {
//    	Ext.Ajax.request({
//    		url: this.url + '/_design/logged_in/_view/cleanup',
//    		method: 'GET',
//
//    		success: function(response){
//    			var responseObj = Ext.decode(response.responseText).rows;
//    			if (responseObj.length > 0){
//    				for ( var i = 0; i < responseObj.length; i++) {
//						var el = responseObj[i];
//						restProxy.removeEntry(el.id, el.value, {
//							success: function(){},
//							failure: function(){console.log('error - clean logged in')},
//						});
//					}
//    			}
//    		},
//    		failure: function(){
//    			console.log('server-side error cleanLoggedIn');
//    		}
//    	})
//    },
    
    removeEntry: function(id, rev, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/' + id + '?rev=' + rev,
    		method: 'DELETE',
    		
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getUserFeedback: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/by_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getAverageSessionFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/avg_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    countFeedback: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/understanding/_view/count_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getUserRanking: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/by_session_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getUserRankingStatistic: function(sessionId, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/count_by_session_and_user',
    		method: 'GET',
    		params: {
    			key: "[\"" + sessionId + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getSessionRankingStatistic: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/user_ranking/_view/count_by_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getSessionIds: function(callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/getIds',
    		method: 'GET',

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },

    getSession: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/by_id',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    isActive: function(sessionId, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/session/_view/is_active',
    		method: 'GET',
    		
    		params: {
    			key: "\"" + sessionId + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    getUserFoodVote: function(day, userLogin, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/get_user_vote',
    		method: 'GET',
    		params: {
    			key: "[\"" + day + "\", \"" + userLogin + "\"]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    countFoodVote: function(day, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/count_by_day?group=false',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + day + "\"]",
    			endkey	: "[\"" + day + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    countFoodVoteGrouped: function(day, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/food_vote/_view/count_by_day?group=true',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + day + "\"]",
    			endkey	: "[\"" + day + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
	/**
	 * save every minute that i'm online
	 */
	loggedInTask: function() {
		Ext.Ajax.request({
			url: "session/" + localStorage.getItem("keyword") + "/online",
			method: "POST",
			failure: function() {
				console.log('server-side error loggedIn.save');
			}
		});
	},
	
    /**
     * if user is session owner update that owner of session is logged in
     * every 3 minutes
     */
    updateSessionActivityTask: function() {
    	if (ARSnova.isSessionOwner) {
	    	restProxy.getSession(localStorage.getItem("sessionId"), {
				success: function(response, operation){
					var rows = Ext.decode(response.responseText).rows;
					
					if (rows.length > 0) {
						var session = Ext.ModelMgr.create(rows[0].value, 'Session');
					} else {
						console.log('session with id ' + operation + ' not found.');
						return;
					}
					
					session.set('lastOwnerActivity', new Date().getTime());
					session.save();
				},
				failure: function(){
					console.log('server-side error loggedIn.save');
				}
			});
    	}
    },
    
    getUserLogin: function(login, callbacks) {
    	Ext.Ajax.request({
    		url: this.url + '/_design/logged_in/_view/all',
    		method: 'GET',
    		params: {
    			key: "\"" + login + "\"",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    countActiveUsersBySession: function(sessionId, callbacks) {
    	var ts = new Date().getTime() - (3 * 60 * 1000);
    	Ext.Ajax.request({
    		url: this.url + '/_design/logged_in/_view/count',
    		method: 'GET',
    		params: {
    			startkey: "[\"" + sessionId + "\", " + ts + "]",
    			endkey: "[\"" + sessionId + "\", {}]",
    		},

    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    /* STATISTICS */
	    countActiveUsers: function(callbacks) {
	    	var ts = new Date().getTime() - (3 * 60 * 1000);
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_active_users',
	    		method: 'GET',
	    		params: {
	    			startkey: ts,
	    		},
	
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	});
	    },
	    
	    countActiveUsersWithSessionId: function(callbacks) {
	    	var ts = new Date().getTime() - (3 * 60 * 1000);
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_active_users_with_session?reduce=false',
	    		method: 'GET',
	    		params: {
	    			startkey: ts,
	    		},
	
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	});
	    },
	    
	    countActiveSessions: function(callbacks) {
	    	var ts = new Date().getTime() - (3 * 60 * 1000);
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_active_sessions?reduce=false',
	    		method: 'GET',
	    		params: {
	    			startkey: ts,
	    		},
	    		
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	});
	    },
	    
	    countSessions: function(callbacks) {
	    	Ext.Ajax.request({
	    		url: this.url + '/_design/statistic/_view/count_sessions?group=true',
	    		method: 'GET',
	
	    		success: callbacks.success,
	    		failure: callbacks.failure,
	    	});
	    },
	    
    getSkillQuestionsForUser: function(sessionId, callbacks){
    	var requestUrl = this.url;
    	
    	switch(ARSnova.loginMode){
    		case ARSnova.LOGIN_GUEST:
    			requestUrl += '/_design/skill_question/_view/by_session_for_all';
    			break;
    		case ARSnova.LOGIN_THM:
    			requestUrl += '/_design/skill_question/_view/by_session_for_thm';
    			break;
			default:
				requestUrl += '/_design/skill_question/_view/by_session_for_all';
				break;
    	}
	    Ext.Ajax.request({
	    	url: requestUrl,
	    	method: 'GET',
	    	params: {
	    		key: "\"" + sessionId + "\""
	    	},
	    	success: callbacks.success,
	    	failure: callbacks.failure,
	    });   		
    },
    
    maxNumberInSession: function(sessionId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/max_number_in_session',
    		method: 'GET',
    		params: {
    			key: "\"" + sessionId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
    
    releasedByCourseId: function(courseId, callbacks){
    	Ext.Ajax.request({
    		url: this.url + '/_design/skill_question/_view/released_by_course_id',
    		method: 'GET',
    		params: {
    			key: "\"" + courseId + "\""
    		},
    		success: callbacks.success,
    		failure: callbacks.failure,
    	});
    },
});