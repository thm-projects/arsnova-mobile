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
	extend : 'Ext.Container',
	
    require: ['ARSnova.view.components.GridContainer'],
 
	
	config : {
		questionObj : null,
	},
	
	grid 					: null,
	gridWeakenImageToggle 	: null,
	gridShowColors		 	: null,
	gridShowNumbers 		: null,
	gridColorsToggle 		: null,
	answers					: new Array(),

	
	/**
	 * Constructor.
	 * 
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor : function() {
		this.callParent(arguments);
		
		// store this for later reference
		var me = this;
		
		// create toggles
		this.grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked 		: 'top',
			editable	: false
		});

		// add toggles
		this.gridWeakenImageToggle = Ext.create('Ext.field.Toggle', {
			id:			"toggleWeakenImage",
			name:		"toggleWeakenImage",
			label:		"Bild abschwächen", // TODO In Konstanten auslagern
			value: 		true
		});

		this.gridShowColors = Ext.create('Ext.field.Toggle', {
			id:			"toggleShowColors",
			name:		"toggleShowColors",
			label:		"Farben anzeigen", // TODO In Konstanten auslagern
			value:  	true
		});

		this.gridShowNumbers = Ext.create('Ext.field.Toggle', {
			id:			"toggleShowNumbers",
			name:		"toggleShowNumbers",
			label:		"Prozente anzeigen", // TODO In Konstanten auslagern
			value:  	true
		});

		this.gridColorsToggle = Ext.create('Ext.field.Toggle', {
			id:			"toggleColors",
			name:		"toggleColors",
			label:		"Rasterfarbe invertieren", // TODO In Konstanten auslagern
			value:  	false
		});
		
		// set listeners to toggles
		var listeners =  {
		        beforechange: function (slider, thumb, newValue, oldValue) {
		        	me.updateGrid();
		        },
		        change: function (slider, thumb, newValue, oldValue) {
		        	me.updateGrid();
		        }
		};
		this.gridWeakenImageToggle.setListeners(listeners);
		this.gridShowColors.setListeners(listeners);
		this.gridShowNumbers.setListeners(listeners);
		this.gridColorsToggle.setListeners(listeners);
		
		// add components to panel
		this.add(this.grid);
		this.add({xtype : 'spacer', height :25, docked : 'top' });
		this.add(this.gridWeakenImageToggle);
		this.add(this.gridShowColors);
		this.add(this.gridShowNumbers);
		this.add(this.gridColorsToggle);
		
		// everythings creates, now lets update the gridContainer
		this.updateGrid();


		console.log("this");
		console.log(this);

		console.log("this.grid");
		console.log(this.grid);
		
	},

	updateGrid : function() {
		var questionObj = this.getQuestionObj();
		var me = this;
		
		if(typeof questionObj ===  "undefined" || typeof questionObj.image ===  "undefined") {
			console.log("Error: no question object provided.");
			return;
		}
		
		this.grid.setGridSize(questionObj.gridSize);
		this.grid.setOffsetX(questionObj.offsetX);
		this.grid.setOffsetY(questionObj.offsetY);
		this.grid.setZoomLvl(questionObj.zoomLvl);

		this.grid.setImage(questionObj.image, false, function() {
			
			// generate statistic output on load
			me.grid.update(
					questionObj.gridSize, 
					questionObj.offsetX, 
					questionObj.offsetY, 
					questionObj.zoomLvl, 
					questionObj.possibleAnswers, 
					true);
			
			var gridAnswers = [];
			var abstentionCount = 0;
			
			// parse answers
			for (var i = 0; i<me.answers.length; i++) {
				var el = me.answers[i];
				if (!el.answerText) {
					// answer is abstention
					abstentionCount = el.abstentionCount;
					continue;
				}
				
				var values = el.answerText.split(",");

				for (var j=0; j < el.answerCount; j++) {
					values.forEach(function(selected, index) {
						
						if(typeof gridAnswers[values[index]] ===  "undefined") {
							gridAnswers[values[index]] = 1;
						} else {
							gridAnswers[values[index]] += 1
						}
					});
				}
			}

			// generate output
			me.grid.generateStatisticOutput(
					gridAnswers, 
					me.gridShowColors.getValue(), 
					me.gridShowNumbers.getValue(), 
					me.gridWeakenImageToggle.getValue(),
					me.gridColorsToggle.getValue());
		});
	}
});