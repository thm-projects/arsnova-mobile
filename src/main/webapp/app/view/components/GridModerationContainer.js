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
		highlightColor: '#FFA500', // Color of the highlighted fields.
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
});