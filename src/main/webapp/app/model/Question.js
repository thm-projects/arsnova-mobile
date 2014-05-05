/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/model/Question.js
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
Ext.define('ARSnova.model.Question', {
	extend: 'Ext.data.Model',
	
	config: {
		idProperty: '_id',
		proxy: { type: 'restProxy' },
		
		fields: [
		         '_rev',
		         'abstention',
		         'active',
		         'duration',
		         'noCorrect',
		         'type',
		         'number',
		         'numAnswers',
		         'piRound',
		         'possibleAnswers',
		         'questionType',
		         'releasedFor',
		         'session',
		         'sessionId',
		         'sessionKeyword',
		         'showAnswer',
		         'showStatistic',
		         'subject',
		      	 'text',
		      	 'timestamp',
		      	 'type'
		],
		
		transientFields: ['numAnswers'],
		
		validations: [
		         {type: 'presence', field: 'type'},
		         {type: 'presence', field: 'text'},
		         {type: 'presence', field: 'subject'}
		]
	},
	
	initialize: function() {
		this.callParent(arguments);
		
		for (var i = 0; field = this.config.transientFields[i]; i++) {
			if (typeof this.get(field) !== "undefined") {
				delete this[this.persistanceProperty][field];
			}
		}
	},
    
    destroy: function(queObj, callbacks) {
    	return this.getProxy().delQuestion(queObj, callbacks);
    },
    
    destroyAll: function(sessionKeyword, callbacks) {
    	return this.getProxy().delAllQuestions(sessionKeyword, callbacks);
    },
    
    deleteAllPreparationQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().delAllPreparationQuestions(sessionKeyword, callbacks);
    },
    
    deleteAllFlashcards: function(sessionKeyword, callbacks) {
    	return this.getProxy().delAllFlashcards(sessionKeyword, callbacks);
    },
    
    deleteAllLectureQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().delAllLectureQuestions(sessionKeyword, callbacks);
    },
    
    deleteInterposed: function(question, callbacks) {
		return this.getProxy().deleteInterposedQuestion(question, callbacks);
    },
    
    deleteAnswers: function(questionId, callbacks) {
    	return this.getProxy().delAnswers(questionId, callbacks);
    },
    
    getQuestionById: function(id, callbacks) {
    	return this.getProxy().getQuestionById(id, callbacks);
    },
    
    getSkillQuestion: function(id, callbacks) {
    	return this.getProxy().getSkillQuestion(id, callbacks);
    },
    
    saveSkillQuestion: function(callbacks) {
    	if (this.get('_id') && this.get('_rev')) {
    		return this.getProxy().updateSkillQuestion(this, callbacks);
    	}
    	return this.getProxy().saveSkillQuestion(this, callbacks);
    },
    
    publishSkillQuestion: function(callbacks) {
    	return this.getProxy().publishSkillQuestion(this, callbacks);
    },
    
    publishAllSkillQuestions: function(sessionKeyword, active, callbacks) {
		return this.getProxy().publishAllSkillQuestions(sessionKeyword, active, callbacks);
    },
    
    publishSkillQuestionStatistics: function(callbacks) {
    	return this.getProxy().publishSkillQuestionStatistics(this, callbacks);
    },
    
    publishCorrectSkillQuestionAnswer: function(callbacks) {
    	return this.getProxy().publishCorrectSkillQuestionAnswer(this, callbacks);
    },
    
    getLectureQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().getLectureQuestions(sessionKeyword, callbacks);
    },
    
    getFlashcards: function(sessionKeyword, callbacks) {
    	return this.getProxy().getFlashcards(sessionKeyword, callbacks);
    },
    
    getPreparationQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().getPreparationQuestions(sessionKeyword, callbacks);
    },
    
    getSkillQuestionsForDelete: function(sessionId, callbacks) {
    	return this.getProxy().getSkillQuestionsForDelete(sessionId, callbacks);
    },
    
    getUnansweredSkillQuestions: function(sessionKeyword, callbacks){
    	return this.getProxy().getUnansweredSkillQuestions(sessionKeyword, callbacks);
    },
    
    getUnansweredLectureQuestions: function(sessionKeyword, callbacks){
    	return this.getProxy().getUnansweredLectureQuestions(sessionKeyword, callbacks);
    },
    
    getUnansweredPreparationQuestions: function(sessionKeyword, callbacks){
    	return this.getProxy().getUnansweredPreparationQuestions(sessionKeyword, callbacks);
    },
    
    countSkillQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().countSkillQuestions(sessionKeyword, callbacks);
    },
    
    countPreparationQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().countPreparationQuestions(sessionKeyword, callbacks);
    },
    
    countFlashcards: function(sessionKeyword, callbacks) {
    	return this.getProxy().countFlashcards(sessionKeyword, callbacks);
    },
    
    countLectureQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().countLectureQuestions(sessionKeyword, callbacks);
    },
	
	countTotalAnswers: function(sessionKeyword, callbacks) {
		return this.getProxy().countTotalAnswers(sessionKeyword, callbacks);
	},
	
	countPreparationQuestionAnswers: function(sessionKeyword, callbacks) {
		return this.getProxy().countPreparationQuestionAnswers(sessionKeyword, callbacks);
	},
	
	countLectureQuestionAnswers: function(sessionKeyword, callbacks) {
		return this.getProxy().countLectureQuestionAnswers(sessionKeyword, callbacks);
	},
    
    getInterposedQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().getInterposedQuestions(sessionKeyword, callbacks);
    },
    
    getInterposed: function(callbacks) {
    	return this.getProxy().getInterposedQuestion(this, callbacks);
    },
    
    saveInterposed: function(callbacks) {
    	return this.getProxy().saveInterposedQuestion(this.data.subject, this.data.text, this.data.sessionKeyword, callbacks);
    },
    
    countFeedbackQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().countFeedbackQuestions(sessionKeyword, callbacks);
    },
    
    changeQuestionType: function(sessionId, callbacks) {
    	return this.getProxy().changeQuestionType(sessionId, callbacks);
    },
    
    countAnswers: function(sessionKeyword, questionId, callbacks) {
    	return this.getProxy().countAnswers(sessionKeyword, questionId, callbacks);
    },

	countAnswersByQuestion: function(sessionKeyword, questionId, callbacks) {
		return this.getProxy().countAnswersByQuestion(sessionKeyword, questionId, callbacks);
	},
	
	getAnsweredFreetextQuestions: function(sessionKeyword, questionId, callbacks) {
		return this.getProxy().getAnsweredFreetextQuestions(sessionKeyword, questionId, callbacks);
	},
	
	deleteAnswer: function(questionId, answerId, callbacks) {
		return this.getProxy().deleteAnswer(questionId, answerId, callbacks);
	},
	
	getSkillQuestionsForUser: function(sessionKeyword, callbacks) {
		return this.getProxy().getSkillQuestionsForUser(sessionKeyword, callbacks);
	},
	
	getLectureQuestionsForUser: function(sessionKeyword, callbacks) {
		return this.getProxy().getLectureQuestionsForUser(sessionKeyword, callbacks);
	},
	
	getPreparationQuestionsForUser: function(sessionKeyword, callbacks) {
		return this.getProxy().getPreparationQuestionsForUser(sessionKeyword, callbacks);
	},
    
    releasedByCourseId: function(courseId, callbacks) {
    	return this.getProxy().releasedByCourseId(courseId, callbacks);
    },
    
    deleteAllInterposedQuestions: function(sessionKeyword, callbacks) {
    	return this.getProxy().deleteAllInterposedQuestions(sessionKeyword, callbacks);
    },
    
    deleteAllQuestionsAnswers: function(sessionKeyword, callbacks) {
    	return this.getProxy().delAllQuestionsAnswers(sessionKeyword, callbacks);
    }
});
