﻿/*
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

Ext.define('ARSnova.view.ImageAnswerPanel', {
	extend: 'Ext.Panel',

	config: {
		layout: 'vbox',
		fullscreen: true,

		/**
		 * task for speakers in a session
		 * check every x seconds new feedback questions
		 */
		checkFreetextAnswersTask: null,

		freetextAnswerStore: null
	},
	//flag for vertical or horizontal list
	isVertical: false,
	constructor: function (args) {
		var me = this;
		this.callParent(arguments);

		this.questionObj = args.question;
		this.lastPanel = args.lastPanel;
		var self = this;

		this.checkFreetextAnswersTask = {
			name: 'check for new freetext answers',
			scope: this,
			run: this.checkFreetextAnswers,
			interval: 15000
		};

		this.freetextAnswerStore = Ext.create('Ext.data.JsonStore', {
				model: 'FreetextAnswer',
				sorters: [{
						property: 'timestamp',
						direction: 'DESC'
					}
				],
				groupField: 'groupDate',
				grouper: {
					property: 'timestamp',
					direction: 'DESC'
				}
			});

		this.backButton = Ext.create('Ext.Button', {
				text: Messages.BACK,
				ui: 'back',
				scope: this,
				handler: function () {
					ARSnova.app.mainTabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel, {
						type: 'slide',
						direction: 'right',
						duration: 700,
						listeners: {
							animationend: function () {
								ARSnova.app.mainTabPanel._activeItem.on('deactivate', function () {
									self.destroy();
								}, self, {
									single: self
								});
							},
							scope: self
						}
					});
				}
			});

		this.toolbar = Ext.create('Ext.Toolbar', {
				title: Messages.STATISTIC,
				docked: 'top',
				ui: 'light',
				items: [this.backButton]
			});

		//sort buttons
		this.miniaturBtn = Ext.create('ARSnova.view.MatrixButton', {
				text: Messages.IMAGE_QUESTION_MINIATUR_VIEW,
				cls: 'actionButton',
				buttonConfig: 'icon',
				imageCls: 'icon-miniatur thm-grey',
				scope: this,
				handler: this.miniaturClicked
			});

		this.horizontalListBtn = Ext.create('ARSnova.view.MatrixButton', {
				text: Messages.IMAGE_QUESTION_HORIZONTAL_VIEW,
				cls: 'actionButton',
				buttonConfig: 'icon',
				imageCls: 'icon-vertical-list thm-grey',
				scope: this,
				handler: this.horizontalListClicked
			});

		this.verticalListBtn = Ext.create('ARSnova.view.MatrixButton', {
				text: Messages.IMAGE_QUESTION_VERTICAL_VIEW,
				cls: 'actionButton',
				buttonConfig: 'icon',
				imageCls: 'icon-horizontal-list thm-grey',
				imageStyle: 'margin-top:15px;' +
				'margin-left: 18px;',
				scope: this,
				handler: this.verticalListClicked
			});

		this.sortPanel = Ext.create('Ext.Panel', {
				scrollable: null,
				layout: {
					type: 'hbox',
					pack: 'center'
				},
				items: [
					this.miniaturBtn,
					this.horizontalListBtn,
					this.verticalListBtn
				]
			});

		this.noAnswersLabel = Ext.create('Ext.form.FormPanel', {
				scrollable: null,
				items: {
					cls: 'gravure',
					html: Messages.NO_ANSWERS
				}
			});

		this.imageAnswerList = Ext.create('Ext.DataView', {
				activeCls: 'search-item-active',
				store: this.freetextAnswerStore,
				height: '100%',
				flex: 1,

				cls: 'dataview-inline gallery-dataview',

				itemCls: 'thumbnail-image',
				itemTpl: new Ext.XTemplate(
					'<tpl if="this.isVertical() === false">',
					'<div class="wrapper">',
					'<img src="{answerThumbnailImage}"/>',
					'<span>{answerSubject:htmlEncode}</span>',
					'</div>',
					'</tpl>',
					'<tpl if="this.isVertical() === true">',
					'<div class="wrapper-list">',
					'<img src="{answerThumbnailImage}" class="image-list"/>',
					'<span class="answer-subject">{answerSubject:htmlEncode}</span>',
					'<span class="answer-text">{answerText:htmlEncode}</span>',
					'</div>',
					'</tpl>', {
					isVertical: function () {
						return me.isVertical;
					}
				}),
				inline: true,
				scrollable: 'vertical',
				deferEmptyText: false,
				emptyText: Messages.NO_ANSWERS,
				listeners: {
					itemtap: function (list, index, element) {
						var answer = list.getStore().getAt(index).data;
						ARSnova.app.getController('Questions').freetextDetailAnswer({
							answer: Ext.apply(answer, {
								deselectItem: function () {
									list.deselect(index);
								},
								removeItem: function () {
									list.getStore().remove(list.getStore().getAt(index));
								}
							}),
							panel: self
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

		this.add([this.toolbar, {
					xtype: 'formpanel',
					style: 'margin-top: 15px',
					cls: 'roundedCorners',
					height: '100%',
					width: '100%',
					flex: 1,
					scrollable: null,
					items: [this.sortPanel, this.noAnswersLabel, this.imageAnswerList]
				}
			]);

		this.on('activate', function () {
			ARSnova.app.innerScrollPanel = this.imageAnswerList;
			ARSnova.app.taskManager.start(this.checkFreetextAnswersTask);
		}, this);

		this.on('deactivate', function () {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.taskManager.stop(this.checkFreetextAnswersTask);
		}, this);

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this.imageAnswerList;
		});
	},

	checkFreetextAnswers: function () {
		var me = this;

		ARSnova.app.questionModel.getAnsweredFreetextQuestions(sessionStorage.getItem("keyword"), this.questionObj._id, {
			success: function (response) {
				var responseObj = Ext.decode(response.responseText);
				var answerLabel = me.noAnswersLabel.getInnerItems()[0];

				if (responseObj.length === 0) {
					answerLabel.setHtml(Messages.NO_ANSWERS);
					me.imageAnswerList.hide();
					me.noAnswersLabel.show();
				} else {
					me.imageAnswerList.show();
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

					me.freetextAnswerStore.removeAll();
					me.freetextAnswerStore.add(answers);
					me.freetextAnswerStore.sort([{
								property: 'timestamp',
								direction: 'DESC'
							}
						]);
					me.freetextAbstentions.setBadgeText(abstentions.length);
					me.freetextAbstentions.setHidden(abstentions.length === 0);

					var abCount = abstentions.length;
					var answersCount = answers.length;
					var abstentionText = abCount === 1 ? Messages.ABSTENTION : Messages.ABSTENTIONS;
					var answersText = answersCount === 1 ? Messages.ANSWER : Messages.ANSWERS;

					if (moment.lang() === "en") {
						var verb = abCount === 1 ? 'is ' : 'are ';
						abstentionText = verb + abCount + " " + abstentionText.toLowerCase();
						answersText = answersCount + " " + answersText.toLowerCase();
					} else {
						abstentionText = abCount + " " + abstentionText;
						answersText = answersCount + " " + answersText;
					}

					if (abstentions.length === responseObj.length) {
						answerLabel.setHtml(Messages.ONLY_ABSTENTION_ANSWERS.replace(/###/, abstentionText));
						me.imageAnswerList.hide();
					} else {
						var tempLabel = Messages.FREETEXT_DETAIL_LABEL.replace(/###/, abstentionText);
						answerLabel.setHtml(tempLabel.replace(/%%%/, answersText));
						me.imageAnswerList.show();
					}
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	//sorthandlers
	miniaturClicked: function () {
		this.imageAnswerList.setCls("dataview-inline gallery-dataview");
		this.imageAnswerList.setInline({
			wrap: true
		});
		this.imageAnswerList.setScrollable({
			direction: 'vertical'
		});

		this.isVertical = false;
		this.imageAnswerList.refresh();
	},
	horizontalListClicked: function () {
		this.imageAnswerList.setCls("dataview-horizontal gallery-dataview");
		this.imageAnswerList.setInline({
			wrap: false
		});
		this.imageAnswerList.setScrollable('horizontal');

		this.isVertical = false;
		this.imageAnswerList.refresh();
	},
	verticalListClicked: function () {
		this.imageAnswerList.setCls("dataview-basic gallery-dataview");
		this.imageAnswerList.setScrollable({
			direction: 'vertical'
		});

		this.isVertical = true;
		this.imageAnswerList.refresh();
	}
});
