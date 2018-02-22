/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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
		highlightColor: '#f2a900', // Color of the highlighted fields.
		numberOfDots: 1,
		gridType: 'moderation',
		gridIsHidden: true,
		strokeColor: '#ffffff'
	},

	/**
	 * Constructor.
	 *
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function (config) {
		this.callParent(arguments);
	},

	/**
	 * Checks if there are fields left to be clicked.
	 */
	calculateFieldsLeft: function () {
		var numChosenFields = this.getChosenFields().length;

		return numChosenFields < this.getNumberOfDots();
	},

	/**
	 * Marks all chosen fields.
	 */
	markChosenFields: function () {
		var thiz = this;
		this.getChosenFields().forEach(
				function (entry) {
					thiz.markField(entry[0],
					entry[1], thiz.getHighlightColor(), 1.0);
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

		// draw circle
		var centerX = koord[0] + width / 2;
		var centerY = koord[1] + width / 2;
		var radius = width / 2.75;

		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();

		ctx.lineWidth = 1;
		ctx.strokeStyle = this.getStrokeColor();
		ctx.stroke();
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
	clearConfigs: function () {
		this.callParent(arguments);
		this.setGridIsHidden(true);
	},

	/**
	 * generates the statistic output.
	 */
	generateStatisticOutput: function (tilesToFill, colorTiles, displayType, weakenSourceImage) {
		var key, row, column;
		// clear canvas
		if (weakenSourceImage) {
			this.redrawWithAlpha(0.2, false);
		} else {
			this.redrawWithAlpha(1, false);
		}

		// count answers
		var totalAnswers = 0;
		for (key in tilesToFill) {
			if (tilesToFill.hasOwnProperty(key)) {
				totalAnswers += tilesToFill[key];
			}
		}

		// pre-iterate through answers to get min and max value, used to define the alpha value
		// TODO: find a more elagant way than iterating twice through all tiles.
		var maxVotes = 0;
		var minVotes = 0;
		for (row = 0; row < this.getGridSizeX(); row++) {
			for (column = 0; column < this.getGridSizeY(); column++) {
				key = row + ";" + column;
				if (tilesToFill[key] !== undefined) {
					if (tilesToFill[key] > maxVotes) {
						maxVotes = tilesToFill[key];
						if (minVotes === 0) {
							minVotes = maxVotes;
						}
					}
					minVotes = (tilesToFill[key] > 0 && tilesToFill[key] < minVotes) ? tilesToFill[key] : minVotes;
				}
			}
		}

		for (row = 0; row < this.getGridSizeX(); row++) {
			for (column = 0; column < this.getGridSizeY(); column++) {
				key = row + ";" + column;
				var coords = this.getChosenFieldFromPossibleAnswer(key);

				if (colorTiles) {
					var alphaOffset = this.getHeatmapMinAlpha();
					var alphaScale = this.getHeatmapMaxAlpha() - this.getHeatmapMinAlpha();
					var alpha = 0;

					if (tilesToFill[key] !== undefined) {
						if (maxVotes === minVotes) {
							alpha = this.getHeatmapMaxAlpha();
						} else if (tilesToFill[key] === 0) {
							alpha = 0;
						} else {
							alpha = this.getHeatmapMinAlpha() + (((this.getHeatmapMaxAlpha() - this.getHeatmapMinAlpha()) / (maxVotes - minVotes)) * (tilesToFill[key] - minVotes));
						}
					}

					this.markField(coords[0], coords[1], this.getHighlightColor(), alpha);
				} else {
					// mark field
					if (tilesToFill[key] !== undefined) {
						this.markField(coords[0], coords[1], this.getHighlightColor(), 1.0);
					}
				}

				var text;
				if (displayType === Messages.GRID_LABEL_RELATIVE || displayType === Messages.GRID_LABEL_RELATIVE_SHORT) {
					text = (tilesToFill[key] !== undefined) ? Number((tilesToFill[key] / totalAnswers * 100.0).toFixed(1)) : "";
					this.addTextToField(coords[0], coords[1], text);
				} else if (displayType === Messages.GRID_LABEL_ABSOLUTE || displayType === Messages.GRID_LABEL_ABSOLUTE_SHORT) {
					text = (tilesToFill[key] !== undefined) ? tilesToFill[key] : "";
					this.addTextToField(coords[0], coords[1], text);
				}
			}
		}
	},

	generateUserViewWithAnswers: function (userAnswers, correctAnswers) {
		// TODO not necessary because marking the right answers is deactivated for moderation grids
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

	createResult: function () {
		var result = this.callParent(arguments);

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
	setConfig: function (config) {
		if (config.name) {
			this.setName(config.name);
		}
		if (config.description) {
			this.setDescription(config.description);
		}

		this.callParent(arguments);
	},

	updateFromTemplate: function (templateGrid) {
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
	}
});
