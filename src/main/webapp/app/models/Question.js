/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/models/Question.js
 - Beschreibung: Question-Model
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
ARSnova.models.Question = Ext.regModel('Question', {
	idProperty: '_id',
    proxy: restProxy,
    
    fields: [
      'type',
   	  'text',
   	  'subject',
   	  'sessionId'
    ],
           
   	validations: [
      {type: 'presence', field: 'type'},
      {type: 'presence', field: 'text'},
      {type: 'presence', field: 'subject'},
      {type: 'presence', field: 'sessionId'}
    ],
    
    destroy: function(queObj, callbacks) {
    	return this.proxy.delQuestion(queObj, callbacks);
    },
    
    deleteInterposed: function(question, callbacks) {
		return this.proxy.deleteInterposedQuestion(question, callbacks);
    },
    
    deleteAnswers: function(questionId, callbacks) {
    	return this.proxy.delAnswers(questionId, callbacks);
    },
    
    getQuestionById: function(id, callbacks){
    	return this.proxy.getQuestionById(id, callbacks);
    },
    
    getSkillQuestionsSortBySubjectAndText: function(sessionKeyword, callbacks) {
    	return this.proxy.getSkillQuestionsSortBySubjectAndText(sessionKeyword, callbacks);
    },
    
    getSkillQuestionsForDelete: function(sessionId, callbacks) {
    	return this.proxy.getSkillQuestionsForDelete(sessionId, callbacks);
    },
    
    getAnsweredSkillQuestions: function(sessionId, userLogin, callbacks){
    	return this.proxy.getAnsweredSkillQuestions(sessionId, userLogin, callbacks);
    },
    
    getUnansweredSkillQuestions: function(sessionKeyword, callbacks){
    	return this.proxy.getUnansweredSkillQuestions(sessionKeyword, callbacks);
    },
    
    countSkillQuestions: function(sessionKeyword, callbacks) {
    	return this.proxy.countSkillQuestions(sessionKeyword, callbacks);
    },
	
	countTotalAnswers: function(sessionKeyword, callbacks) {
		return this.proxy.countTotalAnswers(sessionKeyword, callbacks);
	},
    
    getInterposedQuestions: function(sessionKeyword, callbacks) {
    	return this.proxy.getInterposedQuestions(sessionKeyword, callbacks);
    },
    
    getInterposed: function(callbacks) {
    	return this.proxy.getInterposedQuestion(this, callbacks);
    },
    
    saveInterposed: function(callbacks) {
    	return this.proxy.saveInterposedQuestion(this.data.subject, this.data.text, this.data.sessionKeyword, callbacks);
    },
    
    countFeedbackQuestions: function(sessionKeyword, callbacks) {
    	return this.proxy.countFeedbackQuestions(sessionKeyword, callbacks);
    },
    
    changeQuestionType: function(sessionId, callbacks) {
    	return this.proxy.changeQuestionType(sessionId, callbacks);
    },
    
    countAnswers: function(questionId, callbacks) {
    	return this.proxy.countAnswers(questionId, callbacks);
    },

	countAnswersByQuestion: function(sessionKeyword, questionId, callbacks) {
		return this.proxy.countAnswersByQuestion(sessionKeyword, questionId, callbacks);
	},
	
	getAnsweredFreetextQuestions: function(sessionKeyword, questionId, callbacks) {
		return this.proxy.getAnsweredFreetextQuestions(sessionKeyword, questionId, callbacks);
	},
	
	deleteFreetextAnswer: function(id, rev, callbacks) {
		return this.proxy.removeEntry(id, rev, callbacks);
	},
    
    getSkillQuestionsForUser: function(sessionKeyword, callbacks) {
    	return this.proxy.getSkillQuestionsForUser(sessionKeyword, callbacks);
    },
    
    releasedByCourseId: function(courseId, callbacks) {
    	return this.proxy.releasedByCourseId(courseId, callbacks);
    }
});