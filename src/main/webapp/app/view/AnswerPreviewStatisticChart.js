/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
		style: 'background: black',
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
			fields: ['text', 'value', 'percent']
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
						updateDataTask.delay(me.chartRefreshDuration-200);
					});
					
					// delay till chart is empty
					setGradientTask.delay(me.chartRefreshDuration-200);
				},
				scope: this
			}]
		});
		
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
				
			this.questionStore.add({
				text: pA.text === "" ? i+1 : pA.text,
				value: Math.floor(Math.random() * (8 + 2) + 1)
			});
		}
		
		console.log(this.gradients);

		this.questionChart = Ext.create('Ext.chart.CartesianChart', {
			store: this.questionStore,
			style: 'background: black',
			fullscreen: true,
			
			animate: {
				easing: 'bounceOut',
				duration: this.chartRefreshDuration
			},

			axes: [{
				type: 'numeric',
				position: 'left',
				fields: ['value'],
				minimum: 0,
				style: {stroke: 'white'},
				label: {
					color: 'white'
				}
			}, {
				type: 'category',
				position: 'bottom',
				fields: ['text'],
				style: {stroke: 'white'},
				label: {
					color: 'white',
					rotate: {degrees: 315}
				},
				renderer: function (text, object, index) {
					return text;
				}
			}],

			series: [{
				type: 'bar',
				xField: 'text',
				yField: 'value',
				colors: this.gradients,
				style: {
					minGapWidth: 20,
					maxBarWidth: 200
				},
				label: {
					display: 'insideEnd',
					field: 'percent',
					color: '#fff',
					orientation: 'horizontal',
					renderer: function (text) {
						return text + "%";
					}
				},
				renderer: function (sprite, config, rendererData, i) {
					var panel, gradient,
						data = rendererData.store.getData().getAt(i).getData();
					
					if(data.text === Messages.ABSTENTION) {
						return { fill: me.abstentionGradient };
					} 
					
					return rendererData = {
						fill: me.gradients[i % me.gradients.length]
					};
				}
			}]
		});

		this.add([this.toolbar, this.questionChart]);
		this.on('activate', this.getQuestionAnswers);
	},
	
	setGradients: function (promise) {
		if (this.toggleCorrect) {
			this.gradients = this.correctAnswerGradients;
		} else {
			this.gradients = this.defaultGradients;
		}
	},
	
	initializeCorrectAnswerGradients: function() {
		this.correctAnswerGradients = [];
		
		for (var i = 0; i < this.questionObj.possibleAnswers.length; i++) {
			question = this.questionObj.possibleAnswers[i];

			if ((question.data && !question.data.correct) || (!question.data && !question.correct)) {
				this.correctAnswerGradients.push(
					Ext.create('Ext.draw.gradient.Linear', {
						degrees: 90,
						stops: [
							{offset: 0, color: 'rgb(212, 40, 40)'},
							{offset: 100, color: 'rgb(117, 14, 14)'}
						]
					})
				);
			} else {
				this.correctAnswerGradients.push(
					Ext.create('Ext.draw.gradient.Linear', {
						degrees: 90,
						stops: [
							{offset: 0, color: 'rgb(43, 221, 115)'},
							{offset: 100, color: 'rgb(14, 117, 56)'}
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
					{offset: 0, color: 'rgb(128, 21, 21)'},
					{offset: 100, color: 'rgb(88, 0, 0)'}
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
					{offset: 0, color: 'rgb(4, 88, 34)'},
					{offset: 100, color: 'rgb(2, 62, 31)'}
				]
			})
		];
	},

	getQuestionAnswers: function () { 
		var panel = this;
		var chart = panel.questionChart;
		var store = chart.getStore();

		var answers = panel.questionObj.possibleAnswers;

		var sum = 0;
		var maxValue = 10;

		var tmpPossibleAnswers = [];
		for (var i = 0; i < tmpPossibleAnswers.length; i++) {
			var el = tmpPossibleAnswers[i];
			var record = store.findRecord('text', el, 0, false, true, true);
			record.set('value', 0);
		}

		for (var i = 0; i < panel.questionObj.possibleAnswers.length; i++) {
			var el = panel.questionObj.possibleAnswers[i];
			if (el.data)
				tmpPossibleAnswers.push(el.data.text);
			else
				tmpPossibleAnswers.push(el.text);
		}

		var mcAnswerCount = [];
		var abstentionCount = 0;
		for (var i = 0, el; el = answers[i]; i++) {
			if (panel.questionObj.questionType === "mc") {
				if (!el.answerText) {
					abstentionCount = el.abstentionCount;
					continue;
				}
				var values = el.answerText.split(",").map(function (answered) {
					return parseInt(answered, 10);
				});
				if (values.length !== panel.questionObj.possibleAnswers.length) {
					return;
				}

				for (var j = 0; j < el.answerCount; j++) {
					values.forEach(function (selected, index) {
						if (typeof mcAnswerCount[index] === "undefined") {
							mcAnswerCount[index] = 0;
						}
						if (selected === 1) {
							mcAnswerCount[index] += 1;
						}
					});
				}
				store.each(function (record, index) {
					record.set("value", mcAnswerCount[index]);
				});
			} else {
				if (!el.answerText) {
					abstentionCount = el.abstentionCount;
					continue;
				}
				var record = store.findRecord('text', el.answerText, 0, false, true, true); // exact match
				record.set('value', el.answerCount);
			}
			sum += el.answerCount;

			if (el.answerCount > maxValue) {
				maxValue = Math.ceil(el.answerCount / 10) * 10;
			}

			var idx = tmpPossibleAnswers.indexOf(el.answerText); // Find the index
			if (idx != -1) tmpPossibleAnswers.splice(idx, 1); // Remove it if really found!
		}
		if (abstentionCount) {
			var record = store.findRecord('text', Messages.ABSTENTION, 0, false, true, true); // exact match
			if (!record) {
				store.add({text: Messages.ABSTENTION, value: abstentionCount});
			} else if (record.get('value') != abstentionCount) {
				record.set('value', abstentionCount);
			}
		}

		// Calculate percentages
		var totalResults = store.sum('value');
		store.each(function (record) {
			var percent = Math.round((record.get('value') / totalResults) * 100);
			record.set('percent', percent);
		});
		chart.getAxes()[0].setMaximum(maxValue);

		// renew the chart-data
		chart.redraw();
	}
});
