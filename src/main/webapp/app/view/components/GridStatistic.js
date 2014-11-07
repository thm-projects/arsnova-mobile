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

Ext.define('ARSnova.view.components.GridStatistic', {
	extend: 'Ext.form.FieldSet',

	require: ['ARSnova.view.components.GridImageContainer'],

	config: {
		questionObj: null,
		cls: 'standardFieldset',
		style: 'margin: 0'
	},

	grid: null,
	gridWeakenImageToggle: null,
	gridShowColors: null,
	gridShowNumbers: null,
	questionOptionsSegment: null,
	abstentionPanel: null,
	optionsFieldSet: null,
	answers: new Array(),

	/**
	 * Constructor.
	 *
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function () {
		this.callParent(arguments);
		// store this for later reference
		var me = this;
		var screenWidth = (window.innerWidth > 0) ?
			window.innerWidth :
			screen.width
		;
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
//			pressed: true,
			handler: function () {
				this.updateGrid();
			}
		};
		
		if (this.getQuestionObj().gridType == "moderation") {
			this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
				docked: 'top',
				editable: false
			});
			
			var relItemHeatmap = {
				text: showShortLabels ? 
					Messages.GRID_LABEL_HEATMAP_SHORT :
					Messages.GRID_LABEL_HEATMAP,
				labelWidth: '100%',
				flex: 1,
				scope: this,
				pressed: true,
				handler: function() {
					this.updateGrid();
				}
			};
			
			this.releaseItems = [
			    relItemHeatmap,
     		    relItemAbsolut,
     			relItemRelative,
     			relItemNone
     		];
			
		} else {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				docked: 'top',
				editable: false
			});
			
			relItemNone.pressed = true;
			
			this.releaseItems = [
     		    relItemAbsolut,
     			relItemRelative,
     			relItemNone
     		];
			
			// add toggles
			this.gridWeakenImageToggle = Ext.create('Ext.field.Toggle', {
				id: "toggleWeakenImage",
				name: "toggleWeakenImage",
				label: Messages.GRID_LABEL_WEAKEN_IMAGE,
				value: false
			});

			this.gridShowColors = Ext.create('Ext.field.Toggle', {
				id: "toggleShowColors",
				name: "toggleShowColors",
				label: Messages.GRID_LABEL_SHOW_HEATMAP,
				value: (this.getQuestionObj().gridType != "moderation")
			});
			
			this.abstentionPanel = Ext.create('Ext.field.Text', {
				id: 'tf_abstenstion',
				name: 'tf_abstenstion',
				value: 0,
				label: Messages.ABSTENTION,
				readOnly: true,
				hidden: true
			});
			
			// set listeners to toggles
			var listeners = {
				beforechange: function (slider, thumb, newValue, oldValue) {
					me.updateGrid();
				},
				change: function (slider, thumb, newValue, oldValue) {
					me.updateGrid();
				}
			};
			this.gridWeakenImageToggle.setListeners(listeners);
			this.gridShowColors.setListeners(listeners);
		}

		this.questionOptionsSegment = Ext.create('Ext.SegmentedButton', {
			layout: {
				type: 'hbox',
				pack: 'center',
				align: 'stretchmax'
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
		
		this.optionsFieldSet = Ext.create('Ext.form.FieldSet', {
			cls: 'standardFieldset gridQDSettingsPanel',
			items: [
				this.gridShowNumbers,
				{
					xtype: 'spacer',
					height: 25
				}				
			]
		});
	
		if (this.getQuestionObj().gridType != 'moderation') {
			this.optionsFieldSet.add(
					[
			this.gridShowColors,
			this.gridWeakenImageToggle,
			this.abstentionPanel
		]
			)
		}
		
		// add components to panel
		this.add(this.grid);
		this.add({
			xtype: 'spacer',
			height: 25,
			docked: 'top'
		});
		this.add(this.optionsFieldSet);

		// everything is created, now lets update the gridImageContainer
		this.updateGrid();
	},

	updateGrid: function () {
		var questionObj = this.getQuestionObj();
		var me = this;

		if (typeof questionObj === "undefined"
				|| typeof questionObj.image === "undefined") {
			console.log("Error: no question object provided.");
			return;
		}

		this.grid.setGridSize(questionObj.gridSize);
		this.grid.setOffsetX(questionObj.offsetX);
		this.grid.setOffsetY(questionObj.offsetY);
		this.grid.setZoomLvl(questionObj.zoomLvl);

		this.grid.setImage(questionObj.image, false, function () {

			if (questionObj.showAnswer || questionObj.userAnswered == null) {
				// Output WITH correct answers
				me.grid.update(questionObj, true);
			} else {
				// output withOUT correct answers
				me.grid.update(questionObj, false);
			}
			var gridAnswers = [];
			var abstentionCount = 0;


			// parse answers

			for (var i = 0; i < me.answers.length; i++) {

				var el = me.answers[i];
				if (!el.answerText) {
					me.abstentionPanel.setValue(el.abstentionCount);

					if (me.abstentionPanel.getValue() > 0)
						me.abstentionPanel.setHidden(false);
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
			
			if (me.getQuestionObj().gridType == 'moderation') {
				showColors = me.questionOptionsSegment.getPressedButtons()[0].getText() == Messages.GRID_LABEL_HEATMAP_SHORT;
			} else {
				showColors = me.gridShowColors.getValue();
				weakenImage = me.gridWeakenImageToggle.getValue();
			}
			
			// generate output
			me.grid.generateStatisticOutput(gridAnswers, showColors,
					me.questionOptionsSegment.getPressedButtons()[0].getText(),
					weakenImage);
		});
	}
});
