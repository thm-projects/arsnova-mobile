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
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getFeedbackQuestions();
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
	questionsCounter: 0,

	initialize: function () {
		this.callParent(arguments);

		var panel = this;
		var isSpeakerView = !!ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			align: 'left',
			ui: 'back',
			scope: this,
			handler: function () {
				var target;
				if (isSpeakerView) {
					target = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					ARSnova.app.taskManager.stop(this.getUpdateClockTask());
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

		if (screenWidth > 380) {
			toolbarTitle = isSpeakerView ? Messages.QUESTIONS_FROM_STUDENTS : Messages.MY_QUESTIONS;
		}

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

		this.list = Ext.create('Ext.List', {
			activeCls: 'search-item-active',
			scrollable: {disabled: true},
			variableHeights: true,
			layout: 'fit',
			height: '100%',

			style: {
				marginBottom: '20px',
				backgroundColor: 'transparent'
			},

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
					ARSnova.app.getController('Questions').detailsFeedbackQuestion({
						question: record
					});
				},
				/**
				 * The following events are used to get the computed height of
				 * all list items and finally to set this value to the list
				 * DataView. In order to ensure correct rendering it is also
				 * necessary to get the properties "padding-top" and
				 * "padding-bottom" and add them to the height of the list
				 * DataView.
				 */
				painted: function (list, eOpts) {
					var me = this;
					this.list.fireEvent("resizeList", list);

					if (window.MathJax) {
						MathJax.Hub.Queue(
							["Delay", MathJax.Callback, 700],
							function () {
								me.list.fireEvent('resizeList', me.list.element);
							}
						);
					}
				},
				resizeList: function (list) {
					var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];

					this.list.setHeight(
						parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
						parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top")) +
						parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom"))
					);
				}
			}
		});

		this.zoomButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: true,
			cls: 'zoomButton',
			docked: 'bottom',
			iconCls: 'icon-text-height',
			handler: this.zoomButtonHandler,
			scope: this
		});

		this.zoomSlider = Ext.create('ARSnova.view.CustomSliderField', {
			label: 'Zoom',
			labelWidth: '15%',
			value: 100,
			minValue: 75,
			maxValue: 150,
			increment: 5,
			suffix: '%',
			setZoomLevel: function (sliderField, slider, newValue) {
				newValue = Array.isArray(newValue) ? newValue[0] : newValue;
				if (!sliderField.actualValue || sliderField.actualValue !== newValue) {
					panel.setZoomLevel(newValue);
					sliderField.actualValue = newValue;
				}
			}
		});

		this.zoomSlider.setListeners({
			drag: this.zoomSlider.config.setZoomLevel,
			change: this.zoomSlider.config.setZoomLevel
		});

		this.actionSheet = Ext.create('Ext.Sheet', {
			left: 0,
			right: 0,
			bottom: 0,
			hidden: true,
			modal: false,
			centered: false,
			height: 'auto',
			cls: 'zoomActionSheet',
			items: [this.zoomSlider]
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
			this.zoomButton,
			this.actionSheet,
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
		});

		this.on('painted', function () {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.zoomButton.show();
				this.initializeZoomComponents();
				ARSnova.app.taskManager.start(this.getUpdateClockTask());
			}
		});
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.getActiveItem().setPadding('0 0 20 0');
		this.setZoomLevel(ARSnova.app.globalZoomLevel);
		this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
		this.zoomButton.isActive = false;
	},

	zoomButtonHandler: function () {
		if (this.zoomButton.isActive) {
			this.initializeZoomComponents();
		} else {
			this.zoomButton.setIconCls('icon-close');
			this.zoomButton.addCls('zoomSheetActive');
			this.getActiveItem().setPadding('0 0 50 0');
			this.zoomButton.isActive = true;
			this.actionSheet.show();
		}
	},

	setZoomLevel: function (size) {
		this.formPanel.setStyle('font-size: ' + size + '%;');
		this.list.fireEvent('resizeList', this.list.element);
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
	},

	updateTime: function () {
		var actualTime = new Date().toTimeString().substring(0, 8);
		this.clockElement.setHtml(actualTime);
		this.clockElement.setHidden(false);
	},

	getFeedbackQuestions: function () {
		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.app.questionModel.getInterposedQuestions(sessionStorage.getItem('keyword'), {
			success: function (response) {
				var questions = Ext.decode(response.responseText);
				var fQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = fQP.questionsPanel;
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questions.length);
				panel.questionsCounter = questions.length;

				if (panel.questionsCounter === 0) {
					panel.list.hide();
					panel.noQuestionsFound.show();
					panel.deleteAllButton.hide();
				} else {
					panel.getStore().remove(panel.getStore().getRange());
					panel.list.show();
					panel.noQuestionsFound.hide();
					panel.deleteAllButton.show();
					var unread = 0;
					for (var i = 0, question; i < questions.length; i++) {
						question = questions[i];
						if (!question.read) {
							unread++;
						}
						panel.getStore().add(Ext.create('ARSnova.model.FeedbackQuestion', question));
					}
					panel.list.fireEvent('resizeList', panel.list.element);
					fQP.tab.setBadgeText(unread);
					if (ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton.setBadge([{
							badgeText: questions.length, badgeCls: "feedbackQuestionsBadgeIcon"
						}]);
					}
				}
				hideLoadMask();
			},
			failure: function (records, operation) {
				console.log('server side error');
			}
		});
	}
});
