/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/user/questionPanel.js
 - Beschreibung: Panel zum Anzeigen aller freigegebenen Publikumsfragen.
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
ARSnova.views.user.QuestionPanel = Ext.extend(Ext.Carousel, {
	title	: Messages.QUESTIONS,
	iconCls	: 'tabBarIconQuestion',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionCounter: 0,
	
	constructor: function(){
		this.backButton = new Ext.Button({
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.mainTabPanel.tabPanel.setActiveItem(ARSnova.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		after: function() {
		    			this.hide();
		    		}
		    	});
			},
		});
		
		this.listeners = {
			cardswitch: function(panel, newCard, oldCard, index, animated){
				//update toolbar with question number
				var questionNumber = Messages.QUESTION;
				if(newCard.questionObj.number)
					questionNumber += " " + newCard.questionObj.number;
				panel.toolbar.setTitle(questionNumber);
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = index + 1;
				counterEl.update(counter.join("/"));
				
				newCard.fireEvent('preparestatisticsbutton', panel.statisticButton);
				
				//check for showStatistic flag
				if(newCard.questionObj.showStatistic && newCard.questionObj.showStatistic == 1)
					panel.statisticButton.show();
				else
					panel.statisticButton.hide();
			}
		};
		
		this.questionCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
		});
		
		this.statisticButton = new Ext.Button({
			text	: ' ',
			cls		: 'statisticIconSmall',
			hidden	: true,
			handler	: function() {
				var questionStatisticChart = new ARSnova.views.QuestionStatisticChart(ARSnova.mainTabPanel.tabPanel.userQuestionsPanel.layout.activeItem.questionObj, this)
				ARSnova.mainTabPanel.setActiveItem(questionStatisticChart, 'slide');
			},
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTION,
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.statisticButton,
		        this.questionCounter
	        ]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.user.QuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', this.beforeActivate);
		this.on('activate', this.onActivate);
		
		ARSnova.views.user.QuestionPanel.superclass.initComponent.call(this);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
		ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);
	},
	
	onActivate: function(){
		this.getUnansweredSkillQuestions();
	},
	
	getUnansweredSkillQuestions: function(){
		ARSnova.questionModel.getSkillQuestionsForUser(localStorage.getItem("sessionId"), {
			success: function(response){
				var userQuestionsPanel = ARSnova.mainTabPanel.tabPanel.userQuestionsPanel;
				var questions = Ext.decode(response.responseText).rows;
				var questionsArr = [];
				var questionIds = [];
				
				if (questions.length == 0){
					//no questions found
					userQuestionsPanel.questionCounter.hide();
					userQuestionsPanel.add({
						cls: 'centerText',
						html: Messages.NO_QUESTIONS,
					});
					userQuestionsPanel.indicator.hide();
					userQuestionsPanel.doLayout();
					ARSnova.hideLoadMask();
					return;
				} else {
					//update question counter in toolbar
					var counterEl = userQuestionsPanel.questionCounter;
					var counter = counterEl.el.dom.innerHTML.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.update(counter.join("/"));
				}
				
				if (questions.length == 1){
					userQuestionsPanel.indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
				});
				
				ARSnova.answerModel.getAnswerByUserAndSession(localStorage.getItem("login"), localStorage.getItem("sessionId"), {
					success: function(response){
						var answers = Ext.decode(response.responseText).rows;

						answers.forEach(function(answer){
							if(questionsArr[answer.value.questionId]) {
								questionsArr[answer.value.questionId].userAnswered = answer.value.answerText;
								questionsArr[answer.value.questionId].answerSubject = answer.value.answerSubject;
							}
						});
						questionIds.forEach(function(questionId){
							userQuestionsPanel.addQuestion(questionsArr[questionId]);
							userQuestionsPanel.doLayout();
						});
						userQuestionsPanel.checkAnswer();
						userQuestionsPanel.checkFirstQuestion();
						userQuestionsPanel.showNextUnanswered();
					},
					failure: function(response){
						console.log('error');
					}
				});
				ARSnova.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
	
	addQuestion: function(question){
		if (question.questionType === 'freetext') {
			this.add(new ARSnova.views.FreetextQuestion(question));
		} else {
			this.add(new ARSnova.views.Question(question));
		}
	},
	
	checkAnswer: function(){
		ARSnova.showLoadMask(Messages.CHECK_ANSWERS);
		this.items.items.forEach(function(questionPanel) {
			var questionObj = questionPanel.questionObj;
			if (!questionObj.userAnswered) return;
			
			var isQuestionAnswered = !!questionObj.userAnswered;
			if (!isQuestionAnswered) return;
			
			if (questionObj.questionType === "freetext") {
				questionPanel.setAnswerText(questionObj.answerSubject, questionObj.userAnswered);
				questionPanel.disable();
				return;
			}
			
			var list = questionPanel.down('list');
			var data = list.store.data;
			for (var i = 0; i < data.length; i++) {
				if (data.items[i].data.text == questionObj.userAnswered){
					list.getSelectionModel().select(data.items[i]);
					questionPanel.disable();
					break;
				}
			}
			
			if(questionObj.showAnswer){
				for ( var i = 0; i < questionObj.possibleAnswers.length; i++) {
					var answer = questionObj.possibleAnswers[i].data;
					if(answer.correct && (answer.correct == 1 || answer.correct == true)){
						list.el.dom.childNodes[i].className = "x-list-item x-list-item-correct";
						break;
					}
				}
			}
		});
		
		setTimeout("ARSnova.hideLoadMask()", 1000);
	},
	
	checkFirstQuestion: function() {
		var firstQuestionView = this.items.items[0];
		var firstQuestionObj = firstQuestionView.questionObj;
		
		firstQuestionView.fireEvent('preparestatisticsbutton', this.statisticButton);
		if(firstQuestionObj.showStatistic && firstQuestionObj.showStatistic == 1) {
			this.statisticButton.show();
		}
	},
	
	showNextUnanswered: function(){
		var questionPanels = this.items.items;
		var activeQuestion = this.layout.activeItem;
		if(!activeQuestion.disabled) return;
		
		var animDirection = 'right';
		for ( var i = 0; i < questionPanels.length; i++) {
			var questionPanel = questionPanels[i];
			
			if(questionPanel == activeQuestion) {
				animDirection = 'left';
				continue;
			}
			if(questionPanel.disabled) continue;
			
			this.setActiveItem(questionPanel, {
				type: 'slide',
				direction: animDirection
			});
			break;
		}
	}
});