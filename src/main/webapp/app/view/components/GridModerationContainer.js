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

Ext.define('ARSnova.view.components.GridModerationContainer', {
	extend: 'ARSnova.view.components.GridContainer',
	
	config: {
		name: "",
		description: "",
		highlightColor: '#FFA500', // Color of the highlighted fields.
		numberOfDots: 1,
		gridType: 'moderation',
		gridIsHidden: true,
	},
	
	/**
	 * Constructor.
	 * 
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function(config) {
		this.callParent(arguments);
	},
	
	/**
	 * Checks if there are fields left to be clicked.
	 */
	calculateFieldsLeft: function() {
		
		var numChosenFields = this.getChosenFields().length;
		
		return numChosenFields < this.getNumberOfDots();
	},
	
	/**
	 * Marks the field by the position parameters.
	 */
	markField: function (x, y, color, alpha) {
		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;

		var width = this.getFieldSize() - this.getGridLineWidth();

		// draw circle
		centerX = koord[0] + width / 2;
		centerY = koord[1] + width / 2;
		radius = width / 2;
		// TODO attribute padding in config mit verrechnen
		
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	},
	
	/**
	 * Updates the GridImageContainer with the given parameters.
	 *
	 * @param questionObj	The questionObj containing all necessary attributes.
	 * @param mark	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	update: function (questionObj, mark) {
		this.callParent(arguments);
		this.setNumberOfDots(questionObj.numberOfDots);
	},
	
	/**
	 * Resets all necessary variables of the GridContainer.
	 */
	clearConfigs: function() {
		this.callParent(arguments);
		this.setGridIsHidden(true);
	},
	
	/**
	 * generates the statistic output.
	 */
	generateStatisticOutput: function (tilesToFill, colorTiles, displayType, weakenSourceImage) {
		
		// clear canvas
		weakenSourceImage ? this.redrawWithAlpha(0.2, false) : this.redrawWithAlpha(1, false);

		// count answers
		var totalAnswers = 0;
		for (var key in tilesToFill) {
			totalAnswers += tilesToFill[key];
		}

		for (var row = 0; row < this.getGridSizeX(); row++) {
			for (var column = 0; column < this.getGridSizeY(); column++) {
				var key = row + ";" + column;
				var coords = this.getChosenFieldFromPossibleAnswer(key);

				// mark field
				if (typeof tilesToFill[key] !== "undefined")
					this.markField(coords[0], coords[1], this.getHighlightColor(), 1.0);
				

				// draw text if needed
				if (displayType == Messages.GRID_LABEL_RELATIVE || displayType == Messages.GRID_LABEL_RELATIVE_SHORT) {
					var text = (typeof tilesToFill[key] !== "undefined") ? Number((tilesToFill[key] / totalAnswers * 100.0).toFixed(1)) + "%" : "";
					this.addTextToField(coords[0], coords[1], text);
				} else if (displayType == Messages.GRID_LABEL_ABSOLUTE || displayType == Messages.GRID_LABEL_ABSOLUTE_SHORT) {
					var text = (typeof tilesToFill[key] !== "undefined") ? tilesToFill[key] : "";
					this.addTextToField(coords[0], coords[1], text);
				}
			}
		}
	},
	
	generateUserViewWithAnswers: function (userAnswers, correctAnswers) {
		// TODO implementieren
	},
	
	/**
	 * Converts the chosen fields of the grid to objects
	 * to be used as possible answers.
	 * 
	 */
	getPossibleAnswersFromChosenFields: function () {
		var values = [], obj;

		for (var i = 0; i < this.getGridSizeX(); i++) {
			for (var j = 0; j < this.getGridSizeY(); j++) {
				obj = {
						text: i + ";" + j,
						correct: false
				};
				// do not use chosenFields as right answers
				values.push(obj);
			}
		}
		return values;
	},
	
	createResult: function() {
		result = this.callParent(arguments);
		
		result.numberOfDots = this.getNumberOfDots();
		
		return result;
	},
	
	/**
	 * Initialies this objects with the information given by the config structure.
	 * Precondition is, that the "imageFile"-Attribute is set. Otherwise no other
	 * options can be set.
	 * The grid container is redrawn after configuration.
	 * 
	 * param config The configuration structure. Attributes have to match gridContainter attibutes.
	 */
	setConfig : function(config) {
		
		if (typeof(config.name) != "undefined") this.setName(config.name);
		if (typeof(config.description) != "undefined"){ this.setDescription(config.description);}
		
		this.callParent(arguments);
	},
	
	updateFromTemplate: function(templateGrid) {
		
		this.setGridSize(templateGrid.getGridSize());
		this.setOffsetX(templateGrid.getOffsetX());
		this.setOffsetY(templateGrid.getOffsetY());
		this.setZoomLvl(templateGrid.getZoomLvl());
		this.setGridOffsetX(templateGrid.getGridOffsetX());
		this.setGridOffsetY(templateGrid.getGridOffsetY());
		this.setGridZoomLvl(templateGrid.getGridZoomLvl());
		this.setGridSizeX(templateGrid.getGridSizeX());
		this.setGridSizeY(templateGrid.getGridSizeY());
		this.setGridIsHidden(templateGrid.getGridIsHidden());
		this.setImgRotation(templateGrid.getImgRotation());
		this.setToggleFieldsLeft(templateGrid.getToggleFieldsLeft());
		this.setNumClickableFields(templateGrid.getNumClickableFields());
		this.setThresholdCorrectAnswers(templateGrid.getThresholdCorrectAnswers());
		this.setCvBackgroundColor(templateGrid.getCvBackgroundColor());
		this.setCvIsColored(templateGrid.getCvIsColored());
		this.setCurGridLineColor(templateGrid.getGridLineColor());
		this.setScaleFactor(templateGrid.getScaleFactor());

		if (this.getGridOffsetX() === undefined) {
			this.setGridOffsetX(0);
		}

		if (this.getGridOffsetY() === undefined) {
			this.setGridOffsetY(0);
		}

		// change background color itself if necessary
		this.colorBackground();

		this.initZoom();
		this.initGridZoom();
	},
});