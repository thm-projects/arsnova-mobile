/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.view.speaker.SessionExportToFilePanel', {
	extend: 'Ext.Panel',
	
	config: {
		exportSessionMap: null
	},
	
	initialize: function () {
		this.callParent(arguments);
		var me = this;
		
		this.backButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.exportButton = Ext.create('Ext.Button', {
			text: Messages.EXPORT_BUTTON_LABEL,
			ui: 'confirm',
			cls: 'saveQuestionButton',
			style: 'width: 89px',
			handler: function () {
				me.exportSessions();
//				this.saveHandler().then(function (response) {
//					ARSnova.app.getController('Questions').details({
//						question: Ext.decode(response.responseText)
//					});
//				});
			},
			scope: this
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.EXPORT_SESSION_TITLE,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype:'spacer'},
				this.exportButton
			]
		});
		
		this.exportAnswerToggle = Ext.create('Ext.field.Toggle', {
			label: Messages.ANSWERS,
			cls: 'rightAligned',
			value: true
		});
		
		this.exportStatisticToggle = Ext.create('Ext.field.Toggle', {
			label: Messages.STATISTICS,
			cls: 'rightAligned',
			value: true
		});
		
		this.exportStudentsQuestionToggle = Ext.create('Ext.field.Toggle', {
			label: Messages.QUESTIONS_FROM_STUDENTS,
			cls: 'rightAligned',
			value: true
		});
		
		this.exportOptions = Ext.create('Ext.form.FieldSet', {
			text: Messages.EXPORT_MSG,
			items: [
		        this.exportAnswerToggle,
		        this.exportStudentsQuestionToggle,
		        this.exportStatisticToggle
	        ]
		});
		
		this.mainPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,

			items: [
		        this.exportOptions
	        ]
		});
		
		this.add([
	          this.toolbar,
      		  this.mainPart
	  	]);
	},
	
	exportSessions: function() {
		var sessionMap = this.getExportSessionMap();
		
		// get export data for each session
		for (var i = 0; i < sessionMap.length; i++) {
			
			var questionData = new Array();
			
			// get preparation questions
			ARSnova.app.getController('PreparationQuestions').getQuestions(
					sessionMap[i][0].keyword, {
				success: Ext.bind(function (response) {
					var questions = Ext.decode(response.responseText);
					questionData.push.apply(questionData, questions);
					console.log(questionData);
//					this.questionStore.add(questions);
//					this.handleAnswerCount();
				}, this),
				empty: Ext.bind(function () {
					console.log('empty');
				}, this),
				failure: function (response) {
					console.log('server-side error questionModel.getSkillQuestions');
					console.log(reponse);
				}
			});
			
			// get other questions
			ARSnova.app.getController('Questions').getQuestions(
					sessionMap[i][0].keyword, {
				success: Ext.bind(function (response) {
					var questions = Ext.decode(response.responseText);
					questionData.push.apply(questionData, questions);
					console.log(questionData);
//					this.questionStore.add(questions);
//					this.handleAnswerCount();
				}, this),
				empty: Ext.bind(function () {
					console.log('empty');
				}, this),
				failure: function (response) {
					console.log('server-side error questionModel.getSkillQuestions');
					console.log(reponse);
				}
			});
			
			// TODO get other data
			// - answerStatistics --> siehe view/speaker/QuestionDetailsPanel.getQuestionAnswers();
			// - StudentQuestions
		}
	},
});