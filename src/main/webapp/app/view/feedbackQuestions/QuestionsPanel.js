/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedbackQuestions/questionsPanel.js
 - Beschreibung: Panel zum Anzeigen aller Zwischenfragen einer Session (für Dozenten).
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
Ext.define('ARSnova.view.feedbackQuestions.QuestionsPanel', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.model.FeedbackQuestion'],

	config: {
		title: 'QuestionsPanel',
		fullscreen: true,
		layout: 'vbox',

		store: Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.FeedbackQuestion',
			sorters: [{
				property: "timestamp",
				direction: "DESC"
			}],
			groupField: 'groupDate',
			grouper: {
				property: "timestamp",
				direction: 'DESC'
			}
		}),

		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFeedbackQuestionsTask: {
			name: 'check for new feedback questions',
			run: function(){
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
			},
			interval: 15000
		}
	},

	toolbar: null,
	backButton: null,
	questionsCounter: 0,

	initialize: function(){
		this.callParent(arguments);

		var panel = this;
		var isSpeakerView = !!ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			hidden: true,
			handler: function() {
				var target;
				if (isSpeakerView) {
					target = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				} else {
					target = ARSnova.app.mainTabPanel.tabPanel.userTabPanel
				}
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(target, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					scope: this,
					listeners: {
						animationend: function() {
							this.hide();
						},
						scope: this
					}
				});
			}
		});

		this.deleteAllButton = Ext.create('Ext.Button', {
			text: Messages.DELETE_ALL,
			ui: 'decline',
			hidden: true,
			handler: function() {
				Ext.Msg.confirm(Messages.DELETE_ALL_QUESTIONS, Messages.ARE_YOU_SURE, function(answer) {
					if (answer === 'yes') {
						ARSnova.app.getController('Questions').deleteAllInterposedQuestions({
							success: function() {
								panel.list.hide();
								panel.noQuestionsFound.show();
								panel.deleteAllButton.hide();
							},
							failure: function() {
								console.log("Could not delete all interposed questions.");
							}
						});
					}
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Auditorium',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype: 'spacer'},
				this.deleteAllButton
			]
		});

		this.noQuestionsFound = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_QUESTIONS
		});

		this.list = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			layout: 'fit',
			flex: 1,

			style: {
				backgroundColor: 'transparent'
			},

			itemCls: 'forwardListButton',
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="search-item noOverflow">',
					'<span style="color:gray;">{formattedTime}</span>',
					'<tpl if="obj.get(\'read\')">',
						'<span style="padding-left:30px;{[ this.colorStyle(values.obj.get(\'read\')); ]}">{subject:htmlEncode}</span>',
					'</tpl>',
					'<tpl if="!obj.get(\'read\')">',
						'<span style="padding-left:30px;{[ this.colorStyle(values.obj.get(\'read\')); ]}">{subject:htmlEncode}</span>',
					'</tpl>',
				'</div>',
				{
					colorStyle: function(read) {
						if (panel.isSpeakerView) {
							return read ? "" : "font-weight:bold;color:red";
						} else {
							return read ? "color:green" : "";
						}
					}
				}
			),
			grouped: true,
			store: this.getStore(),
			listeners: {
				itemswipe: function(list, index, target) {
					var el = target.element,
						hasClass = el.hasCls(this.activeCls);

					if (hasClass) {
						el.removeCls(this.activeCls);
					} else {
						el.addCls(this.activeCls);
					}
				},
				itemtap: function(list, index, target, record, event){
					var details = list.getStore().getAt(index).data;
					if (isSpeakerView) {
						details.obj.set('read', true);
						list.refresh();
					}

					ARSnova.app.getController('Questions').detailsFeedbackQuestion({
						question: details.obj,
						formattedTime: details.formattedTime,
						fullDate: details.fullDate
					});
				}
			}
		}),

		this.add([
			this.toolbar,
			this.noQuestionsFound,
			this.list
		]);

		this.on('deactivate', function(){
			this.list.deselect(this.list._lastSelected, true);
		});
	},

	getFeedbackQuestions: function(){
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.app.questionModel.getInterposedQuestions(localStorage.getItem('keyword'),{
			success: function(response){
				var questions = Ext.decode(response.responseText);
				var fQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = fQP.questionsPanel;
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questions.length);
				panel.questionsCounter = questions.length;

				if(panel.questionsCounter == 0){
					panel.list.hide();
					panel.noQuestionsFound.show();
					panel.deleteAllButton.hide();
				} else {
					panel.getStore().remove(panel.getStore().getRange());
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.deleteAllButton.show();
					var unread = 0;
					for(var i = 0, question; question = questions[i]; i++){
						var formattedTime = "", fullDate = "", groupDate = "";
						if (question.timestamp) {
							var time = new Date(question.timestamp);
							formattedTime = moment(time).format('LT');
							groupDate = moment(time).format('L');
							fullDate = moment(time).format('LLL');
						} else {
							groupDate = Messages.NO_DATE;
						}
						question.formattedTime = formattedTime;
						question.fullDate = fullDate;
						if(!question.subject)
							question.subject = Messages.NO_SUBJECT;

						if (!question.read) {
							unread++;
						}

						panel.getStore().add({
							formattedTime: formattedTime,
							fullDate: fullDate,
							timestamp: question.timestamp,
							groupDate: groupDate,
							subject: question.subject,
							type: question.type,
							read: question.read,
							obj: Ext.create('ARSnova.model.FeedbackQuestion', question)
						});
					}

					fQP.tab.setBadgeText(unread);
					if (ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge([{
							badgeText: questions.length, badgeCls: "bluebadgeicon"
						}]);
					}

					panel.getStore().sort([{
						property: 'timestamp',
						direction: 'DESC'
					}]);
				}
				hideLoadMask();
			},
			failure: function(records, operation){
				console.log('server side error');
			}
		});
	},

	checkFeedbackQuestions: function(){
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function(response){
				var feedbackQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = feedbackQuestionsPanel.questionsPanel;
				var questionCount = Ext.decode(response.responseText);

				feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);
				if (ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
					ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge([{
						badgeText: questionCount.total, badgeCls: "bluebadgeicon"
					}]);
				}

				if(panel.questionsCounter != questionCount.total) {
					panel.questionsCounter = questionCount.total;
					panel.getFeedbackQuestions();
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	}
});
