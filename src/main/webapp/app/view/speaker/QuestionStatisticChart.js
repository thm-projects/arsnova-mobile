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
Ext.define('ARSnova.view.speaker.QuestionStatisticChart', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.STATISTIC,
		iconCls: 'icon-chart',
		layout: 'fit'
	},

	gradients: null,
	questionObj: null,
	questionChart: null,
	questionStore: null,
	gridStatistic: null,

	/**
	 * For some questions we add some more bars to the chart which contain information like the number of answers
	 * that only have correct answer options.
	*/
	summaryBarIndexes: [],
	mcAllCorrect: {},
	mcAllWrong: {},

	/* toolbar items */
	toolbar: null,
	piTimer: false,
	editButtons: null,
	toggleCorrect: false,
	chartRefreshDuration: 1000,

	renewChartDataTask: {
		name: 'renew the chart data at question statistics charts',
		run: function () {
			var mainTabPanel = ARSnova.app.mainTabPanel;
			var tP = mainTabPanel.tabPanel;
			var panel = tP.userQuestionsPanel || tP.speakerTabPanel;

			panel.questionStatisticChart.getQuestionAnswers();

			if (mainTabPanel.getActiveItem() === panel.statisticTabPanel) {
				panel.statisticTabPanel.roundManagementPanel.updateEditButtons();
			}
		},
		interval: 10000 // 10 seconds
	},

	constructor: function (args) {
		this.callParent(arguments);

		var me = this;
		this.questionObj = args.question;

		this.questionStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'text', type: 'string'},
				{name: 'value-round1',  type: 'int'},
				{name: 'value-round2', type: 'int'},
				{name: 'percent-round1',  type: 'int'},
				{name: 'percent-round2', type: 'int'}
			]
		});

		var hasCorrectAnswers = Ext.bind(function () {
			var hasCorrect = false;
			this.questionObj.possibleAnswers.forEach(function (answer) {
				hasCorrect = hasCorrect || answer.correct;
			});
			return hasCorrect;
		}, this);

		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			var pA = this.questionObj.possibleAnswers[i];
			if (pA.data) {
				this.questionStore.add({
					text: pA.data.text,
					value: 0
				});
			} else {
				this.questionStore.add({
					text: pA.text,
					value: 0
				});
			}
		}

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			align: 'left',
			style: 'min-width: 60px;',
			handler: function () {
				var object, me = this;
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				var speakerTabPanel = tabPanel.speakerTabPanel;

				ARSnova.app.innerScrollPanel = false;
				ARSnova.app.taskManager.stop(me.renewChartDataTask);

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

		this.answerCounter = Ext.create('Ext.Component', {
			cls: "x-toolbar-title alignRight counterText",
			align: 'right'
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			docked: 'top',
			ui: 'light',
			title: Ext.util.Format.htmlEncode(this.questionObj.subject),
			items: [
				this.backButton,
				this.answerCounter, {
				xtype: 'button',
				align: 'right',
				iconCls: 'icon-check',
				cls: 'toggleCorrectButton',
				scope: this,
				handler: this.toggleCorrectHandler,
				hidden: !hasCorrectAnswers() || this.questionObj.questionType === 'grid' ||
					(ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT && !this.questionObj.showAnswer)
			}]
		});

		this.piToolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			style: 'background: transparent; border: none;',
			hidden: true,
			items: [{
					xtype: 'spacer'
				}, this.segmentedButton = Ext.create('Ext.SegmentedButton', {
					allowDepress: false,
					defaults: {
						ui: 'action'
					},
					items: [{
							text: Messages.FIRST_ROUND,
							itemId: '1'
						}, {
							text: Messages.SECOND_ROUND,
							itemId: '2'
						}, {
							text: Messages.BOTH_ROUNDS,
							itemId: '0'
						}
					],
					listeners: {
						toggle: function (container, button, pressed) {
							if (pressed && container.lastPressed !== button.getItemId()) {
								this.modifyChart(button.getItemId());
								container.lastPressed = button.getItemId();
							}
						},
						scope: this
					}
				}), {
					xtype: 'spacer'
				}
			]
		});

		this.titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: 'questionStatisticTitle',
			hideMediaElements: true,
			baseCls: Ext.baseCSSPrefix + 'title',
			docked: 'top',
			style: ''
		});
		this.titlePanel.setContent(this.questionObj.text, true, true);

		if (this.questionObj.questionType === "grid") {
			this.setLayout('');
			this.setScrollable(true);

			// Setup question title and text to disply in the same field; markdown handles HTML encoding
			var questionString = '' + '\n' + this.questionObj.text;

			// Create standard panel with framework support
			this.titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				hideMediaElements: true,
				cls: "roundedBox"
			});
			this.titlePanel.setContent(questionString, true, true);
		}

		this.setGradients();

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			style: 'margin-top: 40px',
			docked: 'top',
			viewOnly: true,
			viewOnlyOpacity: 1,
			hidden: true
		});

		var statisticColor, fontSize;
		if (ARSnova.app.projectorModeActive) {
			fontSize = ((12 / 100) * ARSnova.app.globalZoomLevel) + 'px';
			statisticColor = 'black';
			this.addCls('projector-mode');
			this.titlePanel.setStyle('font-size: ' + ARSnova.app.globalZoomLevel + '%;');
		} else {
			fontSize = '12px';
			statisticColor = '#4a5c66';
			this.removeCls('projector-mode');
		}

		this.questionChart = Ext.create('Ext.chart.CartesianChart', {
			store: this.questionStore,
			hidden: this.questionObj.questionType === "grid",

			animate: {
				easing: 'bounceOut',
				duration: this.chartRefreshDuration
			},

			axes: [{
				type: 'numeric',
				position: 'left',
				fields: ['value-round1'],
				increment: 1,
				minimum: 0,
				majorTickSteps: 10,
				style: {
					stroke: statisticColor,
					lineWidth: 2
				},
				label: {
					color: statisticColor,
					fontWeight: 'bold',
					fontSize: fontSize
				},
				grid: {
					odd: {
						opacity: 1,
						stroke: '#bbb',
						'lineWidth': 1
					},
					even: {
						opacity: 1,
						stroke: '#bbb',
						'lineWidth': 1
					}
				},
				renderer: function (label, layout, lastLabel) {
					var panel = ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT ?
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.questionStatisticChart :
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;

					return panel.questionChart.showPercentage ? Math.round(label) + " %" : Math.round(label);
				}
			}, {
				type: 'category',
				position: 'bottom',
				fields: ['text'],
				style: {
					stroke: statisticColor,
					lineWidth: 2
				},
				label: {
					color: statisticColor,
					fontWeight: 'bold',
					rotate: {degrees: 315},
					fontSize: fontSize
				},
				renderer: function (label, layout, lastLabel) {
					var panel, labelColor;

					panel = ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT ?
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.questionStatisticChart :
						ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;

					if (panel.toggleCorrect && [Messages.ALL_CORRECT, Messages.ALL_WRONG, Messages.ABSTENTION].indexOf(label) === -1
						&& Object.keys(panel.correctAnswers).length > 0) {
						labelColor = panel.correctAnswers[label] ? '#80ba24' : '#971b2f';
					} else {
						labelColor = statisticColor;
					}

					layout.segmenter.getAxis().setLabel({
						color: labelColor,
						fontWeight: 'bold',
						rotate: {degrees: 315}
					});

					return label.length < 30 ? label :
						label.substring(0, 29) + "...";
				}
			}],

			series: [{
				type: 'bar',
				xField: 'text',
				yField: ['value-round1'],
				stacked: false,
				style: {
					minGapWidth: 10,
					maxBarWidth: 200,
					inGroupGapWidth: 0
				},
				label: {
					display: 'insideEnd',
					field: ['percent-round1'],
					color: '#fff',
					calloutColor: 'transparent',
					renderer: function (text, sprite, config, rendererData, index) {
						var barWidth = this.itemCfg.width;
						var panel = ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT ?
								ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.questionStatisticChart :
								ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;

						return {
							text: panel.questionChart.showPercentage ? text : text + " %",
							color: config.callout ? statisticColor : '#fff',
							calloutVertical: barWidth > 40 ? false : true,
							rotationRads: barWidth > 40 ? 0 : config.rotationRads,
							calloutPlaceY: barWidth <= 40 ? config.calloutPlaceY :
								config.calloutPlaceY + 10
						};
					}
				},
				renderer: function (sprite, config, rendererData, i) {
					var panel, gradient,
						record = rendererData.store.getAt(i),
						data = record ? record.getData() : {};

					panel = ARSnova.app.userRole === ARSnova.app.USER_ROLE_STUDENT ?
							ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.questionStatisticChart :
							ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.questionStatisticChart;

					gradient = data.text === Messages.ABSTENTION ?
							gradient = panel.abstentionGradient :
							gradient = panel.gradients[i % panel.gradients.length];

					if (panel.questionChart.showPercentage) {
						if (sprite.getField() === "percent-round1") {
							gradient = data.text === Messages.ABSTENTION ?
									gradient = panel.alternateAbstentionGradient :
									gradient = panel.alternativeGradients[i % panel.alternativeGradients.length];
						}
					}

					return {fill: gradient};
				}
			}]
		});

		if (this.questionObj.questionType !== "grid") {
			this.add([
				this.toolbar,
				this.countdownTimer,
				this.piToolbar,
				this.titlePanel,
				this.questionChart
			]);
		} else {
			this.setStyle('background-color: #E0E0E0');
			// add statistic
			this.gridStatistic = Ext.create('ARSnova.view.components.GridStatistic', {
				questionObj: this.questionObj
			});

			this.add([this.toolbar, {
				xtype: 'formpanel',
				style: 'margin-top: 10px',
				scrollable: null,
				items: [this.countdownTimer,
						this.titlePanel,
						this.questionChart,
						this.gridStatistic
				]}
			]);

			this.getQuestionAnswers();
		}

		this.on('activate', this.onActivate);

		this.on('hide', function () {
			ARSnova.app.activePreviewPanel = false;
			this.countdownTimer.stop();
		});

		this.on('painted', function () {
			ARSnova.app.activePreviewPanel = this;
		});
	},

	onActivate: function () {
		ARSnova.app.innerScrollPanel = this;
		ARSnova.app.taskManager.start(this.renewChartDataTask);
		this.checkPiRoundActivation();

		if (this.questionObj.piRound === 1) {
			this.activateFirstSegmentButton();
		} else {
			this.activateSecondSegmentButton();
		}
	},

	checkPiRoundActivation: function () {
		if (this.questionObj.piRoundActive) {
			this.countdownTimer.start(this.questionObj.piRoundStartTime, this.questionObj.piRoundEndTime);
			this.countdownTimer.show();
		} else {
			this.countdownTimer.stop();
		}
	},

	activateFirstSegmentButton: function () {
		this.segmentedButton.setPressedButtons([1]);
	},

	activateSecondSegmentButton: function () {
		this.segmentedButton.setPressedButtons([2]);
	},

	enablePiRoundElements: function () {
		this.piToolbar.show();
	},

	disablePiRoundElements: function () {
		this.piToolbar.hide();
	},

	modifyChart: function (piRound) {
		var fields, percentages,
			isStacked = false,
			me = this;

		switch (parseInt(piRound)) {
			case 1:
			case 2:
				isStacked = true;
				fields = ['value-round' + piRound];
				percentages = ['percent-round' + piRound];
				this.questionChart.showPercentage = false;
				break;
			default:
				fields = ['percent-round1', 'percent-round2'];
				percentages = ['value-round1', 'value-round2'];
				this.questionChart.showPercentage = true;
		}

		// remove all data for a "smooth" redraw
		this.questionStore.each(function (record) {
			record.set('value-round1', 0);
			record.set('value-round2', 0);
			record.set('percent-round1', 0);
			record.set('percent-round2', 0);
		});

		// set fields, axes, labels and sprites for pi bar redraw
		this.questionChart.getSeries()[0].sprites = [];
		this.questionChart.getAxes()[0].setFields(fields);
		this.questionChart.getSeries()[0].setYField(fields);
		this.questionChart.getSeries()[0].setStacked(isStacked);
		this.questionChart.getSeries()[0].getLabel().getTemplate().setField(percentages);
		this.questionChart.redraw();

		// delayed answers update for a "smooth" redraw
		var updateDataTask = Ext.create('Ext.util.DelayedTask', function () {
			me.getQuestionAnswers();
		});

		updateDataTask.delay(1000);
	},

	getQuestionAnswers: function () {
		var me = this;
		var chart = me.questionChart;
		var store = chart.getStore();

		var sum = 0;
		var maxValue = 10;
		var maxPercentage = 100;

		var calculation = function (answers, valuePattern) {
			var i, el, record;
			var tmpPossibleAnswers = [];
			var valueString = 'value' + valuePattern;
			var percentString = 'percent' + valuePattern;

			sum = 0;

			for (i = 0; i < tmpPossibleAnswers.length; i++) {
				el = tmpPossibleAnswers[i];
				record = store.findRecord('text', el, 0, false, true, true);
				record.set(valueString, 0);
			}

			for (i = 0; i < me.questionObj.possibleAnswers.length; i++) {
				el = me.questionObj.possibleAnswers[i];
				if (el.data) {
					tmpPossibleAnswers.push(el.data.text);
				} else {
					tmpPossibleAnswers.push(el.text);
				}
			}

			var mcAnswerCount = [];
			var abstentionCount = 0;
			var mcTotalAnswerCount = 0;

			var mcAnswersWithCorrectAnswersOnly = 0;
			var mcAnswersWithWrongAnswersOnly = 0;
			var recordAllCorrect, recordAllWrong;

			// Build answerText strings like "1,1,0,1"
			var mcCorrectString = me.questionObj.possibleAnswers.map(function (p) {
				return p.correct ? "1" : "0";
			}).join();
			var mcWrongString = me.questionObj.possibleAnswers.map(function (p) {
				return p.correct ? "0" : "1";
			}).join();

			if (answers.length === 0) {
				store.each(function (record) {
					record.set(valueString, 0);
					record.set(percentString, 0);
				});
			} else {
				var answerValuesMapFunc = function (answered) {
					return parseInt(answered, 10);
				};
				var answerValuesForEachFunc = function (selected, index) {
					this[index] = this[index] || 0;
					if (selected === 1) {
						this[index] += 1;
					}
				};
				var chartStoreEachFunc = function (record, index) {
					record.set(valueString, this[index]);
				};
				var maxValueFunc = function (record, index) {
					var max = Math.max(maxValue, record.get(valueString));
					// Scale axis to a bigger number. For example, 12 answers get a maximum scale of 20.
					maxValue = Math.ceil(max / 10) * 10;
				};
				for (i = 0; i < answers.length; i++) {
					el = answers[i];

					mcTotalAnswerCount += el.answerCount;

					if (me.questionObj.questionType === "mc") {
						if (!el.answerText) {
							abstentionCount = el.abstentionCount;
							continue;
						}
						var values = el.answerText.split(",").map(answerValuesMapFunc);
						if (values.length !== me.questionObj.possibleAnswers.length) {
							return;
						}

						// Mark "All correct" answers
						if (el.answerText === mcCorrectString) {
							mcAnswersWithCorrectAnswersOnly = el.answerCount;
						}
						// Mark "All wrong" answers
						if (el.answerText === mcWrongString) {
							mcAnswersWithWrongAnswersOnly = el.answerCount;
						}
						for (var j = 0; j < el.answerCount; j++) {
							values.forEach(answerValuesForEachFunc, mcAnswerCount);
						}
						store.each(chartStoreEachFunc, mcAnswerCount);
					} else if (me.questionObj.questionType === "grid") {
						me.gridStatistic.answers = answers;
						me.gridStatistic.setQuestionObj = me.questionObj;
						me.gridStatistic.updateGrid();
					} else {
						if (!el.answerText) {
							abstentionCount = el.abstentionCount;
							continue;
						}
						record = store.findRecord('text', el.answerText, 0, false, true, true); // exact match
						if (record) {
							record.set(valueString, el.answerCount);
						}
					}
					sum += el.answerCount;

					store.each(maxValueFunc);

					var idx = tmpPossibleAnswers.indexOf(el.answerText); // Find the index
					if (idx !== -1) {
						// Remove it if really found!
						tmpPossibleAnswers.splice(idx, 1);
					}
				}
				recordAllCorrect = store.findRecord('text', Messages.ALL_CORRECT, 0, false, true, true); // exact match
				recordAllWrong = store.findRecord('text', Messages.ALL_WRONG, 0, false, true, true); // exact match
				if (recordAllCorrect) {
					recordAllCorrect.set(valueString, mcAnswersWithCorrectAnswersOnly);
				}
				if (recordAllWrong) {
					recordAllWrong.set(valueString, mcAnswersWithWrongAnswersOnly);
				}
				me.mcAllCorrect[valueString] = mcAnswersWithCorrectAnswersOnly;
				me.mcAllWrong[valueString] = mcAnswersWithWrongAnswersOnly;
			}

			if (abstentionCount) {
				record = store.findRecord('text', Messages.ABSTENTION, 0, false, true, true); // exact match
				if (!record) {
					store.add({text: Messages.ABSTENTION, valueString: abstentionCount});
				} else if (record.get(valueString) !== abstentionCount) {
					record.set(valueString, abstentionCount);
				}
			}

			// Calculate percentages
			if (me.questionObj.questionType === "mc") {
				store.each(function (record) {
					var dividend = mcTotalAnswerCount === 0 ? 1 : mcTotalAnswerCount;
					var percent = Math.round((record.get(valueString) / dividend) * 100);
					var max = Math.max(maxPercentage, percent);
					record.set(percentString, percent);

					// Scale axis to a bigger number. For example, 12 answers get a maximum scale of 20.
					maxPercentage = Math.ceil(max / 10) * 10;
				});
				me.mcAllCorrect[percentString] = me.mcAllCorrect[valueString] / (mcTotalAnswerCount || 1) * 100;
				me.mcAllWrong[percentString] = me.mcAllWrong[valueString] / (mcTotalAnswerCount || 1) * 100;
			} else {
				var totalResults = store.sum(valueString);
				store.each(function (record) {
					var dividend = totalResults === 0 ? 1 : totalResults;
					var percent = Math.round((record.get(valueString) / dividend) * 100);
					var max = Math.max(maxPercentage, percent);
					record.set(percentString, percent);

					// Scale axis to a bigger number. For example, 12 answers get a maximum scale of 20.
					maxPercentage = Math.ceil(max / 10) * 10;
				});
			}
		};

		var afterCalculation = function (round) {
			if (me.questionChart.showPercentage) {
				chart.getAxes()[0].setMaximum(maxPercentage);
			} else {
				chart.getAxes()[0].setMaximum(maxValue);
			}

			if (round > 1) {
				me.piToolbar.show();
			}

			me.updateAnswerCount(me.questionObj.piRound);

			// renew the chart-data
			chart.redraw();
		};

		var countFirstRoundAnswers = function (countSecondRound) {
			ARSnova.app.questionModel.countPiAnswers(localStorage.getItem('keyword'), me.questionObj._id, 1, {
				success: function (piRound1) {
					var answers = Ext.decode(piRound1.responseText);
					calculation(answers, '-round1');
					me.answerCountFirstRound = sum;

					if (countSecondRound !== Ext.emptyFn) {
						countSecondRound();
					} else {
						afterCalculation();
					}
				},
				failure: function () {
					console.log('server-side error');
				}
			});
		};

		var countSecondRoundAnswers = function () {
			ARSnova.app.questionModel.countPiAnswers(localStorage.getItem('keyword'), me.questionObj._id, 2, {
				success: function (piRound2) {
					var piAnswers = Ext.decode(piRound2.responseText);
					calculation(piAnswers, '-round2');
					me.answerCountSecondRound = sum;
					afterCalculation(me.questionObj.piRound);
				},
				failure: function () {
					console.log('server-side error');
				}
			});
		};

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER || me.questionObj.piRound !== 1) {
			countFirstRoundAnswers(countSecondRoundAnswers);
		} else if (me.questionObj.piRound === 1) {
			countFirstRoundAnswers(Ext.emptyFn);
		}
	},

	setAnswerCounter: function (value, message) {
		if (!message) {
			message = value === 1 ? Messages.ANSWER : Messages.ANSWERS;
		}

		this.answerCounter.setHtml(value + ' ' + message);
	},

	updateAnswerCount: function (round) {
		var count = 0;

		switch (this.segmentedButton.lastPressed) {
			case '1':
				count = this.answerCountFirstRound;
				this.setAnswerCounter(count);
				break;
			case '2':
				count = this.answerCountSecondRound;
				this.setAnswerCounter(count);
				break;
			default:
				count = this.answerCountFirstRound + " | " + this.answerCountSecondRound;
				this.setAnswerCounter(count, " ");
				break;
		}

		if (this.questionObj.piRound === 1) {
			this.hasAnswers = this.answerCountFirstRound > 0;
		} else {
			this.hasAnswers = this.answerCountSecondRound > 0;
		}
	},

	toggleCorrectHandler: function (button) {
		var me = this,
		data = [],
		entries;

		button.disable();

		if (this.toggleCorrect) {
			button.removeCls('x-button-pressed');
			// Remove summary bars/captions from the chart.
			// The array contains indexes in reverse order so that the first
			// removal does not change any existing indexes in the store.
			for (var i = 0; i < this.summaryBarIndexes.length; i++) {
				var record = this.questionStore.getAt(this.summaryBarIndexes[i]);
				if (record) {
					if (record.get("text") === Messages.ALL_CORRECT) {
						this.mcAllCorrect = record.getData();
					} else {
						this.mcAllWrong = record.getData();
					}
				}
				this.questionStore.removeAt(this.summaryBarIndexes[i]);
			}
			this.summaryBarIndexes = [];
		} else {
			button.addCls('x-button-pressed');

			if (this.questionObj.questionType === 'mc' && this.questionObj.possibleAnswers.length > 2) {
				// Add summary bars/captions while in 'toggle correct answers' mode for MC questions
				entries = this.questionStore.add([{
					text: Messages.ALL_CORRECT,
					"value-round1": this.mcAllCorrect['value-round1'],
					"value-round2": this.mcAllCorrect['value-round2'],
					"percent-round1": this.mcAllCorrect['percent-round1'],
					"percent-round2": this.mcAllCorrect['percent-round2']
				}, {
					text: Messages.ALL_WRONG,
					"value-round1": this.mcAllWrong['value-round1'],
					"value-round2": this.mcAllWrong['value-round2'],
					"percent-round1": this.mcAllWrong['percent-round1'],
					"percent-round2": this.mcAllWrong['percent-round2']
				}]);
				entries = entries.map(function (record) {
					return record.getId();
				});
				// The whole process is complicated because we somehow cannot
				// remove elements from the store simply by passing in the
				// records. Instead, we need to find the indexes of those entries
				// and use them for deletion later on.
				this.questionStore.each(function (record, index) {
					if (entries.indexOf(record.getId()) !== -1) {
						this.summaryBarIndexes.push(index);
					}
				}, this);
				// Reverse so that we remove the elements without changing the indexes.
				// We need to remove the highest index first. For example, if our array
				// contains [3, 4] and we would delete index 3 first, then index 4 would
				// not exist since the next element would get its index reduced to 3...
				this.summaryBarIndexes.reverse();
			}
		}
		this.toggleCorrect = !this.toggleCorrect;

		// remove all data for a smooth "redraw"
		this.questionStore.each(function (record) {
			data.push({
				text: record.get('text'),
				"value-round1": record.get('value-round1'),
				"value-round2": record.get('value-round2'),
				"percent-round1": record.get('percent-round1'),
				"percent-round2": record.get('percent-round2')
			});

			record.set('value-round1', 0);
			record.set('value-round2', 0);
			record.set('percent-round1', 0);
			record.set('percent-round2', 0);
		});

		var updateDataTask = Ext.create('Ext.util.DelayedTask', function () {
			me.questionStore.setData(data);
			button.enable();
		});

		var setGradientTask = Ext.create('Ext.util.DelayedTask', function () {
			// updates the chart's colors
			me.setGradients();

			// delay till chart is redrawn
			updateDataTask.delay(me.chartRefreshDuration - 200);
		});

		// delay till chart is empty
		setGradientTask.delay(me.chartRefreshDuration - 200);
	},

	showEmbeddedPagePreview: function (embeddedPage) {
		var controller = ARSnova.app.getController('Application'),
			me = this;

		embeddedPage.setBackHandler(function () {
			// remove & destroy embeddedPage and delete reference
			delete controller.embeddedPage;

			ARSnova.app.mainTabPanel.animateActiveItem(me, {
				type: 'slide',
				direction: 'right',
				duration: 700
			});
		});

		ARSnova.app.mainTabPanel.animateActiveItem(embeddedPage, {
			type: 'slide',
			direction: 'left',
			duration: 700
		});
	},

	setGradients: function () {
		this.correctAnswers = {};

		if (this.questionObj.questionType === "yesno" || this.questionObj.questionType === "mc"
				|| (this.questionObj.questionType === "abcd" && !this.questionObj.noCorrect)) {
			if (this.toggleCorrect) {
				this.gradients = this.getCorrectAnswerGradients();
			} else {
				this.gradients = this.getDefaultGradients();
			}
		} else {
			this.gradients = this.getDefaultGradients();
		}

		this.abstentionGradient = Ext.create('Ext.draw.gradient.Linear', {
			degrees: 90,
			stops: [
				{offset: 0, color: 'rgb(150, 150, 150)'},
				{offset: 100, color: 'rgb(120, 120, 120)'}
			]
		});

		this.alternateAbstentionGradient = Ext.create('Ext.draw.gradient.Linear', {
			degrees: 90,
			stops: [
				{offset: 0, color: 'rgb(180, 180, 180)'},
				{offset: 100, color: 'rgb(150, 150, 150)'}
			]
		});

		this.alternativeGradients = this.createLighterGradients(this.gradients);
	},

	getCorrectAnswerGradients: function () {
		var data, question, gradients = [],
			correctColorGradient = Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(128, 186, 36)'},
					{offset: 100, color: 'rgb(88, 146, 0)'}
				]
			}),
			incorrectColorGradient = Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(151, 27, 47);'},
					{offset: 100, color: 'rgb(111, 7, 27)'}
				]
			});

		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			question = this.questionObj.possibleAnswers[i];
			data = question.data || question;

			this.correctAnswers[data.text] = data.correct;

			if ((question.data && !question.data.correct) || (!question.data && !question.correct)) {
				gradients.push(incorrectColorGradient);
			} else {
				gradients.push(correctColorGradient);
			}
		}
		// Add two more gradients for the summary bars
		gradients.push(correctColorGradient);
		gradients.push(incorrectColorGradient);

		return gradients;
	},

	getDefaultGradients: function () {
		return [
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(22, 64, 128)'},
					{offset: 100, color: 'rgb(0, 14, 88)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(48, 128, 128)'},
					{offset: 100, color: 'rgb(8, 88, 88)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(128, 128, 25)'},
					{offset: 100, color: 'rgb(88, 88, 0)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(128, 28, 128)'},
					{offset: 100, color: 'rgb(88, 0, 88)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(215, 113, 1)'},
					{offset: 100, color: 'rgb(175, 73, 0)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(128, 64, 22)'},
					{offset: 100, color: 'rgb(88, 24, 0)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(64, 0, 128)'},
					{offset: 100, color: 'rgb(40, 2, 79)'}
				]
			}),
			Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: 'rgb(150, 30, 0)'},
					{offset: 100, color: 'rgb(110, 0, 0)'}
				]
			})
		];
	},

	createLighterGradients: function (gradients) {
		var lum = 0.15;
		var lighterGradients = [];

		gradients.forEach(function (gradient) {
			var hex = String(gradient.getStops()[0].color).replace(/[^0-9a-f]/gi, '');
			if (hex.length < 6) {
				hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}
			lum = lum || 0;

			// convert to decimal and change luminosity
			var stopColor = "#", c, i;
			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i * 2, 2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
				stopColor += ("00" + c).substr(c.length);
			}

			lighterGradients.push(Ext.create('Ext.draw.gradient.Linear', {
				degrees: 90,
				stops: [
					{offset: 0, color: stopColor},
					{offset: 100, color: stopColor}
				]
			}));
		});

		return lighterGradients;
	}
});
