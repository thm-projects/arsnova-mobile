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

	index: function(options){
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.backButton.show();
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel, 'slide');
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.addListener('deactivate', function(panel){
    		panel.backButton.hide();
    	}, this, {single: true});
    },
    
    listAudienceQuestions: function(){
    	var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.animateActiveItem(sTP.audienceQuestionPanel, 'slide');
    },
    
    listFeedbackQuestions: function(){
    	ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.backButton.show();
    	ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel, 'slide');
    	ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.addListener('deactivate', function(panel){
    		panel.questionsPanel.backButton.hide();
    	}, this, {single: true});
    },
    
    add: function(options){
    	var question = Ext.ModelMgr.create({
			type	 	: options.type,
			questionType: options.questionType,
			sessionKeyword: options.sessionKeyword,
			subject		: options.subject.toUpperCase(),
			text 		: options.text,
			active		: options.active,
			number		: options.number,
			releasedFor	: options.releasedFor,
			courses		: options.courses,
			possibleAnswers: options.possibleAnswers,
			noCorrect	: options.noCorrect
		}, 'Question');
    	
    	var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
    	panel.query('textfield').forEach(function(el){
    		el.removeCls("required");
    	});

    	var error = false;
    	var validation = question.validate();
    	if (!validation.isValid()){
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.field + ']').addCls("required");
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
				panel.multipleChoiceQuestion.query('textfield').forEach(function(el){
					if(!el.hidden && el.getValue().trim() == "") {
						el.addCls("required");
						error = true;
					}
				});
				break;
		}
    	if(error){
    		Ext.Msg.alert('Hinweis', 'Ihre Eingaben sind unvollständig');
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
		var isFromFreetextAnswerPanel = ARSnova.app.mainTabPanel.getActiveItem().constructor === ARSnova.view.FreetextAnswerPanel;
		// This gets called either by the speaker or by a student
		if (ARSnova.app.isSessionOwner && !isFromFreetextAnswerPanel) {
			parentPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			options.answer.deletable = true;
		} else {
			parentPanel = ARSnova.app.mainTabPanel;
			options.answer.deletable = false;
		}

		parentPanel.animateActiveItem(Ext.create('ARSnova.view.FreetextDetailAnswer', {
			sTP		: parentPanel,
			answer	: options.answer
		}), 'slide');
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
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
			}
    	});
    },
    
	setActive: function(options){
		ARSnova.app.questionModel.getSkillQuestion(options.questionId, {
			success: function(response) {
				var question = Ext.ModelMgr.create(Ext.decode(response.responseText), 'Question');
				question.set('active', options.active);
				
				question.publishSkillQuestion({
					success: function(response){
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionDetailsPanel;
						var questionStatus = panel.questionStatusButton;
						
						if(options.active == 1){
							questionStatus.questionOpenedSuccessfully();
							panel.down('textfield[label=Status]').setValue("Freigegeben");
						} else {
							questionStatus.questionClosedSuccessfully();
							panel.down('textfield[label=Status]').setValue("Nicht Freigegeben");
						}
					},
					failure: function(records, operation){
						Ext.Msg.alert("Hinweis!", "Speichern der Frage war nicht erfolgreich");
					}
				});
			},
			failure: function(records, operation){
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
			}
		});
	},
    
    adHoc: function(){
    	var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		
		sTP.animateActiveItem(sTP.newQuestionPanel, {
			type: 'slide',
			duration: 700
		});
		
		/* change the backButton-redirection to inClassPanel,
		 * but only for one function call */
		var backButton = sTP.newQuestionPanel.down('button[ui=back]');
		backButton.handler = function(){
			var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
			sTP.animateActiveItem(sTP.inClassPanel, {
				type: 'slide',
				direction: 'right',
				duration: 700
			});
		};
		backButton.setText("Home");
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
		
    	ARSnova.app.hideLoadMask();
    }
});