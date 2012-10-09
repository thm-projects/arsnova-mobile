/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
ARSnova.views.speaker.ShowcaseQuestionPanel = Ext.extend(Ext.Carousel, {
	title	: Messages.QUESTIONS,
	iconCls	: 'tabBarIconQuestion',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionCounter: 0,
	
	constructor: function(){
		this.listeners = {
			cardswitch: function(panel, newCard, oldCard, index, animated){
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = index + 1;
				counterEl.update(counter.join("/"));
				
				newCard.fireEvent('preparestatisticsbutton', panel.statisticButton);
			}
		};
		
		this.questionCounter = new Ext.Container({
			cls: "x-toolbar-title alignRight",
			html: '0/0',
		});
		
		this.statisticButton = new Ext.Button({
			text	: ' ',
			cls		: 'statisticIconSmall',
			handler	: function() {
				var questionStatisticChart = new ARSnova.views.QuestionStatisticChart(ARSnova.mainTabPanel.tabPanel.speakerTabPanel.layout.activeItem.questionObj, this)
				ARSnova.mainTabPanel.setActiveItem(questionStatisticChart, 'slide');
			},
		});
		
		this.leaveShowcaseButton = new Ext.Button({
			cls		: "thm",
			text	: Messages.LEAVE,
			scope	: this,
			handler	: function() {
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.setActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'down',
					duration	: 700,
					scope		: this,
					after: function() {
						this.hide();
					}
				});
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTION,
			items: [
		        { xtype: 'spacer' },
		        this.leaveShowcaseButton,
		        this.statisticButton,
		        this.questionCounter
	        ]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.speaker.ShowcaseQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('beforeactivate', this.beforeActivate);
		this.on('activate', this.onActivate);
		
		ARSnova.views.speaker.ShowcaseQuestionPanel.superclass.initComponent.call(this);
	},
	
	beforeActivate: function(){
		this.removeAll();
		this.indicator.show();
		this.questionCounter.show();
		this.toolbar.setTitle(Messages.QUESTION);
		
		ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);
	},
	
	onActivate: function(){
		this.getAllSkillQuestions();
	},
	
	getAllSkillQuestions: function(){
		ARSnova.questionModel.getSkillQuestionsSortBySubject(localStorage.getItem("sessionId"), {
			success: function(response) {
				var questions = Ext.decode(response.responseText).rows;
				var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel;
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.el.dom.innerHTML.split("/");
				counter[0] = "1";
				counter[1] = questions.length;
				counterEl.update(counter.join("/"));
				
				if (questions.length == 1){
					panel.indicator.hide();
				}
				
				var questionsArr = [];
				var questionIds = [];
				questions.forEach(function(question){
					questionsArr[question.id] = question.value;
					questionsArr[question.id]._id = question.id;
					questionIds.push(question.id);
				});
				questionIds.forEach(function(questionId){
					panel.addQuestion(questionsArr[questionId]);
				});
				panel.checkFirstQuestion();
				
				panel.doLayout();
				ARSnova.hideLoadMask();
			},
			failure: function(response){
				console.log('error');
			}
		});
	},
	
	addQuestion: function(question){
		if (question.questionType === 'freetext') {
			this.add(new ARSnova.views.FreetextQuestion(question, true));
		} else {
			this.add(new ARSnova.views.Question(question, true));
		}
	},
	
	checkFirstQuestion: function() {
		var firstQuestionView = this.items.items[0];
		
		firstQuestionView.fireEvent('preparestatisticsbutton', this.statisticButton);
	}
});