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

Ext.define('ARSnova.view.components.GridStatistic', {
	extend: 'Ext.Panel',

	require: ['ARSnova.view.components.GridImageContainer'],

	config: {
		questionObj: null,
		style: 'margin-bottom: 0px'
	},

	grid: null,
	gridWeakenImageToggle: null,
	gridShowColors: null,
	gridShowNumbers: null,
	questionOptionsSegment: null,
	abstentionPanel: null,
	optionsFieldSet: null,
	answers: [],

	/**
	 * Constructor.
	 *
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function () {
		this.callParent(arguments);
		this.setStyle(this.config.style);

		var me = this;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var showShortLabels = screenWidth < 480;

		var relItemAbsolut = {
			text: showShortLabels ?
				Messages.GRID_LABEL_ABSOLUTE_SHORT :
				Messages.GRID_LABEL_ABSOLUTE,
			labelWidth: '100%',
			flex: 1,
			scope: this,
			handler: function () {
				this.updateGrid();
			}
		};

		var relItemRelative = {
			text: showShortLabels ?
				Messages.GRID_LABEL_RELATIVE_SHORT :
				Messages.GRID_LABEL_RELATIVE,
			labelWidth: '100%',
			flex: 1,
			scope: this,
			handler: function () {
				this.updateGrid();
			}
		};

		var relItemNone = {
			text: showShortLabels ?
				Messages.GRID_LABEL_NONE_SHORT :
				Messages.GRID_LABEL_NONE,
			labelWidth: '100%',
			flex: 1,
			scope: this,
			handler: function () {
				this.updateGrid();
			}
		};

		if (this.getQuestionObj().gridType === "moderation") {
			this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
				docked: 'top',
				editable: false
			});
		} else {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				docked: 'top',
				editable: false
			});
		}

		this.releaseItems = [
			relItemAbsolut,
			relItemRelative,
			relItemNone
		];

		relItemNone.pressed = true;

		this.gridWeakenImageToggle = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			cls: 'actionButton',
			text: Messages.GRID_LABEL_WEAKEN_IMAGE,
			toggleConfig: {
				scope: this,
				label: false,
				value: false,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						this.updateGrid();
					}
				}
			}
		});

		this.gridShowColors = Ext.create('ARSnova.view.MatrixButton', {
			buttonConfig: 'togglefield',
			cls: 'actionButton',
			text: Messages.GRID_LABEL_SHOW_HEATMAP,
			toggleConfig: {
				scope: this,
				label: false,
				value: true,
				listeners: {
					scope: this,
					change: function (toggle, newValue, oldValue, eOpts) {
						this.updateGrid();
					}
				}
			}
		});

		this.abstentionLabel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			hidden: true,
			items: {
				cls: 'gravure',
				html: Messages.ABSTENTIONS
			}
		});

		this.questionOptionsSegment = Ext.create('Ext.SegmentedButton', {
			layout: {
				type: 'hbox',
				pack: 'center',
				align: 'stretchmax'
			},
			defaults: {
				ui: 'action'
			},
			allowDepress: false,
			items: this.releaseItems,
			cls: 'abcOptions'
		});

		this.gridShowNumbers = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				style: 'margin: 0',
				title: Messages.GRID_LABEL_SHOW_PERCENT,
				items: [this.questionOptionsSegment]
			}]
		});

		this.options = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			style: {
				marginBottom: '30px'
			}
		});

		this.optionButtons = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset',
			items: [this.gridShowNumbers, this.abstentionLabel]
		});

		this.options.add([
			this.gridShowColors,
			this.gridWeakenImageToggle
		]);

		// add components to panel
		this.add(this.grid);
		this.add({
			xtype: 'spacer',
			height: 25,
			docked: 'top'
		});
		this.add(this.optionButtons);
		this.add(this.options);

		// everything is created, now lets update the gridImageContainer
		this.updateGrid();
	},

	updateGrid: function () {
		var questionObj = this.getQuestionObj();
		var me = this;

		if (typeof questionObj === "undefined" || typeof questionObj.image === "undefined") {
			console.log("Error: no question object provided.");
			return;
		}

		this.grid.setGridSize(questionObj.gridSize);
		this.grid.setOffsetX(questionObj.offsetX);
		this.grid.setOffsetY(questionObj.offsetY);
		this.grid.setZoomLvl(questionObj.zoomLvl);

		var afterImageSet = function () {
			var gridAnswers = [];
			var abstentionCount = 0;
			var questionObj = me.getQuestionObj();

			if (questionObj.showAnswer || questionObj.userAnswered == null) {
				// Output WITH correct answers
				me.grid.update(questionObj, true);
			} else {
				// output withOUT correct answers
				me.grid.update(questionObj, false);
			}

			// parse answers
			for (var i = 0; i < me.answers.length; i++) {
				var el = me.answers[i];
				if (!el.answerText) {
					me.abstentionLabel.getInnerItems()[0].setHtml(Messages.ABSTENTIONS + ": " + el.abstentionCount);

					if (el.abstentionCount > 0) {
						me.abstentionLabel.show();
					}
					continue;
				}

				var values = el.answerText.split(",");

				for (var j = 0; j < el.answerCount; j++) {
					values.forEach(function (selected, index) {
						if (typeof gridAnswers[values[index]] === "undefined") {
							gridAnswers[values[index]] = 1;
						} else {
							gridAnswers[values[index]] += 1;
						}
					});
				}
			}

			var showColors = false;
			var weakenImage = false;

			showColors = me.gridShowColors.getToggleFieldValue();
			weakenImage = me.gridWeakenImageToggle.getToggleFieldValue();

			// generate output
			me.grid.generateStatisticOutput(gridAnswers, showColors,
				me.questionOptionsSegment.getPressedButtons()[0].getText(),
				weakenImage);
		};

		if (this.config.questionObj.image && this.config.questionObj.image !== 'true') {
			this.grid.setImage(this.config.questionObj.image, false, afterImageSet);
		}
	}
});
