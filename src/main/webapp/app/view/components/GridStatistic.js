/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel für die Frageform: Planquadrat
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/

Ext.define('ARSnova.view.components.GridStatistic', {
	extend : 'Ext.form.FieldSet',

	require : [ 'ARSnova.view.components.GridContainer' ],

	config : {
		questionObj : null,
		cls : 'standardFieldset',
		style : 'margin: 0'
	},

	grid : null,
	gridWeakenImageToggle : null,
	gridShowColors : null,
	gridShowNumbers : null,
	gridColorsToggle : null,
	questionOptionsSegment : null,
	abstentionPanel : null,
	optionsFieldSet : null,
	answers : new Array(),

	
	/**
	 * Constructor.
	 * 
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor : function() {
		this.callParent(arguments);
		// store this for later reference
		var me = this;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth
				: screen.width;
		var showShortLabels = screenWidth < 480;

		// create toggles
		this.grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked : 'top',
			editable : false
		});

		// add toggles
		this.gridWeakenImageToggle = Ext.create('Ext.field.Toggle', {
			id : "toggleWeakenImage",
			name : "toggleWeakenImage",
			label : Messages.GRID_LABEL_WEAKEN_IMAGE,
			value : false
		});

		this.gridShowColors = Ext.create('Ext.field.Toggle', {
			id : "toggleShowColors",
			name : "toggleShowColors",
			label : Messages.GRID_LABEL_SHOW_HEATMAP,
			value : true
		});

		this.releaseItems = [
		          {
					text : showShortLabels ? Messages.GRID_LABEL_ABSOLUTE_SHORT
							: Messages.GRID_LABEL_ABSOLUTE,
					scope : this,
					handler : function() {
						this.updateGrid();
					}
				},
				{
					text : showShortLabels ? Messages.GRID_LABEL_RELATIVE_SHORT
							: Messages.GRID_LABEL_RELATIVE,
					scope : this,
					handler : function() {
						this.updateGrid();
					}
				},
				{
					text : showShortLabels ? Messages.GRID_LABEL_NONE_SHORT
							: Messages.GRID_LABEL_NONE,
					scope : this,
					pressed : true,
					handler : function() {
						this.updateGrid();
					}
				} ];

		this.questionOptionsSegment = Ext.create('Ext.SegmentedButton', {
			allowDepress : false,
			items : this.releaseItems,
			cls : 'abcOptions'
		});

		this.gridShowNumbers = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			items : [ {
				xtype : 'fieldset',
				style : 'margin: 0',
				title : Messages.GRID_LABEL_SHOW_PERCENT,
				items : [ this.questionOptionsSegment ]
			} ]
		});

		this.gridColorsToggle = Ext.create('Ext.field.Toggle', {
			id : "toggleColors",
			name : "toggleColors",
			label : Messages.GRID_LABEL_INVERT_GRIDCOLORS,
			value : false
		});

		this.abstentionPanel = Ext.create('Ext.field.Text', {
			id : 'tf_abstenstion',
			name : 'tf_abstenstion',
			value : 0,
			label : Messages.ABSTENTION,
			readOnly : true,
			hidden:		true
		});

		this.optionsFieldSet = Ext.create('Ext.form.FieldSet', {
			cls : 'standardFieldset gridQDSettingsPanel',
			items : [ this.gridShowNumbers,
			          {
							xtype : 'spacer',
							height : 25
					  },
			          this.gridShowColors,
			          this.gridColorsToggle,
			          this.gridWeakenImageToggle,
			          this.abstentionPanel			          
					]
		});

		// set listeners to toggles
		var listeners = {
			beforechange : function(slider, thumb, newValue, oldValue) {
				me.updateGrid();
			},
			change : function(slider, thumb, newValue, oldValue) {
				me.updateGrid();
			}
		};
		this.gridWeakenImageToggle.setListeners(listeners);
		this.gridShowColors.setListeners(listeners);
		this.gridColorsToggle.setListeners(listeners);

		// add components to panel
		this.add(this.grid);
		this.add({
			xtype : 'spacer',
			height : 25,
			docked : 'top'
		});
		this.add(this.optionsFieldSet);

		// everythings creates, now lets update the gridContainer
		this.updateGrid();
	},

	updateGrid : function() {
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

		this.grid.setImage(questionObj.image, false, function() {

			if (questionObj.showAnswer || questionObj.userAnswered == null) {

				// Output WITH correct answers
				me.grid.update(questionObj.gridSize, questionObj.offsetX,
						questionObj.offsetY, questionObj.zoomLvl,
						questionObj.gridOffsetX, questionObj.gridOffsetY,
						questionObj.gridZoomLvl, questionObj.gridSizeX, 
						questionObj.gridSizeY, questionObj.gridIsHidden,
						questionObj.imgRotation, questionObj.toggleFieldsLeft, 
						questionObj.numClickableFields, questionObj.thresholdCorrectAnswers,
						questionObj.cvIsColored, questionObj.possibleAnswers, true);
			} else {
				
				// output withOUT correct answers
				me.grid.update(questionObj.gridSize, questionObj.offsetX,
						questionObj.offsetY, questionObj.zoomLvl, 
						questionObj.gridOffsetX, questionObj.gridOffsetY,
						questionObj.gridZoomLvl, questionObj.gridSizeX, 
						questionObj.gridSizeY, questionObj.gridIsHidden,
						questionObj.imgRotation, questionObj.toggleFieldsLeft, 
						questionObj.numClickableFields, questionObj.thresholdCorrectAnswers,
						questionObj.cvIsColored, Array(), true);
			}
			var gridAnswers = [];
			var abstentionCount = 0;


			// parse answers

			for (var i = 0; i < me.answers.length; i++) {

				var el = me.answers[i];
				if (!el.answerText) {
					me.abstentionPanel.setValue(el.abstentionCount);

					if(me.abstentionPanel.getValue() > 0)
						me.abstentionPanel.setHidden(false);
					continue;
				}

				var values = el.answerText.split(",");

				for (var j = 0; j < el.answerCount; j++) {
					values.forEach(function(selected, index) {

						if (typeof gridAnswers[values[index]] === "undefined") {
							gridAnswers[values[index]] = 1;
						} else {
							gridAnswers[values[index]] += 1
						}
					});
				}
			}

			// generate output
			me.grid.generateStatisticOutput(gridAnswers, me.gridShowColors
					.getValue(),
					me.questionOptionsSegment.getPressedButtons()[0].getText(),
					me.gridWeakenImageToggle.getValue(), me.gridColorsToggle
							.getValue());

		});
	}
});
