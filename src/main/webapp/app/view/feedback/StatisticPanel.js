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
Ext.define('ARSnova.view.feedback.StatisticPanel', {
	extend: 'Ext.Panel',

	requires: [
		'Ext.chart.series.Bar',
		'Ext.chart.axis.Numeric',
		'Ext.chart.axis.Category'
	],

	config: {
		title: 'StatisticPanel',
		fullscreen: true,
		layout: 'fit'
	},

	feedbackValues: {
		GOOD: 0,
		OK: 1,
		BAD: 2,
		GONE: 3
	},

	answerValues: {
		A: 1,
		B: 0,
		C: 2,
		D: 3
	},

	initialize: function () {
		this.callParent(arguments);
		this.controller = ARSnova.app.getController('Feedback');

		var me = this;
		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			align: 'left',
			handler: function () {
				var	tabPanel = ARSnova.app.mainTabPanel.tabPanel,
					feedbackTabPanel = tabPanel.feedbackTabPanel;

				var animation = {
					type: 'slide',
					direction: 'right',
					duration: 700
				};

				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					tabPanel.animateActiveItem(tabPanel.speakerTabPanel, animation);
				} else if (localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER) {
					tabPanel.animateActiveItem(tabPanel.userTabPanel, animation);
				} else {
					animation.direction = 'down';
					feedbackTabPanel.animateActiveItem(feedbackTabPanel.votePanel, animation);
				}
			}
		});

		this.isFeedbackReleased = true;
		this.releaseFeedbackButton = Ext.create('Ext.Button', {
			align: 'right',
			text: Messages.CLOSE_LIVE_VOTING,
			altText: Messages.RELEASE_LIVE_VOTING,
			cls: 'feedbackFreezeButton',
			pressedCls: 'feedbackReleaseButton',
			scope: this,
			updateReleaseState: function (lock) {
				var button = me.releaseFeedbackButton;
				if (lock) {
					button.setCls(button.initialConfig.pressedCls);
					button.setText(button.initialConfig.altText);
					me.isFeedbackReleased = false;
				} else {
					button.setCls(button.initialConfig.cls);
					button.setText(button.initialConfig.text);
					me.isFeedbackReleased = true;
				}
			},
			handler: function (button) {
				var feedbackLock = this.isFeedbackReleased ? true : false;
				button.disable();

				ARSnova.app.sessionModel.lockFeedbackInput(feedbackLock, {
					success: function () {
						button.config.updateReleaseState(feedbackLock);
						button.enable();
					},
					failure: function () {
						Ext.Msg.alert(Messages.ERROR, Messages.RELEASE_VOTE_ERROR);
						button.enable();
					}
				});
			},
			hidden: !ARSnova.app.isSessionOwner &&
				ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			docked: 'top',
			ui: 'light',
			title: localStorage.getItem('shortName'),
			items: [this.backButton, this.releaseFeedbackButton]
		});

		this.optionButtons = Ext.create('Ext.Toolbar', {
			cls: 'noButtonsVotePanel',
			docked: 'top',
			defaults: {
				cls: 'voteButtons',
				flex: 1
			}
		});

		this.feedbackChart = Ext.create('Ext.chart.CartesianChart', {
			fullscreen: true,
			store: this.controller.initializeChartStore(this),

			animate: {
				easing: 'bounceOut',
				duration: 750
			},

			axes: [{
				type: 'numeric',
				position: 'left',
				fields: ['value'],
				hidden: true
			}, {
				type: 'category',
				position: 'bottom',
				fields: ['name'],
				style: {stroke: '#4a5c66'},
				renderer: function (label, layout, lastLabel) {
					// remove x-axis ticks and labels on refresh or update
					layout.attr.majorTicks = false;
				}
			}],

			series: [{
				type: 'bar',
				xField: 'name',
				yField: 'value',
				style: {
					minGapWidth: 25,
					maxBarWidth: 200
				},
				label: {
					display: 'insideEnd',
					field: 'value',
					color: '#fff',
					font: '20px Helvetica',
					orientation: 'horizontal',
					renderer: function (text, sprite, config, rendererData, index) {
						return {
							text: !rendererData.store.config.showPercentage ? text : text + " %",
							color: config.callout ? '#4a5c66' : '#fff'
						};
					}
				},
				renderer: function (sprite, config, rendererData, i) {
					var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;

					return {
						fill: rendererData.store.config.showPercentage ?
							ARSnova.app.feedbackChartStyleConfig.abcdColor :
							panel.feedbackChartColors[i % panel.feedbackChartColors.length]
					};
				}
			}]
		});

		this.initializeOptionButtons();
		this.add([this.toolbar, this.optionButtons, this.feedbackChart]);

		this.onBefore('painted', function () {
			var me = this;
			this.feedbackChartColors = [
				ARSnova.app.feedbackChartStyleConfig.okColor,
				ARSnova.app.feedbackChartStyleConfig.goodColor,
				ARSnova.app.feedbackChartStyleConfig.badColor,
				ARSnova.app.feedbackChartStyleConfig.noneColor
			];

			ARSnova.app.feedbackModel.getFeedback(sessionStorage.getItem('keyword'), {
				success: function (response) {
					var feedback = Ext.decode(response.responseText);
					me.updateChart(feedback.values);
				},
				failure: function () {
					console.log('server-side error');
				}
			});

			// remove x-axis ticks and labels at initialization
			this.feedbackChart.getAxes()[1].sprites[0].attr.majorTicks = false;
			this.prepareView();
		});
	},

	setToolbarTitle: function (title) {
		this.toolbar.setTitle(Ext.util.Format.htmlEncode(title));
	},

	buttonClicked: function (button) {
		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER && !ARSnova.app.feedbackModel.lock) {
			ARSnova.app.getController('Feedback').vote({
				value: button.config.value
			});
		}
	},

	prepareView: function () {
		var me = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.statisticPanel;
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			me.releaseFeedbackButton.setHidden(false);
			me.optionButtons.setCls('noButtonsVotePanel');
			me.backButton.setText(Messages.HOME);
			me.toolbar.setCls('speakerTitleBar');
		} else {
			if (ARSnova.app.feedbackModel.lock) {
				me.optionButtons.setCls('noButtonsVotePanel');
				me.backButton.setText(Messages.HOME);
			} else {
				me.optionButtons.setCls('voteButtonsPanel');
				me.backButton.setText(
					localStorage.getItem('lastVisitedRole') === ARSnova.app.USER_ROLE_SPEAKER ?
					Messages.HOME : Messages.FEEDBACK_VOTE
				);
			}

			if (features.liveClicker) {
				ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(false);
			}

			me.releaseFeedbackButton.setHidden(true);
			me.toolbar.setCls('');
		}

		me.releaseFeedbackButton.config.updateReleaseState(ARSnova.app.feedbackModel.lock);
		me.updateTabBar();
	},

	initializeOptionButtons: function () {
		this.buttonConfigurations = this.controller.initializeVoteButtonConfigurations(this);
		this.feedbackChart.setStore(this.controller.initializeChartStore(this));
		this.updateChart(ARSnova.app.feedbackModel.currentValues);
		this.optionButtons.removeAll(true);

		var firstOptionButton = Ext.create('Ext.Panel', {
			items: [this.buttonConfigurations.option0]
		});

		var secondOptionButton = Ext.create('Ext.Panel', {
			items: [this.buttonConfigurations.option1]
		});

		var thirdOptionButton = Ext.create('Ext.Panel', {
			items: [this.buttonConfigurations.option2]
		});

		var fourthOptionButton = Ext.create('Ext.Panel', {
			items: [this.buttonConfigurations.option3]
		});

		this.optionButtons.add([
			firstOptionButton,
			secondOptionButton,
			thirdOptionButton,
			fourthOptionButton
        ]);
	},

	updateChart: function (feedbackValues) {
		var chart = this.feedbackChart;
		var store = chart.getStore();
		var maxPercentage = 100;

		/* Swap values for "can follow" and "faster, please" feedback
		 * TODO: improve implementation, this is a quick hack for MoodleMoot 2013 */
		var values = feedbackValues.slice();
		var tmpValue = values[0];
		values[0] = values[1];
		values[1] = tmpValue;

		if (!Ext.isArray(values) || values.length !== store.getCount()) {
			return;
		}

		if (store.config.showPercentage) {
			chart.getSeries()[0].setYField('percent');
			chart.getAxes()[0].setMaximum(maxPercentage);
			chart.getSeries()[0].getLabel().getTemplate().setField('percent');
		} else {
			chart.getSeries()[0].setYField('value');
			chart.getAxes()[0].setMaximum(Math.max.apply(null, values));
			chart.getSeries()[0].getLabel().getTemplate().setField('value');
		}

		// Set chart data
		store.each(function (record, index) {
			record.set('value', values[index]);
		});

		// Calculate percentages
		var sum = store.sum('value');
		store.each(function (record) {
			var percent =  Math.round(sum > 0 ? ((record.get('value') / sum) * 100) : 0.0);
			var max = Math.max(maxPercentage, percent);
			record.set('percent', percent);

			// Scale axis to a bigger number. For example, 12 answers get a maximum scale of 20.
			maxPercentage = Math.ceil(max / 10) * 10;
		});

		chart.redraw();
	},

	updateTabBar: function (averageFeedback) {
		var features = Ext.decode(sessionStorage.getItem("features"));
		var iconCls, lockedCls = ' lockedFeedback';

		// update feedback-badge in tab bar
		ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab.setBadgeText(this.feedbackChart.getStore().sum('value'));

		averageFeedback = averageFeedback ? averageFeedback : ARSnova.app.feedbackModel.currentAverage;

		// change the feedback tab bar icon
		var tab = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.tab;

		if (features.liveClicker) {
			iconCls = "voteIcons icon-chart";
			tab.setTitle(Messages.ABCD_TITLE);
		} else {
			tab.setTitle(Messages.FEEDBACK);
			switch (averageFeedback) {
				case 0:
					iconCls = "voteIcons icon-wink";
					break;
				case 1:
					iconCls = "voteIcons icon-happy";
					break;
				case 2:
					iconCls = "voteIcons icon-shocked";
					break;
				case 3:
					iconCls = "voteIcons icon-sad";
					break;
				default:
					iconCls = "voteIcons icon-bullhorn";
					break;
			}
		}

		if (ARSnova.app.feedbackModel.lock) {
			tab.setIconCls(iconCls + lockedCls);
		} else {
			tab.setIconCls(iconCls);
		}
	}
});
