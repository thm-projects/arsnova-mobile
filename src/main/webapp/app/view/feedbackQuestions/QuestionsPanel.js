/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define('ARSnova.view.feedbackQuestions.QuestionsPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.model.FeedbackQuestion'
	],

	config: {
		title: 'QuestionsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},

		store: Ext.create('Ext.data.JsonStore', {
			model: 'ARSnova.model.FeedbackQuestion',
			sorters: [{
				property: "timestamp",
				direction: "DESC"
			}],
			grouper: {
				groupFn: function (record) {
					var time = new Date(record.get('timestamp'));
					return moment(time).format('L');
				},
				sortProperty: "timestamp",
				direction: 'DESC'
			}
		}),

		/**
		 * check every x seconds new feedback questions
		 */
		checkFeedbackQuestionsTask: {
			name: 'check for new feedback questions',
			run: function () {
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var questionsPanel = tabPanel.feedbackQuestionsPanel.questionsPanel;
				questionsPanel.getStore().remove(questionsPanel.getStore().getRange());

				if (questionsPanel.list.getOffset() !== -1) {
					questionsPanel.list.restoreOffsetState();
				}

				questionsPanel.getFeedbackQuestions();
			},
			interval: 15000
		}
	},

	toolbar: null,
	backButton: null,

	initialize: function () {
		this.callParent(arguments);
		var panel = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			align: 'left',
			ui: 'back',
			scope: this,
			handler: function () {
				var target = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(target, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			title: Messages.MY_QUESTIONS,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton
			]
		});

		this.noQuestionsFound = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_QUESTIONS
		});

		this.list = Ext.create('ARSnova.view.components.List', {
			activeCls: 'search-item-active',
			cls: 'feedbackMessageDataview',
			inline: true,
			loadHandler: this.getFeedbackQuestions,
			loadScope: this,

			itemCls: 'feedbackMessage',
			itemTpl: Ext.create('Ext.XTemplate',
				'<tpl if="read === true">',
					'<div class="messageTitle">',
				'<tpl else>',
					'<div class="messageTitle unread">',
				'</tpl>',
					'<span class="messageTimestamp">{[this.getFormattedTime(values.timestamp)]}</span>',
					'<span class="messageSubject">{subject:htmlEncode}</span>',
					'<span class="messageDeleteIcon"></span>',
				'</div>',
				'<div class="messageText">',
					'<tpl if="this.hasMessageText(text)">',
						'{text}',
					'<tpl else>',
						'<div class="noText">{[Messages.NO_TEXT_SUBMITTED]}</div>',
					'</tpl>',
				'</div>',
				{
					getFormattedTime: function (timestamp) {
						var time = new Date(timestamp);
						return moment(time).format('LT');
					},
					hasMessageText: function (text) {
						return text.replace(/\s/g, '').length;
					},
					showDisclosure: function (text, elements) {
						if (text.length >= panel.listDisclosureLength) {
							return true;
						}

						for (var element in elements) {
							if (elements[element]) {
								return true;
							}
						}

						return false;
					}
				}
			),
			grouped: true,
			store: this.getStore(),
			listeners: {
				disclose: function (list, record, target, index) {
					if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
						panel.speakerUtilities.initializeZoomComponents();
						ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(false);
					}

					ARSnova.app.getController('Questions').detailsFeedbackQuestion({
						question: record,
						lastPanel: panel
					});
				},
				itemtap: function (list, index, target, record, event) {
					var node = event.target;
					var data = record.data;
					var disclosed = list.config.itemTpl.showDisclosure(data.text, data.mediaElements);

					if (node.className === 'messageDeleteIcon') {
						panel.deleteEntry(record);
					} else if (!data.read && !disclosed) {
						record.read();
					}
				}
			}
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			style: {
				marginTop: '15px'
			},
			items: [{
				xtype: 'fieldset',
				items: [this.list]
			}]
		});

		this.questionRequestButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_REQUEST,
			style: {
				margin: '15px auto'
			},
			ui: 'action',
			width: '235px',
			hidden: ARSnova.app.isSessionOwner,
			handler: function () {
				ARSnova.app.getController('Feedback').showAskPanel({
					type: 'slide'
				}, function closePanelHandler() {
					var userTabPanel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;

					ARSnova.app.getController('Questions').listFeedbackQuestions({
						type: 'slide',
						direction: 'right',
						duration: 700,
						listeners: {
							animationend: function () {
								userTabPanel.setActiveItem(userTabPanel.inClassPanel);
							}
						}
					});
				});
			}
		});

		this.add([
			this.toolbar,
			this.questionRequestButton,
			this.noQuestionsFound,
			this.formPanel
		]);

		this.on('deactivate', function (panel) {
			this.list.deselect(this.list._lastSelected, true);
		});

		this.on('activate', function () {
			this.getCheckFeedbackQuestionsTask().taskRunTime = 0;
		});
	},

	setZoomLevel: function (size) {
		this.list.updateListHeight();
	},

	prepareQuestionList: function () {
		this.list.resetPagination();
	},

	getFeedbackQuestions: function () {
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.app.questionModel.getInterposedQuestions(sessionStorage.getItem('keyword'), {
			success: function (response, totalRange) {
				var questions = Ext.decode(response.responseText);
				var fQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = fQP.questionsPanel;

				if (questions.length === 0) {
					panel.list.hide();
					panel.noQuestionsFound.show();
				} else {
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.list.updatePagination(questions.length, totalRange);

					if (panel.list.getOffset() !== -1) {
						questions.pop();
					}

					for (var i = 0, question; i < questions.length; i++) {
						question = questions[i];
						panel.getStore().add(Ext.create('ARSnova.model.FeedbackQuestion', question));
					}
				}
				hideLoadMask();
			},
			failure: function (records, operation) {
				console.log('server side error');
			}
		}, this.list.getStartIndex(), this.list.getEndIndex() + 1);
	},

	deleteEntry: function (record) {
		var panel = this;
		ARSnova.app.questionModel.deleteInterposed(record, {
			success: function () {
				panel.lastTimestamp = 0;
				panel.getCheckFeedbackQuestionsTask().taskRunTime = 0;
			},
			failure: function (response) {
				console.log('server-side error delete question');
			}
		});
	}
});
