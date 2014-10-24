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
		numberOfDots: 0,
	},
	
	/**
	 * Constructor.
	 * 
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function() {
		this.callParent(arguments);
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
	 * Resets all necessary variables of the GridContainer.
	 */
	clearConfigs: function() {
		this.callParent(arguments);
	},
	
	/**
	 * generates the statistic output.
	 */
	generateStatisticOutput: function (tilesToFill, colorTiles, displayType, weakenSourceImage) {
		// TODO implementieren
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
		if (typeof(config.description) != "undefined") this.setDescription(config.description);
		
		this.callParent(arguments);
	}	
});