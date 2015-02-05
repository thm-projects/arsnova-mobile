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
Ext.define('ARSnova.view.AnswerPreviewStatisticChart', {
	extend: 'Ext.Panel',

	config: {
		title: Messages.STATISTIC,
		height: '100%',
		width: '100%',
		fullscreen: true,
		layout: 'fit'
	},

	chartRefreshDuration: 1000,

	constructor: function (args) {
		this.callParent(arguments);

		var me = this;

		this.questionObj = args.question;
		this.lastPanel = args.lastPanel;

		this.questionStore = Ext.create('Ext.data.Store', {
			fields: [
				{name: 'text', type: 'string'},
				{name: 'value',  type: 'int'},
				{name: 'percent',  type: 'int'}
			]
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function() {
				var previewBox = this.lastPanel;

				previewBox.removeAll(false);
				previewBox.setScrollable(true);
				previewBox.mainPanel.add(previewBox.confirmButton);

				previewBox.add([
					previewBox.toolbar,
					previewBox.mainPanel
				]);

				this.destroy();
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			title: Messages.QUESTION,
			items: [this.backButton, {
				xtype: 'spacer'
			}, {
				xtype: 'button',
				width: '55px',
				iconCls: 'icon-check',
				cls: 'toggleCorrectButton',
				handler: function(button) {
					var me = this,
						data = [];

					button.disable();

					if (this.toggleCorrect) {
						button.removeCls('x-button-pressed');
					} else {
						button.addCls('x-button-pressed');
					}
					this.toggleCorrect = !this.toggleCorrect;

					// remove all data for a smooth "redraw"
					this.questionStore.each(function (record) {
						data.push({
							text: record.get('text'),
							value: record.get('value'),
							percent: record.get('percent')
						});

						record.set('value', 0);
						record.set('percent', 0);
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
				scope: this
			}]
		});

		this.titlebar = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: 'questionStatisticTitle',
			docked: 'top',
			baseCls: Ext.baseCSSPrefix + 'title',
			style: ''
		});
		console.log(this.questionObj);
		this.titlebar.setContent(this.questionObj.text, true, true);

		this.abstentionGradient = Ext.create('Ext.draw.gradient.Linear', {
			degrees: 90,
			stops: [
				{offset: 0, color: 'rgb(180, 180, 180)'},
				{offset: 100, color: 'rgb(150, 150, 150)'}
			]
		});

		this.initializeDefaultGradients();
		this.initializeCorrectAnswerGradients();
		this.setGradients();

		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			var pA = this.questionObj.possibleAnswers[i];

			var min = 1,
				max = 10;

			this.questionStore.add({
				text: pA.text === "" ? i + 1 : pA.text,
				value: Math.floor(Math.random() * (max - min + 1) + min)
			});
		}

		this.questionChart = Ext.create('Ext.chart.CartesianChart', {
			store: this.questionStore,
			style: 'margin-top: 15px',
			fullscreen: true,

			animate: {
				easing: 'bounceOut',
				duration: this.chartRefreshDuration
			},

			axes: [{
				type: 'numeric',
				position: 'left',
				fields: ['value'],
				increment: 1,
				minimum: 0,
				majorTickSteps: 10,
				style: {
					stroke: '#4a5c66',
					lineWidth: 2
				},
				label: {
					color: '#4a5c66',
					fontWeight: 'bold'
				}
			}, {
				type: 'category',
				position: 'bottom',
				fields: ['text'],
				style: {
					stroke: '#4a5c66',
					lineWidth: 2
				},
				label: {
					color: '#4a5c66',
					fontWeight: 'bold',
					rotate: {degrees: 315}
				},
				renderer: function (label, layout, lastLabel) {
					var panel, labelColor;

					if(me.toggleCorrect && label !== Messages.ABSTENTION
						&& Object.keys(me.correctAnswers).length > 0) {
						labelColor = me.correctAnswers[label] ?  '#80ba24' : '#971b2f';
					} else {
						labelColor = '#4a5c66';
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
				yField: 'value',
				colors: this.gradients,
				style: {
					minGapWidth: 10,
					maxBarWidth: 200
				},
				label: {
					display: 'insideEnd',
					field: 'percent',
					color: '#fff',
					calloutColor: 'transparent',
					renderer: function (text, sprite, config, rendererData, index) {
						var barWidth = this.itemCfg.width;
						return {
							text: text + " %",
							color: config.callout ? '#4a5c66' : '#fff',
							calloutVertical: barWidth > 40 ? false : true,
							rotationRads: barWidth > 40 ? 0 : config.rotationRads,
							calloutPlaceY: barWidth <= 40 ? config.calloutPlaceY :
								config.calloutPlaceY + 10
						};
					}
				},
				renderer: function (sprite, config, rendererData, i) {
					var panel, gradient,
						data = rendererData.store.getData().getAt(i).getData();

					if(data.text === Messages.ABSTENTION) {
						return {fill: me.abstentionGradient};
					}

					return rendererData = {
						fill: me.gradients[i % me.gradients.length]
					};
				}
			}]
		});

		this.add([this.toolbar, this.titlebar, this.questionChart]);
		this.on('activate', this.calculateChartData);
	},

	setGradients: function (promise) {
		if (this.toggleCorrect) {
			this.gradients = this.correctAnswerGradients;
		} else {
			this.gradients = this.defaultGradients;
		}
	},

	initializeCorrectAnswerGradients: function() {
		var data, question;
		this.correctAnswers = {};
		this.correctAnswerGradients = [];

		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			question = this.questionObj.possibleAnswers[i];
			data = question.data ? question.data : question;

			data.text = data.text === "" ? i + 1 : data.text;
			this.correctAnswers[data.text] = data.correct;

			if ((question.data && !question.data.correct) || (!question.data && !question.correct)) {
				this.correctAnswerGradients.push(
					Ext.create('Ext.draw.gradient.Linear', {
						degrees: 90,
						stops: [
							{offset: 0, color: 'rgb(151, 27, 47);'},
							{offset: 100, color: 'rgb(111, 7, 27)'}
						]
					})
				);
			} else {
				this.correctAnswerGradients.push(
					Ext.create('Ext.draw.gradient.Linear', {
						degrees: 90,
						stops: [
							{offset: 0, color: 'rgb(128, 186, 36)'},
							{offset: 100, color: 'rgb(88, 146, 0)'}
						]
					})
				);
			}
		}
	},

	initializeDefaultGradients: function() {
		this.defaultGradients = [
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

	calculateChartData: function () {
		var panel = this;
		var chart = panel.questionChart;
		var store = chart.getStore();

		var value,
			percent,
			sum = 0,
			maxValue = 10,
			totalResults;

		// sum all values
		totalResults = store.sum('value');

		// Calculate percentages
		// determine max value
		store.each(function(record) {
			value = record.get('value');
			percent = Math.round((value / totalResults) * 100);
			record.set('percent', percent);

			if(value > maxValue) {
				maxValue = Math.ceil(value / 10) * 10;
			}
		});

		// set maximum
		chart.getAxes()[0].setMaximum(maxValue);

		// renew the chart-data
		chart.redraw();
	}
});
