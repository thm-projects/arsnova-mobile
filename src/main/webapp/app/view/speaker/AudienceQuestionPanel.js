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
Ext.define('ARSnova.view.speaker.AudienceQuestionPanel', {
	extend: 'Ext.Panel',

	config: {
		scroll: 'vertical',
		
		monitorOrientation: true,
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null,
		
		controls: null,
		questions: null,
		newQuestionButton: null,
		
		questionStore: null,
		questionEntries: []
	},
	
	updateAnswerCount: {
		name: 'refresh the number of answers inside the badges',
		run: function() {
			var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
			panel.getQuestionAnswers.call(panel);
		},
		interval: 10000 //10 seconds
	},
	
	constructor: function(){
		this.questionStore = new Ext.data.JsonStore({
			model: ARSnova.models.Question,
			getGroupString: function(record) {
				return record.get('subject');
			}
		});
		this.questions = new ARSnova.view.BadgeList({
			scroll: false,
			itemCls: 'forwardListButton',
			itemTpl: '<tpl if="active"><span class="isActive">{text}</span></tpl><tpl if="!active">{text}</tpl>',
			grouped: true,
			store: this.questionStore,
			
			listeners: {
				itemtap: function(list, index, element) {
					ARSnova.app.getController('Questions').details({
						question	: list.store.getAt(index).data
					});
				}
			}
		});
		
		this.controls = new Ext.form.FormPanel({
			cls: 'standardForm topPadding'
		});
		this.questionsContainer = new Ext.form.FieldSet({
			title: Messages.QUESTIONS,
			hidden: true,
			items: [this.questions]
		});
		
		this.newQuestionButton = {
			xtype	: 'button',
			text	: Messages.NEW_QUESTION,
			cls		: 'forwardListButton',
			handler	: this.newQuestionHandler
		};
		
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
		
		this.showcaseFormButton = {
			xtype: "button",
			text: Messages.SHOWCASE_MODE,
			cls: "forwardListButton",
			handler: this.showcaseHandler
		};
		
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
		this.items = [this.controls, {
				xtype: 'form',
				items: [this.questionsContainer]
			}
		];
		
		ARSnova.view.speaker.AudienceQuestionPanel.superclass.constructor.call(this);
	},
	
	initialize: function() {
		this.on('activate', this.onActivate);
		this.on('deactivate', this.onDeactivate);
		this.on('orientationchange', this.onOrientationChange);
		
		ARSnova.view.speaker.AudienceQuestionPanel.superclass.initialize.call(this);
	},
	
	onActivate: function() {
		taskManager.start(this.updateAnswerCount);
		this.controls.removeAll();
		this.questionStore.removeAll();
		
		this.controls.add(this.newQuestionButton);
		
		this.questionEntries = [];

		ARSnova.questionModel.getSkillQuestionsSortBySubjectAndText(localStorage.getItem('keyword'), {
			success: Ext.bind(function(response) {
				var questions = Ext.decode(response.responseText);
				this.questionStore.add(questions);
				this.getQuestionAnswers();
				
				this.controls.insert(0, this.showcaseFormButton);
				this.displayShowcaseButton();
				this.questionsContainer.show();
				this.doLayout();
			}, this),
			empty: Ext.bind(function() {
				this.showcaseButton.hide();
				this.questionsContainer.hide();
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
	
	getQuestionAnswers: function() {
		var getAnswerCount = function(questionRecord) {
			ARSnova.questionModel.countAnswersByQuestion(localStorage.getItem("keyword"), questionRecord.get('_id'), {
				success: function(response) {
					questionRecord.set('numAnswers', Ext.decode(response.responseText));
				},
				failure: function() {
					console.log("Could not update answer count");
				}
			});
		};
		
		this.questionStore.each(function(questionRecord) {
			getAnswerCount(questionRecord);
		}, this);
	}
});
