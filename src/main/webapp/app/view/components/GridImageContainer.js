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

Ext.define('ARSnova.view.components.GridImageContainer', {
	extend: 'ARSnova.view.components.GridContainer',
	
	config: {
		statisticWrongColor: '#FF0000', // Color for wrong fields in statistic.
		statisticRightColor: '#00FF00', // Color for right fields in statistic.
		gridType: 'image',
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
		var numCorrectFields = this.getPossibleAnswers().filter(function isCorrect(e) {
			return e.correct;
		}).length;
		return ((numChosenFields < numCorrectFields) || (numCorrectFields === 0) || this.getToggleFieldsLeft());
	},
	
	/**
	 * Marks all chosen fields.
	 */
	markChosenFields: function () {
		var thiz = this;
		this.getChosenFields().forEach(
				function (entry) {
					thiz.markField(entry[0],
					entry[1], thiz.getHighlightColor(), 0.5);
				});
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

		ctx.fillRect(koord[0], koord[1], width, width);
	},
	
	/**
	 * Updates the GridImageContainer with the given parameters.
	 *
	 * @param questionObj	The questionObj containing all necessary attributes.
	 * @param mark	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	update: function (questionObj, mark) {
		this.callParent(arguments);
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
		var totalAnswers = 0;

		var wrongColor = this.getStatisticWrongColor();
		var rightColor = this.getStatisticRightColor();


		if (this.getChosenFields().length == 0) {
			wrongColor = this.getHighlightColor();
		}

		if (!colorTiles) {
			this.setHighlightColor(rightColor);
		}

		// clear canvas
		weakenSourceImage ? this.redrawWithAlpha(0.2, false) : this.redrawWithAlpha(1, false);

		// count answers
		for (var key in tilesToFill) {
			totalAnswers += tilesToFill[key];
		}

		// pre-iterate through answers to get min and max value, used to define the alpha value
		// TODO: find a more elagant way than iterating twice through all tiles.
		var maxVotes = 0;
		var minVotes = 0;
		for (var row = 0; row < this.getGridSizeX(); row++) {
			for (var column = 0; column < this.getGridSizeY(); column++) {
				var key = row + ";" + column;
				if (typeof tilesToFill[key] !== "undefined") {
					if (tilesToFill[key] > maxVotes) {
						maxVotes = tilesToFill[key];
						if (minVotes == 0) {
							minVotes = maxVotes;
						}
					}
					minVotes = (tilesToFill[key] > 0 && tilesToFill[key] < minVotes) ? tilesToFill[key] : minVotes;
				}
			}
		}

		for (var row = 0; row < this.getGridSizeX(); row++) {
			for (var column = 0; column < this.getGridSizeY(); column++) {
				var key = row + ";" + column;
				var coords = this.getChosenFieldFromPossibleAnswer(key);

				if (colorTiles) {
					var alphaOffset = this.getHeatmapMinAlpha();
					var alphaScale = this.getHeatmapMaxAlpha() - this.getHeatmapMinAlpha();
					var alpha = 0;

					if (typeof tilesToFill[key] !== "undefined") {
						if (maxVotes == minVotes) {
							alpha = this.getHeatmapMaxAlpha();
						} else if (tilesToFill[key] == 0) {
							alpha = 0;
						} else {
							alpha = this.getHeatmapMinAlpha() + (((this.getHeatmapMaxAlpha() - this.getHeatmapMinAlpha())/(maxVotes - minVotes)) * (tilesToFill[key] - minVotes));
						}
					}

					var color = wrongColor;
					for (var i = 0; i < this.getChosenFields().length; i++) {
						if (this.getChosenFields()[i][0] == coords[0] && this.getChosenFields()[i][1] == coords[1]) {
							color = rightColor;
						}
					}

					this.markField(coords[0], coords[1], color, alpha);
				}

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

		var lowAlpha = 0.2;
		var highAlpha = 0.9;

		for (var row = 0; row < this.getGridSizeX(); row++) {
			for (var column = 0; column < this.getGridSizeY(); column++) {

				var i = row * this.getGridSizeY() + column;
				var color = correctAnswers[i] ? this.getStatisticRightColor() : this.getStatisticWrongColor();
				var alpha = userAnswers[i] ? highAlpha : lowAlpha;


				this.markField(row, column, color, alpha);

			}
		}
	},
	
	/**
	 * Converts the chosen fields of the grid to objects
	 * to be used as possible answers.
	 */
	getPossibleAnswersFromChosenFields: function () {
		var values = [], obj;

		for (var i = 0; i < this.getGridSizeX(); i++) {
			for (var j = 0; j < this.getGridSizeY(); j++) {
				obj = {
						text: i + ";" + j,
						correct: false
				};
				// use chosenFields as right answers
				for (var k = 0; k < this.getChosenFields().length; k++) {
					var currentField = this.getChosenFields()[k];
					if (currentField[0] == i && currentField[1] == j) {
						obj.correct = true;
						break;
					}
				}
				values.push(obj);
			}
		}
		return values;
	},
	
	createResult: function() {
		return this.callParent(arguments);
	},
});

