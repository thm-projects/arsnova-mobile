/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/audienceQuestionPanel.js
 - Beschreibung: Panel zum Verwalten der Publikumsfragen.
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
Ext.namespace('ARSnova.views.speaker');

ARSnova.views.speaker.AudienceQuestionPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	monitorOrientation: true,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	newQuestionButton: null,
	
	questionEntries: [],
	
	updateAnswerCount: {
		name: 'refresh the number of answers inside the badges',
		run: function() {
			ARSnova.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel.getQuestionAnswers();
		},
		interval: 10000 //10 seconds
	},
	
	constructor: function(){
		this.newQuestionButton = [{
			xtype: 'form',
			cls  : 'standardForm topPadding',
			items: [{
				xtype	: 'button',				
				text	: Messages.NEW_QUESTION,
				cls		: 'forwardListButton',
				handler	: this.newQuestionHandler
			}]
		}];
		
		this.backButton = new Ext.Button({
			text	: Messages.HOME,
			ui		: 'back',
			handler	: function() {
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.inClassPanel.updateAudienceQuestionBadge();
				sTP.setActiveItem(sTP.inClassPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.addButton = new Ext.Button({
			text	: '+',
			cls		: 'plusButton',
			scope	: this,
			handler	: this.newQuestionHandler
		});
		
		this.showcaseButton = new Ext.Button({
			cls		: "thm",
			text	: Messages.SHOWCASE,
			hidden	: true,
			scope	: this,
			handler	: this.showcaseHandler
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTIONS,
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.showcaseButton,
		        this.addButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [];
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		this.on('orientationchange', this.onOrientationChange);
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function() {
		taskManager.start(this.updateAnswerCount);
		this.removeAll();
		this.questionEntries = [];

		ARSnova.questionModel.getSkillQuestionsSortBySubjectAndText(localStorage.getItem('keyword'), {
			success: this.questionsCallback,
			empty: Ext.createDelegate(function() {
				this.showcaseButton.hide();
				this.add(this.newQuestionButton);
				this.doLayout();
			}, this),
			failure: function(response) {
				console.log('server-side error questionModel.getSkillQuestions');
			}
		});
	},
	
	onDeactivate: function() {
		taskManager.stop(this.updateAnswerCount);
	},
	
	onOrientationChange: function(panel, orientation, width, height) {
		this.displayShowcaseButton();
	},
	
	/**
	 * Displays the showcase button if enough screen width is available
	 */
	displayShowcaseButton: function() {
		if (window.innerWidth >= 480) {
			this.showcaseButton.show();
		} else {
			this.showcaseButton.hide();
		}
	},

	/**
	 * Callback Function for database.getAudienceQuestions
	 */
	questionsCallback: function(response){
		var createEntry = function(question) {
			var status = (question.active && question.active == 1) ? " isActive" : "";
			
			return new Ext.Button({
				cls: 'forwardListButton' + status,
				badgeCls: 'doublebadgeicon',
				text: question.text,
				questionObj: question,
				handler: function(button) {
					Ext.dispatch({
						controller	: 'questions',
						action		: 'details',
						question	: button.questionObj
					});
				}
			});
		};
		
		var questions = Ext.decode(response.responseText);
		var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
		
		panel.displayShowcaseButton();
		
		var fieldsets = {};
		
		// Build up our question view...
		for(var i = 0, question; question = questions[i]; i++) {
			// 1. Create unique fieldsets
			if (typeof fieldsets[question.subject] === "undefined") {
				fieldsets[question.subject] = panel.add({
					xtype: 'fieldset',
					title: question.subject
				});
			}
			
			// 2. Create question entries
			var questionEntry = createEntry(question);
			// store entries inside special array to allow for an updating answer count
			panel.questionEntries.push(questionEntry);
			
			// 3. Wire up question entries to their fieldsets
			fieldsets[question.subject].add(questionEntry);
		}
		
		// ... and load the answer count for each question
		panel.getQuestionAnswers(function() {
			panel.doLayout();
			ARSnova.hideLoadMask();
		});
	},
	
	newQuestionHandler: function(){
		var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.newQuestionPanel, 'slide');
	},
	
	showcaseHandler: function() {
		var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.showcaseQuestionPanel, {
			type		: 'slide',
			direction	: 'up'
		});
	},
	
	getQuestionAnswers: function(continuation) {
		// How many requests do we need to run?
		var finishedRequests = 0;
		var numRequests = this.questionEntries.length;
		
		this.questionEntries.forEach(function(q) {
			ARSnova.questionModel.countAnswersByQuestion(q.questionObj._id, {
				success: function(response) {
					var answers = Ext.decode(response.responseText).rows;
					var numAnswers = answers.length > 0 ? answers[0].value : "";
					q.setBadge(numAnswers);
				},
				failure: function() {
					console.log("Could not update answer count");
				},
				callback: function() {
					// Run continuation (if provided) when all requests have finished
					if (numRequests === ++finishedRequests && continuation) {
						return continuation();
					}
				}
			});
		});
	}
});