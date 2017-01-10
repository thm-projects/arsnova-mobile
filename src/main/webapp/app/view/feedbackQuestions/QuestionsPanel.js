/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
			cls: 'roundedCorners',

			style: {
				marginBottom: '20px',
				backgroundColor: 'transparent'
			},

			loadHandler: this.getFeedbackQuestions,
			loadScope: this,

			itemCls: 'forwardListButton',
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="search-item noOverflow">',
					'<span style="color:gray;">{[this.getFormattedTime(values.timestamp)]}</span>',
					'<tpl if="read === true">',
						'<span style="padding-left:30px;">{subject:htmlEncode}</span>',
					'</tpl>',
					'<tpl if="read === false"">',
						'<span class="dangerLabel" style="padding-left:30px;font-weight:normal;">{subject:htmlEncode}</span>',
					'</tpl>',
				'</div>',
				{
					getFormattedTime: function (timestamp) {
						var time = new Date(timestamp);
						return moment(time).format('LT');
					}
				}
			),
			grouped: true,
			store: this.getStore(),
			listeners: {
				scope: this,
				itemswipe: function (list, index, target) {
					var el = target.element,
						hasClass = el.hasCls(this.activeCls);

					if (hasClass) {
						el.removeCls(this.activeCls);
					} else {
						el.addCls(this.activeCls);
					}
				},
				itemtap: function (list, index, target, record, event) {
					ARSnova.app.getController('Questions').detailsFeedbackQuestion({
						question: record,
						lastPanel: panel
					});
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
	}
});
