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
Ext.define('ARSnova.view.speaker.ShowcaseQuestionPanel', {
	extend: 'Ext.Carousel',
	
	config: {
		fullscreen: true,
		title	: Messages.QUESTIONS,
		iconCls	: 'tabBarIconQuestion',
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionCounter: 0,
	
	initialize: function(){
		this.callParent(arguments);
		
		this.on('activeitemchange', function(panel, newCard, oldCard){
			//update question counter in toolbar
			var counterEl = panel.questionCounter;
			var counter = counterEl.element.dom.innerText.split("/");

			counter[0] = panel.activeIndex + 1;
			counterEl.setHtml(counter.join("/"));

			newCard.fireEvent('preparestatisticsbutton', panel.statisticButton);
		});
		
		this.questionCounter = Ext.create('Ext.Container', {
			cls: "x-toolbar-title alignRight counterText",
			html: '0/0'
		});
		
		this.statisticButton = Ext.create('Ext.Button', {
			text	: ' ',
			cls		: 'statisticIconSmall',
			handler	: function() {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question: ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel._activeItem._activeItem.questionObj, 
					lastPanel: this
				});
				ARSnova.app.mainTabPanel.animateActiveItem(sTP.questionStatisticChart, 'slide');
			}
		});
		
		this.backButton = Ext.create('Ext.Button', {
			ui		: 'back',
			text	: Messages.BACK,
			scope	: this,
			handler	: function() {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.audienceQuestionPanel, {
					type		: 'slide',
					direction	: 'down',
					duration	: 700,
					scope		: this,
		    		listeners: { animationend: function() { 
		    			this.hide();
		    		}, scope: this }
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION,
			docked: 'top',
			items: [
			    this.backButton,
		        { xtype: 'spacer' },
		        this.statisticButton,
		        this.questionCounter
	        ]
		});

		this.add([this.toolbar]);
		
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activate', this.onActivate);
	},
	
	beforeActivate: function(){
		this.removeAll(true);
		this._indicator.show();
		this.questionCounter.show();
		this.toolbar.setTitle(Messages.QUESTION);
		
		ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH_QUESTIONS);
	},
	
	onActivate: function(){
		this.getAllSkillQuestions();
	},
	
	getAllSkillQuestions: function(){
		ARSnova.app.questionModel.getSkillQuestionsSortBySubjectAndText(localStorage.getItem("keyword"), {
			success: function(response) {
				var questions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel;
				
				//update question counter in toolbar
				var counterEl = panel.questionCounter;
				var counter = counterEl.element.dom.innerText.split("/");
				counter[0] = "1";
				counter[1] = questions.length;
				counterEl.setHtml(counter.join("/"));
				
				if (questions.length == 1){
					panel._indicator.hide();
				}
				
				var questionsArr = [];
				var questionIds = [];
				questions.forEach(function(question){
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});
				questionIds.forEach(function(questionId){
					panel.addQuestion(questionsArr[questionId]);
				});
				
				// bugfix (workaround): after removing all items from carousel the active index
				// is set to -1. To fix that you have manually  set the activeItem on the first
				// question.
				panel.setActiveItem(0);
				panel.checkFirstQuestion();
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
				questionObj: question, 
				viewOnly: true
			}));
		} else {
			this.add(Ext.create('ARSnova.view.Question', {
				questionObj: question, 
				viewOnly: true
			}));
		}
	},
	
	checkFirstQuestion: function() {
		var firstQuestionView = this.items.items[0];
		
		firstQuestionView.fireEvent('preparestatisticsbutton', this.statisticButton);
	}
});