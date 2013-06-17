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
Ext.define('ARSnova.view.user.QuestionPanel', {
	extend: 'Ext.Carousel',
	
	config: {
		fullscreen: true,
		title	: Messages.QUESTIONS,
		iconCls	: 'tabBarIconQuestion'
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,

	questionCounter: 0,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		listeners: { animationend: function() { 
		    			this.hide();
		    		}, scope: this }
		    	});
			}
		});
		
		this.on('activeitemchange', function(panel, newCard, oldCard) {
			var backButtonHidden = this.backButton.isHidden();
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			
			if(newCard.questionObj.questionType === 'abcd') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_SINGLE_CHOICE) : this.toolbar.setTitle(Messages.QUESTION_SINGLE_CHOICE_SHORT);
			} else if(newCard.questionObj.questionType === 'text') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_FREETEXT) : this.toolbar.setTitle(Messages.QUESTION_FREETEXT_SHORT);
			} else if(newCard.questionObj.questionType === 'mc') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_MC) : this.toolbar.setTitle(Messages.QUESTION_MC_SHORT);
			} else if(newCard.questionObj.questionType === 'eval') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_RATING) : this.toolbar.setTitle(Messages.QUESTION_RATING_SHORT);
			} else if(newCard.questionObj.questionType === 'yesno') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_YESNO) : this.toolbar.setTitle(Messages.QUESTION_YESNO);
			} else if(newCard.questionObj.questionType === 'school') {
				(screenWidth > 320 || backButtonHidden) ? this.toolbar.setTitle(Messages.QUESTION_GRADE) : this.toolbar.setTitle(Messages.QUESTION_GRADE_SHORT);
			}
			
			//update question counter in toolbar
			var counterEl = panel.questionCounter;
			var counter = counterEl.element.dom.innerText.split("/");

			counter[0] = panel.activeIndex + 1;
			counterEl.setHtml(counter.join("/"));
			
			newCard.fireEvent('preparestatisticsbutton', panel.statisticButton);
			
			//check for showStatistic flag
			if(typeof newCard.questionObj !== 'undefined') {
				if(newCard.questionObj.showStatistic && newCard.questionObj.showStatistic == 1)
					panel.statisticButton.show();
				else
					panel.statisticButton.hide();
			}
		});
		
		this.questionCounter = Ext.create('Ext.Container', {
			cls: "x-toolbar-title alignRight counterText",
			html: '0/0'
		});
		
		this.statisticButton = Ext.create('Ext.Button', {
			text	: ' ',
			cls		: 'statisticIconSmall',
			hidden	: true,
			handler	: function() {
				var questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question: ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel._activeItem.questionObj,
					lastPanel: this
				});
				ARSnova.app.mainTabPanel.animateActiveItem(questionStatisticChart, 'slide');
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION,
			docked: 'top',
			ui: 'light',
			items: [
		        this.backButton,
		        { xtype: 'spacer' },
		        this.statisticButton,
		        this.questionCounter
	        ]
		});
		
		this.add([this.toolbar]);
		
		this.onBefore('activate', this.beforeActivate, this);
		this.onAfter('activate', this.onActivate, this);
		this.on('add', function(panel, component, index) {
			component.doTypeset && component.doTypeset(panel);
		});
	},
	
	beforeActivate: function(){
		this.removeAll(false);
		this._indicator.show();
		this.questionCounter.show();
		ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);
	},
	
	onActivate: function(){
		this.getUnansweredSkillQuestions();
	},
	
	getUnansweredSkillQuestions: function(){
		var self = this;
		
		ARSnova.app.questionModel.getSkillQuestionsForUser(localStorage.getItem("keyword"), {
			success: function(questions){
				var userQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel;
				var questionsArr = [];
				var questionIds = [];
				
				if (questions.length == 0){
					//no available questions found
					
					ARSnova.app.questionModel.countSkillQuestions(localStorage.getItem("keyword"), {
						success: function(response){
							var questionsInCourse = Ext.decode(response.responseText);
							
							if (questionsInCourse > 0) {
								userQuestionsPanel.questionCounter.hide();
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_UNLOCKED_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel._indicator.hide();
								ARSnova.app.hideLoadMask();
								
							} else {
								userQuestionsPanel.questionCounter.hide();
								userQuestionsPanel.add({
									cls: 'centerText',
									html: Messages.NO_QUESTIONS
								});
								userQuestionsPanel.next();
								userQuestionsPanel._indicator.hide();
								ARSnova.app.hideLoadMask();
							}
						},
						failure: function() {
			    			console.log('error');
			    		}
					});
					return;
					
				} else {
					//update question counter in toolbar
					var counterEl = userQuestionsPanel.questionCounter;
					var counter = counterEl.element.dom.innerText.split("/");
					counter[0] = "1";
					counter[1] = questions.length;
					counterEl.setHtml(counter.join("/"));
				}
				
				if (questions.length == 1){
					userQuestionsPanel._indicator.hide();
				}
				
				questions.forEach(function(question){
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});
				
				ARSnova.app.answerModel.getAnswerByUserAndSession(localStorage.getItem("keyword"), {
					success: function(response){
						var answers = Ext.decode(response.responseText);

						answers.forEach(function(answer){
							if(questionsArr[answer.questionId]) {
								questionsArr[answer.questionId].userAnswered = answer.answerText;
								questionsArr[answer.questionId].answerSubject = answer.answerSubject;
								questionsArr[answer.questionId].isAbstentionAnswer = answer.abstention;
							}
						});
						questionIds.forEach(function(questionId){
							userQuestionsPanel.addQuestion(questionsArr[questionId]);
						});
						
						// bugfix (workaround): after removing all items from carousel the active index
						// is set to -1. To fix that you have manually  set the activeItem on the first
						// question.
						self.setActiveItem(0);
						
						userQuestionsPanel.checkAnswer();
						userQuestionsPanel.checkFirstQuestion();
						userQuestionsPanel.showNextUnanswered();
					},
					failure: function(response){
						console.log('error');
					}
				});
				ARSnova.app.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
	
	addQuestion: function(question){
		if (question.questionType === 'freetext') {
			this.add(Ext.create('ARSnova.view.FreetextQuestion', {
				questionObj: question
			}));
		} else {
			this.add(Ext.create('ARSnova.view.Question', {
				questionObj: question
			}));
		}
	},
	
	checkAnswer: function(){
		ARSnova.app.showLoadMask(Messages.CHECK_ANSWERS);
		
		this.getInnerItems().forEach(function(questionPanel) {
			var questionObj = questionPanel.questionObj;
			if (!questionObj.userAnswered && !questionObj.isAbstentionAnswer) return;
			
			if (questionObj.isAbstentionAnswer) {
				questionPanel.disable();
				return;
			}
			
			if (questionObj.questionType === "freetext") {
				questionPanel.setAnswerText(questionObj.answerSubject, questionObj.userAnswered);
				questionPanel.disableQuestion();
				return;
			}
			
			var list = questionPanel.down('list');
			var data = list ? list.getStore().data : [];
			
			if (questionObj.questionType === 'mc') {
				var answers = questionObj.userAnswered.split(",");
				// sanity check: is it a correct answer array?
				if (questionObj.possibleAnswers.length !== answers.length) {
					return;
				}
				var selectedIndexes = answers.map(function(isSelected, index) {
					return isSelected === "1" ? list.getStore().getAt(index) : -1;
				}).filter(function(index) {
					return index !== -1;
				});
				list.select(selectedIndexes, true);
				questionPanel.disableQuestion();
			} else {
				for (var i = 0; i < data.length; i++) {
					if (data.items[i].data.text == questionObj.userAnswered){
						list.select(data.items[i]);
						questionPanel.disableQuestion();
						break;
					}
				}
			}
			if (questionObj.showAnswer) {
				list.getStore().each(function(item) {
					item.set('questionAnswered', true);
				});
			}
		}, this);
		
		setTimeout("ARSnova.app.hideLoadMask()", 1000);
	},
	
	checkFirstQuestion: function() {
		// items index has to be 2, because index 0 and 1 are occupied by toolbar and panel
		var firstQuestionView = this.items.items[2];
		var firstQuestionObj = firstQuestionView.questionObj;

		firstQuestionView.fireEvent('preparestatisticsbutton', this.statisticButton);
		if(firstQuestionObj.showStatistic && firstQuestionObj.showStatistic == 1) {
			this.statisticButton.show();
		}
	},
	
	showNextUnanswered: function(){
		var questionPanels = this.items.items;
		var activeQuestion = this._activeItem;
		if(!activeQuestion.isDisabled()) return;
		
		var currentPosition = 0;
		for (var i = 0, questionPanel; questionPanel = questionPanels[i]; i++) {
			if (questionPanel == activeQuestion) {
				currentPosition = i;
				break;
			}
		}

		for (var i = currentPosition, questionPanel; questionPanel = questionPanels[i]; i++) {
			if (questionPanel.isDisabled()) continue;

			this.setActiveItem(i-2, {
				type: 'slide',
				direction: 'left'
			});
			break;
		}
	},
	
	renew: function() {
		this.removeAll();
		this.getUnansweredSkillQuestions();
	}
});