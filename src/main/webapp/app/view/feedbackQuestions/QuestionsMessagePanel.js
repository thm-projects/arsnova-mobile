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
Ext.define('ARSnova.view.feedbackQuestions.QuestionsMessagePanel', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.model.FeedbackQuestion'],

	config: {
		title: 'QuestionsPanel',
		fullscreen: true,
		lastPanel: null,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},
		tab: {
			hidden: true
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
				var questionsPanel = tabPanel.feedbackQuestionsPanel.questionsPanel.messagePanel;
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
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.messagePanel.updateTime();
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
				var me = this;
				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER &&
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel) {
					var target = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					ARSnova.app.taskManager.stop(this.getUpdateClockTask());
					ARSnova.app.taskManager.stop(this.getCheckFeedbackQuestionsTask());
					panel.speakerUtilities.initializeZoomComponents();

					if (ARSnova.app.projectorModeActive) {
						panel.speakerUtilities.restoreZoomLevel();
						this.speakerUtilities.setProjectorMode(panel, false);
					}

					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(target, {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				}
			}
		});

		this.clockElement = Ext.create('Ext.Component', {
			cls: 'x-toolbar-title x-title',
			hidden: true,
			align: 'left'
		});

		this.toggleViewButton = Ext.create('Ext.Button', {
			text: Messages.INTERPOSED_QUESTIONS,
			align: 'right',
			scope: this,
			handler: function () {
				var target = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel;
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.animateActiveItem(target, 'flip');
			}
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			title: Messages.QUESTIONS,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				this.clockElement,
				this.toggleViewButton
			]
		});

		this.noQuestionsFound = Ext.create('Ext.Panel', {
			cls: 'centerText',
			html: Messages.NO_QUESTIONS
		});

		this.list = Ext.create('ARSnova.view.components.List', {
			cls: 'feedbackMessageDataview',
			loadHandler: this.getFeedbackQuestions,
			loadScope: this,
			inline: true,

			itemCls: 'feedbackMessage',
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="messageTitle">',
					'<span class="messageTimestamp">{[this.getFormattedTime(values.timestamp)]}</span>',
					'<span class="messageSubject">{subject:htmlEncode}</span>',
				'</div>',
				'<div class="messageText">',
					'<tpl if="this.hasMessageText(values.mdtext)">',
						'<div>{mdtext}</div>',
					'<tpl else>',
						'<div class="noText">{[Messages.NO_TEXT_SUBMITTED]}</div>',
					'</tpl>',
				'</div>',
				'<div class="mediaBar activateTooltip">',
					'<tpl if="values.mediaElements.code">',
						'<div class="buttonTooltip" data-tooltip="{[Messages.EDITOR_CODE_TOOLTIP]}">',
							'<span class="codeListingIcon"></span>',
						'</div>',
					'</tpl>',
					'<tpl if="values.mediaElements.image">',
						'<div class="buttonTooltip" data-tooltip="{[Messages.EDITOR_PICTURE_TOOLTIP]}">',
							'<span class="imageIcon"></span>',
						'</div>',
					'</tpl>',
					'<tpl if="values.mediaElements.vimeo">',
						'<div class="buttonTooltip" data-tooltip="{[Messages.EDITOR_VIMEO_TOOLTIP]}">',
							'<span class="vimeoIcon"></span>',
						'</div>',
					'</tpl>',
					'<tpl if="values.mediaElements.youtube">',
						'<div class="buttonTooltip" data-tooltip="{[Messages.EDITOR_YOUTUBE_TOOLTIP]}">',
							'<span class="youtubeIcon"></span>',
						'</div>',
					'</tpl>',
					'<tpl if="values.mediaElements.hyperlink">',
						'<div class="buttonTooltip" data-tooltip="{[Messages.EDITOR_HYPERLINK_TOOLTIP]}">',
							'<span class="hyperlinkIcon"></span>',
						'</div>',
					'</tpl>',
				'</div>',
				'<tpl if="this.showDisclosure(values.mdtext, values.mediaElements)">',
					'<div class="x-list-disclosure"></div>',
				'</tpl>',
				{
					getFormattedTime: function (timestamp) {
						var time = new Date(timestamp);
						return moment(time).format('LT');
					},
					hasMessageText: function (text) {
						return text.replace(/\s/g, '').length;
					},
					showDisclosure: function (text, elements) {
						if (text.length > 140) {
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
				}
			}
		});

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			showProjectorButton: true,
			hidden: true
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.list]
			}]
		});

		this.add([
			this.toolbar,
			this.speakerUtilities,
			this.noQuestionsFound,
			this.formPanel
		]);

		this.on('resize', function () {
			this.updateList(false);
		});

		this.on('activate', function () {
			this.getCheckFeedbackQuestionsTask().taskRunTime = 0;
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (screenWidth > 700) {
				this.speakerUtilities.initializeZoomComponents();
			}
		});

		this.on('painted', function () {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			ARSnova.app.taskManager.start(this.getCheckFeedbackQuestionsTask());

			if (screenWidth > 700) {
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

	updateList: function (forceUpdate) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var questions = this.questions || [];

		if (!forceUpdate) {
			if (!this.list.element.hasCls('twoRowed') && screenWidth < 540 ||
				this.list.element.hasCls('twoRowed') && screenWidth >= 540) {
				return;
			}
		}

		this.getStore().removeAll();
		for (var i = 0; i < questions.length; i++) {
			this.storeEntry(questions[i]);
		}

		if (screenWidth < 540) {
			this.list.removeCls('twoRowed');
		} else {
			this.list.addCls('twoRowed');
		}

		this.list.updateListHeight();
	},

	storeEntry: function (question) {
		var panel = this;
		var text = question.text;

		var md = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			removeMediaElements: true
		});

		md.setContent(text, true, true, function (html) {
			text = !html.getHtml().length ? '&nbsp;' : html.getHtml();
			text = text.replace(/<\/?[^>]+>/gi, "");
			text = text.length > 140 ? text.slice(0, 140).concat('...') : text;
			question.mediaElements = md.mediaElements;
			question.mdtext = text;
			panel.getStore().add(Ext.create('ARSnova.model.FeedbackQuestion', question));
			md.destroy();
		});
	},

	getFeedbackQuestions: function () {
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOADING_NEW_QUESTIONS);
		ARSnova.app.questionModel.getInterposedQuestions(sessionStorage.getItem('keyword'), {
			success: function (response) {
				var questions = Ext.decode(response.responseText);
				var fQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var panel = fQP.questionsPanel.messagePanel;

				if (questions.length === 0) {
					panel.list.hide();
					panel.noQuestionsFound.show();
				} else {
					panel.noQuestionsFound.hide();
					panel.questions = questions;
					panel.updateList(true);
				}
				hideLoadMask();
			},
			failure: function (records, operation) {
				console.log('server side error');
			}
		}, -1, -1);
	}
});
