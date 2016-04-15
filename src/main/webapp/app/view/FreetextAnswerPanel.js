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

Ext.define('ARSnova.view.FreetextAnswerPanel', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.ANSWERS,
		iconCls: 'icon-chart',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},

		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFreetextAnswersTask: null,

		freetextAnswerStore: null
	},

	constructor: function (args) {
		this.callParent(arguments);

		this.questionObj = args.question;
		var self = this;

		this.checkFreetextAnswersTask = {
			name: 'check for new freetext answers',
			scope: this,
			run: function () {
				var mainTabPanel = ARSnova.app.mainTabPanel;
				var tP = mainTabPanel.tabPanel;
				var panel = tP.userQuestionsPanel || tP.speakerTabPanel;
				var chart = panel.questionStatisticChart;

				if (chart.freetextAnswerList.getOffset() !== -1) {
					chart.freetextAnswerList.restoreOffsetState();
				}

				chart.checkFreetextAnswers();
				if (mainTabPanel.getActiveItem() === panel.statisticTabPanel) {
					panel.statisticTabPanel.roundManagementPanel.updateEditButtons();
				}
			},
			interval: 15000
		};

		this.freetextAnswerStore = Ext.create('Ext.data.JsonStore', {
			model: 'FreetextAnswer',
			sorters: [{property: 'timestamp', direction: 'DESC'}],
			groupField: 'groupDate',
			grouper: {property: 'timestamp', direction: 'DESC'}
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			align: 'left',
			handler: function () {
				var object, me = this;
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var speakerTabPanel = tabPanel.speakerTabPanel;

				ARSnova.app.innerScrollPanel = false;
				ARSnova.app.taskManager.stop(me.checkFreetextAnswersTask);
				me.speakerUtilities.initializeZoomComponents();

				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					object = speakerTabPanel.statisticTabPanel.roundManagementPanel.editButtons.questionObj;

					switch (speakerTabPanel.getActiveItem()) {
						case speakerTabPanel.showcaseQuestionPanel:
							var activeItem = speakerTabPanel.showcaseQuestionPanel.getActiveItem();
							activeItem.questionObj = object;
							break;

						case speakerTabPanel.questionDetailsPanel:
							speakerTabPanel.questionDetailsPanel.questionObj = object;
							break;

						default:
					}
				}

				ARSnova.app.mainTabPanel.animateActiveItem(tabPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700,
					listeners: {
						animationend: function () {
							me.destroy();
						}
					}
				});
			}
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			docked: 'top',
			ui: 'light',
			title: Ext.util.Format.htmlEncode(this.questionObj.subject),
			items: [this.backButton]
		});

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			hidden: this.questionObj.questionType === 'slide',
			cls: "roundedBox center"
		});

		questionPanel.setContent(this.questionObj.text, true, true);

		this.noAnswersLabel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: {
				cls: 'gravure',
				html: this.questionObj.questionType === 'slide' ?
					Messages.NO_COMMENTS : Messages.NO_ANSWERS
			}
		});

		this.freetextAnswerList = Ext.create('ARSnova.view.components.List', {
			activeCls: 'search-item-active',
			store: this.freetextAnswerStore,

			style: {
				marginBottom: '20px',
				backgroundColor: 'transparent'
			},

			loadHandler: this.checkFreetextAnswers,
			loadScope: this,

			itemCls: 'forwardListButton',
			// Display unread answers for teachers only
			itemTpl: Ext.create('Ext.XTemplate',
				'<div class="search-item noOverflow">',
				'<span style="color:gray">{formattedTime}</span>',
				'<tpl if="read === true || this.isStudent()">',
					'<span style="padding-left:30px">{answerSubject:htmlEncode}</span>',
				'</tpl>',
				'<tpl if="read === false && !this.isStudent()">',
					'<span class="dangerLabel" style="padding-left:30px">{answerSubject:htmlEncode}</span>',
				'</tpl>',
				'</div>',
				{
					isStudent: function () {
						return ARSnova.app.isSessionOwner !== true;
					}
				}
			),
			grouped: true,
			deferEmptyText: false,
			emptyText: this.questionObj.questionType === 'slide' ?
				Messages.NO_COMMENTS : Messages.NO_ANSWERS,

			listeners: {
				scope: this,
				itemtap: function (list, index, element) {
					var answer = list.getStore().getAt(index).data;
					ARSnova.app.getController('Questions').freetextDetailAnswer({
						answer: Ext.apply(answer, {
							deselectItem: function () {list.deselect(index);},
							removeItem: function () {list.getStore().remove(list.getStore().getAt(index));}
						}), panel: self
					});
				}
			}
		});

		this.freetextAbstentions = Ext.create('Ext.Button', {
			hidden: true,
			ui: 'normal',
			text: Messages.ABSTENTION,
			disabled: true,
			cls: 'answerListButton',
			badgeText: '0',
			badgeCls: 'badgeicon'
		});

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			style: 'margin-top: 40px',
			docked: 'top',
			viewOnly: true,
			viewOnlyOpacity: 1,
			hidden: true
		});

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			showProjectorButton: true,
			hidden: true
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			style: 'margin-top: 15px',
			cls: 'roundedCorners',
			scrollable: null,
			items: [
				questionPanel,
				this.noAnswersLabel,
				{
					xtype: 'fieldset',
					items: [this.freetextAnswerList]
				}
			]
		});

		this.add([this.toolbar,
			this.speakerUtilities,
			this.countdownTimer,
			this.formPanel
		]);

		this.setTitle(this.questionObj.questionType === 'slide' ? Messages.COMMENTS : Messages.ANSWERS);
		this.setIconCls(this.questionObj.questionType === 'slide' ? 'icon-comment' : 'icon-chart');

		this.on('activate', function () {
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
			if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.show();
				this.speakerUtilities.initializeZoomComponents();
			}

			this.checkPiRoundActivation();
			ARSnova.app.taskManager.start(this.checkFreetextAnswersTask);
		}, this);

		this.on('deactivate', function () {
			ARSnova.app.taskManager.stop(this.checkFreetextAnswersTask);
		}, this);

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.speakerUtilities.setProjectorMode(this, ARSnova.app.projectorModeActive);
			}
		});

		this.on('hide', function () {
			this.countdownTimer.stop();
		});
	},

	checkPiRoundActivation: function () {
		if (this.questionObj.piRoundActive) {
			this.countdownTimer.start(this.questionObj.piRoundStartTime, this.questionObj.piRoundEndTime);
			this.countdownTimer.show();
		} else {
			this.countdownTimer.stop();
		}
	},

	setZoomLevel: function (size) {
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
		this.formPanel.setStyle('font-size: ' + size + '%;');
		this.freetextAnswerList.updateListHeight();
	},

	updatePagination: function (answers) {
		var offset = this.freetextAnswerList.getOffset();
		var pagOffset = offset === -1 || offset > answers.length ? answers.length : offset;
		var pagAnswers = answers.slice(0, pagOffset);

		this.freetextAnswerStore.removeAll();
		this.freetextAnswerStore.add(pagAnswers);
		this.freetextAnswerStore.sort([{
			property: 'timestamp',
			direction: 'DESC'
		}]);

		this.freetextAnswerList.updatePagination(pagAnswers.length, answers.length);
	},

	checkFreetextAnswers: function () {
		var me = this;

		ARSnova.app.questionModel.getAnsweredFreetextQuestions(sessionStorage.getItem("keyword"), this.questionObj._id, {
			success: function (response, totalRange) {
				var responseObj = Ext.decode(response.responseText);
				var answerLabel = me.noAnswersLabel.getInnerItems()[0];

				if (responseObj.length === 0) {
					answerLabel.setHtml(me.questionObj.questionType === 'slide' ?
						Messages.NO_COMMENTS : Messages.NO_ANSWERS);
					me.freetextAnswerList.hide();
					me.noAnswersLabel.show();
				} else {
					me.freetextAnswerList.show();
					var listItems = responseObj.map(function (item) {
						var v = item;
						var date = new Date(v.timestamp);
						return Ext.apply(item, {
							formattedTime: Ext.Date.format(date, "H:i"),
							groupDate: Ext.Date.format(date, "d.m.y")
						});
					});

					var abstentions = listItems.filter(function (item) {
						return item.abstention;
					});
					var answers = listItems.filter(function (item) {
						return !item.abstention;
					});

					me.updatePagination(answers);
					me.freetextAbstentions.setBadgeText(abstentions.length);
					me.freetextAbstentions.setHidden(abstentions.length === 0);

					var abCount = abstentions.length;
					var answersCount = answers.length;
					var answersText, abstentionText, verb;

					if (me.questionObj.questionType === 'slide') {
						answersText = answersCount === 1 ? Messages.COMMENT : Messages.COMMENTS;

						if (moment.locale() === "en") {
							verb = answersCount === 1 ? 'is ' : 'are ';
							answersText = verb + answersCount + " " + answersText.toLowerCase();
						} else {
							answersText = answersCount + " " + answersText;
						}

						answerLabel.setHtml(Messages.SLIDE_DETAIL_LABEL.replace(/###/, answersText));
						me.freetextAnswerList.show();
					} else {
						abstentionText = abCount === 1 ? Messages.ABSTENTION : Messages.ABSTENTIONS;
						answersText = answersCount === 1 ? Messages.ANSWER : Messages.ANSWERS;

						if (moment.locale() === "en") {
							verb = abCount === 1 ? 'is ' : 'are ';
							abstentionText = verb + abCount + " " + abstentionText.toLowerCase();
							answersText = answersCount + " " + answersText.toLowerCase();
						} else {
							abstentionText = abCount + " " + abstentionText;
							answersText = answersCount + " " + answersText;
						}

						if (abstentions.length === responseObj.length) {
							answerLabel.setHtml(Messages.ONLY_ABSTENTION_ANSWERS.replace(/###/, abstentionText));
							me.freetextAnswerList.hide();
						} else {
							var tempLabel = Messages.FREETEXT_DETAIL_LABEL.replace(/###/, abstentionText);
							answerLabel.setHtml(tempLabel.replace(/%%%/, answersText));
							me.freetextAnswerList.show();
						}
					}
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		}, -1, -1);
	}
});
