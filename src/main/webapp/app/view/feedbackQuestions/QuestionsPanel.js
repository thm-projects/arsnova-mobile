/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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

	requires: ['ARSnova.model.FeedbackQuestion'],

	config: {
		title: 'QuestionsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
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
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFeedbackQuestionsTask: {
			name: 'check for new feedback questions',
			run: function () {
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var questionsPanel = tabPanel.feedbackQuestionsPanel.questionsPanel;
				questionsPanel.getStore().remove(questionsPanel.getStore().getRange());

				if (tabPanel.speakerTabPanel && tabPanel.speakerTabPanel.inClassPanel) {
					tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
				}

				if (questionsPanel.list.getOffset() !== -1) {
					questionsPanel.list.restoreOffsetState();
				}

				questionsPanel.getFeedbackQuestions();
			},
			interval: 15000
		},

		/**
		 * task for speakers in a session
		 * update clock element
		 */
		updateClockTask: {
			name: 'renew the actual time at the titlebar',
			run: function () {
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.updateTime();
			},
			interval: 1000 // 1 second
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
				var target;
				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER &&
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
					target = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					ARSnova.app.taskManager.stop(this.getUpdateClockTask());
					panel.speakerUtilities.initializeZoomComponents();

					if (ARSnova.app.projectorModeActive) {
						panel.speakerUtilities.restoreZoomLevel();
						this.speakerUtilities.setProjectorMode(panel, false);
					}
				} else {
					target = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
				}
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(target, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.deleteAllButton = Ext.create('Ext.Button', {
			text: Messages.DELETE_ALL,
			align: 'right',
			ui: 'decline',
			hidden: true,
			handler: function () {
				Ext.Msg.confirm(Messages.DELETE_QUESTIONS_TITLE, Messages.ARE_YOU_SURE, function (answer) {
					if (answer === 'yes') {
						ARSnova.app.getController('Questions').deleteAllInterposedQuestions({
							success: function () {
								panel.list.hide();
								panel.noQuestionsFound.show();
								panel.deleteAllButton.hide();
							},
							failure: function () {
								console.log("Could not delete all interposed questions.");
							}
						});
					}
				});
			}
		});

		var toolbarTitle = Messages.QUESTIONS;

		this.clockElement = Ext.create('Ext.Component', {
			cls: 'x-toolbar-title x-title',
			hidden: true,
			align: 'left'
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			title: toolbarTitle,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				this.clockElement,
				this.deleteAllButton
			]
		});

		this.noQuestionsFound = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_QUESTIONS
		});

		this.list = Ext.create('ARSnova.view.components.List', {
			activeCls: 'search-item-active',

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
						'<span class="thm-red" style="padding-left:30px;font-weight:normal;">{subject:htmlEncode}</span>',
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
					panel.speakerUtilities.initializeZoomComponents();
					ARSnova.app.getController('Questions').detailsFeedbackQuestion({
						question: record
					});
				}
			}
		});

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			showProjectorButton: true,
			hidden: true
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			cls: 'roundedCorners',
			height: '100%',
			width: '100%',
			scrollable: null,
			flex: 1,
			style: {
				marginTop: this.deleteAllButton.getHidden() ? '15px' : ''
			},
			items: [this.list]
		});

		this.add([
			this.toolbar,
			this.speakerUtilities,
			{
				xtype: 'button',
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
			}, this.noQuestionsFound,
			this.formPanel
		]);

		this.on('deactivate', function (panel) {
			this.list.deselect(this.list._lastSelected, true);
		});

		this.on('activate', function () {
			this.getCheckFeedbackQuestionsTask().taskRunTime = 0;
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.initializeZoomComponents();
			}
		});

		this.on('painted', function () {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (screenWidth > 380) {
				toolbarTitle = ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER &&
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel ?
					Messages.QUESTIONS_FROM_STUDENTS :
					Messages.MY_QUESTIONS;
			}

			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.setProjectorMode(this, ARSnova.app.projectorModeActive);
				ARSnova.app.taskManager.start(this.getUpdateClockTask());
				this.speakerUtilities.show();
			}
		});
	},

	setZoomLevel: function (size) {
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
		this.formPanel.setStyle('font-size: ' + size + '%;');
		this.list.updateListHeight();
	},

	updateTime: function () {
		var actualTime = new Date().toTimeString().substring(0, 8);
		this.clockElement.setHtml(actualTime);
		this.clockElement.setHidden(false);
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
					panel.deleteAllButton.hide();
				} else {
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.deleteAllButton.show();
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
