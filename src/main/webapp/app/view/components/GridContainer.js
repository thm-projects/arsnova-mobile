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

Ext.define('ARSnova.view.components.GridContainer', {
	extend: 'Ext.Container',
	xtype: 'canvas',

	config: {
		gridSize: 16, // Sqrt of the gridcount
		canvasSize: 400, // Size of the canvas element (width and height).
		initCanvasSize: 400, // Should be same as canvasSize; for later reference.
		canvas: null, // The canvas element.
		imageFile: null, // The image file.
		gridLineWidth: 1, // Width of the grid lines.
		chosenFields: Array(),
		highlightColor: '#FFFF00', // Color of highlighted fields.
		curGridLineColor: '#000000', // Current color of the grid lines.
		gridLineColor: '#000000', // Default color of the grid lines.
		alternativeGridLineColor: '#FFFFFF', // Alternative color of the grid lines.
		scaleFactor: 1.2, // Zoom level scale factor.
		scale: 1.0, // Actual scaling for the image. Necessary to switch between scale for zoomed image an normal scale.
		zoomLvl: 0, // Current zoomlevel.
		offsetX: 0, // Current offset in x direction.
		offsetY: 0, // Current offset in y direction.
		moveInterval: 10, // Steps to take when moving the image (in pixel).
		onFieldClick: null, // Hook for function, that will be called after onClick event.
		editable: true, // If set to false click events are prevented.
		possibleAnswers: [], // The pre-set, correct answers of the lecturer
		heatmapMaxAlpha: 0.9, // The alpha value of a field with 100% of votes.
		heatmapMinAlpha: 0.2, // The alpha value of a field with 0% of votes.
		gridOffsetX: 0, // current x offset for grid start point
		gridOffsetY: 0, // current y offset for grid start point
		gridZoomLvl: 0, // zoom level for grid (defines size of grid fields)
		gridSizeX: 16, // number of horizontal grid fields
		gridSizeY: 16, // number of vertical grid fields
		gridIsHidden: false, // flag for visual hiding of the grid
		gridScale: 1.0, // Current scale for the grid.
		imgRotation: 0, // Current rotation for the image.
		toggleFieldsLeft: false, // toggle the number of clickable fields. true: all fields are clickable, false: only the number of fields the lecturer has selected are clickable
		numClickableFields: 0, // number of clickable fields the lecturer has chosen
		thresholdCorrectAnswers: 0, // the points needed to answer the question correct
		cvBackgroundColor: '#FFFFFF', // background color of the canvas element
		cvIsColored: false // true if the canvas background is colored (cvBackgroundColor), false otherwise. This way older questions without this attribute should still have a transparent background
	},

	/**
	 * Constructor.
	 *
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor: function () {
		this.callParent(arguments);

		// set canvas size depending on screen size
		var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var extraPadding = 40;
		var canvasSize = (width < 400 + extraPadding) ? width - extraPadding : 400;
		this.setCanvasSize(canvasSize);

		var canvas = document.createElement('canvas');
		canvas.id = 'canvasWrapper';
		canvas.width = this.getCanvasSize();
		canvas.height = this.getCanvasSize();
		canvas.style.display = 'block';
		canvas.style.margin = '0 auto';

		canvas.addEventListener("mouseup", this.onclick, false);
		canvas.parentContainer = this;
		this.setCanvas(canvas);

		this.image = {
			xtype: 'panel',
			cls: null,
			html: canvas
		};

		//this.initGridZoom();

		this.add([this.image]);
	},

	/**
	 * Redraws the whole canvas element with default alpha value and marks the chosen fields.
	 */
	redraw: function () {
		
		
		this.redrawWithAlpha(1.0, true);
	},

	/**
	 * Redraws the whole canvas element.
	 *
	 * @param double	alpha				The alpha value of the field color.
	 * @param boolean	markChosenFields	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	redrawWithAlpha: function (alpha, markChosenFields) {
		var ctx = this.getCanvas().getContext('2d');
		// save context
		ctx.save();

		ctx.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);

		this.zoom(this.getScale());

		ctx.globalAlpha = alpha;

		/*
		 * Translate the image to x- and y-axis position for start (minus the half of the image (for rotating!!))
		 * source: http://creativejs.com/2012/01/day-10-drawing-rotated-images-into-canvas/
		 */
		ctx.translate(this.getOffsetX()+(this.getImageFile().width / 2), this.getOffsetY() + (this.getImageFile().height / 2));

		/*
		 * rotates the image in 90� steps clockwise. Steps are in the variable imgRotation
		 */
		ctx.rotate(90 * this.getImgRotation() * Math.PI / 180);

		if (this.getImageFile().src.lastIndexOf("http", 0) === 0) { // image is load from url
			// have to be the negative half of width and height of the image for translation to get a fix rotation point in the middle of the image!!!
			ctx.drawImage(this.getImageFile(), -(this.getImageFile().width / 2), -(this.getImageFile().height / 2));
		} else {
			// draw image avoiding ios 6/7 squash bug
			this.drawImageIOSFix(
				ctx,
				this.getImageFile(),
				-(this.getImageFile().width / 2), -(this.getImageFile().height / 2),
				this.getImageFile().width, this.getImageFile().height);
		}

		// restore context to draw grid with default scale
		ctx.restore();

		if (markChosenFields) {
			this.markChosenFields();
		}

		if (!this.getGridIsHidden()) {
			this.createGrid();
		}

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
	 * Get field position of the given coordinates relative to the grid.
	 *
	 * @param x		The x-coordinate of the position.
	 * @param y		The y-coordinate of the position.
	 */
	getFieldPosition: function (x, y) {
		var canvas = this.getCanvas();

		x -= canvas.getBoundingClientRect().left;
		x -= this.getRelativeLength(this.getGridOffsetX(), false);

		y -= canvas.getBoundingClientRect().top;
		y -= this.getRelativeLength(this.getGridOffsetY(), false);

		if (x < 0 || y < 0) {
			return null;
		}

		var xGrid = parseInt(x / this.getFieldSize());
		var yGrid = parseInt(y / this.getFieldSize());

		if (xGrid >= this.getGridSizeX() || yGrid >= this.getGridSizeY()) {
			return null;
		}

		return new Array(xGrid, yGrid);
	},

	/**
	 * Gets the relative start coordinates of a field by its position parameters.
	 *
	 * @param int	x	The fields x-coordinate.
	 * @param int	y	The fields y-coordinate.
	 */
	getFieldKoord: function (x, y) {
		var x1 = x * this.getFieldSize() +  this.getGridLineWidth();
		var y1 = y * this.getFieldSize() +  this.getGridLineWidth();

		x1 += this.getRelativeLength(this.getGridOffsetX(), false);
		y1 += this.getRelativeLength(this.getGridOffsetY(), false);

		return new Array(x1, y1);
	},

	/**
	 * Gets the field size relative to the size of the canvas element and the current grid scaling.
	 *
	 * @return	int		The field size.
	 */
	getFieldSize: function () {
		return ((this.getCanvasSize() - 2 * this.getGridLineWidth())
				/ this.getGridSize()) * this.getGridScale();
	},

	/**
	 * Gets the canvas size relative to the current grid scaling.
	 *
	 * @return	int		The relative canvas size.
	 */
	getRelativeCanvasSize: function () {
		return this.getCanvasSize() * this.getGridScale();
	},

	/**
	 * Converts a length to a canvas relative length. This function is needed due to
	 * the fact, that on small displays the canvas itself is displayed smaller.
	 * The usage of this function ensures correct positioning.
	 */
	getRelativeLength: function (n, reverse) {
		var f = reverse ? (this.getInitCanvasSize() / this.getCanvasSize()) : (this.getCanvasSize() / this.getInitCanvasSize());
		return n * f;
	},

	/**
	 * Draws the grid in the canvas element.
	 */
	createGrid: function () {

		if ((this.getGridSizeX() * this.getGridSizeY()) == 0)
			return;

		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 1;
		ctx.fillStyle = this.getCurGridLineColor();

		var fieldsize = this.getFieldSize();

		// all horizontal lines
		for (var i = 0; i <= this.getGridSizeY(); i++) {
			ctx.fillRect(
					this.getRelativeLength(this.getGridOffsetX(), false),
					this.getRelativeLength(this.getGridOffsetY(), false)  + i * fieldsize,
					fieldsize * this.getGridSizeX(),
					this.getGridLineWidth());
		}


		// all vertical lines
		for (var i = 0; i <= this.getGridSizeX(); i++) {
			ctx.fillRect(
					this.getRelativeLength(this.getGridOffsetX(), false) + i * fieldsize,
					this.getRelativeLength(this.getGridOffsetY(), false),
					this.getGridLineWidth(),
					fieldsize * this.getGridSizeY());
		}

	},

	/**
	 * Marks the field by the position parameters.
	 */
	markField: function (x, y, color, alpha) {
		// TODO mark as abstract method
	},


	/**
	 * Draws the given text in the field by the specified coordinates.
	 *
	 * @param int		x		The x-coordinate of the field.
	 * @param int		y		The y-coordinate of the field.
	 * @param String	text	The text to display in the field.
	 */
	addTextToField: function (x, y, text) {
		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);

		// calculate exact starting point
		var startX = koord[0] + this.getFieldSize() / 2 - this.getGridLineWidth();
		var startY = koord[1] + this.getFieldSize() / 2 - this.getGridLineWidth();

		ctx.save();

		// set font layout
		ctx.globalAlpha = 1;
		ctx.fillStyle = this.getCurGridLineColor();
		ctx.font = this.getFontForGridSize(this.getGridSize());
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		// draw text
		ctx.fillText(text, startX, startY);

		ctx.restore();
	},

	/**
	 * Gets the font size relative to the size of the grid.
	 *
	 * @param	int gridsize	The gridsize specifying the number of fields.
	 *
	 *  @return	String	The String information of the font size.
	 */
	getFontForGridSize: function (gridsize) {
		if (gridsize >= 14) {
			return "6pt bold";
		} else if (gridsize >= 12) {
			return "7pt bold";
		}  else if (gridsize >= 9) {
			return "10pt bold";
		} else {
			return "12pt bold";
		}
	},
	
	/**
	 * Checks if there are fields left to be clicked.
	 */
	calculateFieldsLeft: function() {
		// TODO make abstract method
	},

	/**
	 * Handles mouse click events on the canvas element.
	 *
	 * @param event		The mouse click event.
	 */
	onclick: function (event) {

		var container = this.parentContainer;
		
		if (! container.getEditable()) {
			// click prevention for non-editable grids
			return;
		}

		// get field position of the mouse click relative to the grid.
		var x = event.clientX;
		var y = event.clientY;
		var position = container.getFieldPosition(x, y);

		if (position == null) {
			return;
		}

		// calculate index
		var index = -1;
		var fields = container.getChosenFields();
		for (var i = 0; i < fields.length; i++) {
			if (fields[i][0] == position[0]
					&& fields[i][1] == position[1]) {
				index = i;
				break;
			}
		}

		// either allow the maximum of correct fields, or allow all fields to be clicked if no correct answers are present
		var fieldsLeft = container.calculateFieldsLeft();
		var changed = false;
		if (index > -1) {
			container.getChosenFields().splice(index, 1);
			changed = true;
		} else if ((container.getGridSizeX()
				* container.getGridSizeY() > container
				.getChosenFields().length) && fieldsLeft) {
			container.getChosenFields().push(position);
			changed = true;
		}

		// redraw on changed
		if (changed) {
			container.redraw();
		}

		if (container.getOnFieldClick() != null) {
			container.getOnFieldClick()(
					container.getChosenFields().length);
		}
	},

	/**
	 * Updates the GridContainer with the given parameters.
	 *
	 * @param questionObj	The questionObj containing all necessary attributes.
	 * @param mark	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	update: function (questionObj, mark) {

		this.setGridSize(questionObj.gridSize);
		this.setOffsetX(questionObj.offsetX);
		this.setOffsetY(questionObj.offsetY);
		this.setZoomLvl(questionObj.zoomLvl);
		this.setGridOffsetX(questionObj.gridOffsetX);
		this.setGridOffsetY(questionObj.gridOffsetY);
		this.setGridZoomLvl(questionObj.gridZoomLvl);
		this.setGridSizeX(questionObj.gridSizeX);
		this.setGridSizeY(questionObj.gridSizeY);
		this.setGridIsHidden(questionObj.gridIsHidden);
		this.setImgRotation(questionObj.imgRotation);
		this.setToggleFieldsLeft(questionObj.toggleFieldsLeft);
		this.setNumClickableFields(questionObj.numClickableFields);
		this.setThresholdCorrectAnswers(questionObj.thresholdCorrectAnswers);
		this.setCvIsColored(questionObj.cvIsColored);
		this.setCurGridLineColor(questionObj.gridLineColor);

		// converting from old version
		if (questionObj.gridSize != undefined && questionObj.gridSize > 0) {

			if (questionObj.gridSizeX === undefined || questionObj.gridSizeX === 0) {
				this.setGridSizeX(questionObj.gridSize);
			}

			if (questionObj.gridSizeY === undefined || questionObj.gridSizeY === 0) {
				this.setGridSizeY(questionObj.gridSize);
			}

		}

		if (this.getGridOffsetX() === undefined) {
			this.setGridOffsetX(0);
		}

		if (this.getGridOffsetY() === undefined) {
			this.setGridOffsetY(0);
		}


		// change background color itself if necessary
		this.colorBackground();


		if (mark) {
			this.getChosenFieldsFromPossibleAnswers(questionObj.possibleAnswers);
		} else {
			this.setChosenFields(new Array());
		}
		this.initZoom();
		this.initGridZoom();
	},

	/**
	 * Sets the gridSize and redraws the canvas element.
	 *
	 * @param int	count		The gridSize to set.
	 */
	setGrids: function (count) {
		this.setChosenFields(Array());
		this.setGridSize(count);

		this.redraw();

		if (this.getOnFieldClick() != null) {
			this.getOnFieldClick()(
					this.getChosenFields().length);
		}
	},

	/**
	 * Moves the image one step in right (positive x) direction.
	 */
	moveRight: function () {
		this.setOffsetX(this.getOffsetX() + this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in left (negative x) direction.
	 */
	moveLeft: function () {
		this.setOffsetX(this.getOffsetX() - this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in up (negative y) direction.
	 */
	moveUp: function () {
		this.setOffsetY(this.getOffsetY() - this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in down (positive y) direction.
	 */
	moveDown: function () {
		this.setOffsetY(this.getOffsetY() + this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Toggles the background of the canvas element.
	 */
	toggleCvBackground: function (colored) {
		this.setCvIsColored(colored);
		this.colorBackground();
	},

	colorBackground: function () {
		if (this.getCvIsColored())
			this.getCanvas().style.backgroundColor = this.getCvBackgroundColor();
		else
			this.getCanvas().style.backgroundColor = 'transparent';
	},

	/**
	 * Initializes the zoom level and scale.
	 */
	initZoom: function () {
		var i;
		this.setScale(1.0);
		if (this.getZoomLvl() > 0) {
			for (i = 0; i < this.getZoomLvl(); i++) {
				this.setScale(this.getScale() * this.getScaleFactor());
			}
		} else if (this.getZoomLvl() < 0) {
			for (i = 0; i > this.getZoomLvl(); i--) {
				this.setScale(this.getScale() / this.getScaleFactor());
			}
		}
	},

	/**
	 * Zooms the image by the given scale level.
	 *
	 * @param long	scale	The scale level of the zoomed image.
	 */
	zoom: function (scale) {
		var ctx = this.getCanvas().getContext("2d");
		var imgSizeHalf = this.getCanvasSize() / 2;

		ctx.translate(imgSizeHalf - (imgSizeHalf * scale), imgSizeHalf - (imgSizeHalf * scale));

		// multiply the current scale with the general scale factor for the image
		// to scale the image in the center of the canvas element.
		scale *= this.getGeneralScaleFactor();
		ctx.scale(scale, scale);
	},

	/**
	 * Gets the general scale factor relative to the image and canvas size to scale the image in the center of the canvas element.
	 */
	getGeneralScaleFactor: function () {
		var image = this.getImageFile();

		if (image.height >= image.width) {
			return (this.getCanvasSize() / image.height);
		} else {
			return (this.getCanvasSize() / image.width);
		}
	},

	/**
	 * Zooms in the image by one step.
	 */
	zoomIn: function () {
		this.setZoomLvl(this.getZoomLvl() + 1);
		this.setScale(this.getScale() * this.getScaleFactor());
		// now redraw the image with the new scale
		this.redraw();
	},

	/**
	 * Zooms out of the image by one step.
	 */
	zoomOut: function () {
		this.setZoomLvl(this.getZoomLvl() - 1);
		this.setScale(this.getScale() / this.getScaleFactor());
		// now redraw the image with the new scale
		this.redraw();
	},

	/**
	 * Initializes the zoom level and scale of the grid.
	 */
	initGridZoom: function () {
		var i;
		this.setGridScale(1.0);
		if (this.getGridZoomLvl() > 0) {
			for (i = 0; i < this.getGridZoomLvl(); i++) {
				this.setGridScale(this.getGridScale() * this.getScaleFactor());
			}
		} else if (this.getGridZoomLvl() < 0) {
			for (i = 0; i > this.getGridZoomLvl(); i--) {
				this.setGridScale(this.getGridScale() / this.getScaleFactor());
			}
		}
	},

	zoomInGrid: function () {
		this.setGridZoomLvl(this.getGridZoomLvl() + 1);
		this.setGridScale(this.getGridScale() * this.getScaleFactor());
		// TODO Zoom muss noch zentriert werden

		this.redraw();
	},

	zoomOutGrid: function () {
		this.setGridZoomLvl(this.getGridZoomLvl() - 1);
		this.setGridScale(this.getGridScale() / this.getScaleFactor());
		// TODO Zoom muss noch zentriert werden

		this.redraw();
	},

	/**
	 * Moves the grid one step in right (positive x) direction.
	 */
	moveGridRight: function () {
		this.setGridOffsetX(this.getGridOffsetX() + this.getRelativeLength(this.getMoveInterval() / this.getGridScale()));
		this.redraw();
	},

	/**
	 * Moves the grid one step in left (negative x) direction.
	 */
	moveGridLeft: function () {
		this.setGridOffsetX(this.getGridOffsetX() - this.getRelativeLength(this.getMoveInterval() / this.getGridScale()));
		this.redraw();
	},

	/**
	 * Moves the grid one step in up (negative y) direction.
	 */
	moveGridUp: function () {
		this.setGridOffsetY(this.getGridOffsetY() - this.getRelativeLength(this.getMoveInterval() / this.getGridScale()));
		this.redraw();
	},

	/**
	 * Moves the grid one step in down (positive y) direction.
	 */
	moveGridDown: function () {
		this.setGridOffsetY(this.getGridOffsetY() + this.getRelativeLength(this.getMoveInterval() / this.getGridScale()));
		this.redraw();
	},

	/**
	 * Sets the image of the canvas element.
	 *
	 * @param		dataUrl			The url specifiyng the source of the image file.
	 * @param bool	reload			<code>true</code> if the image should be reloaded, <code>false</code> otherwise.
	 * @param fn	successCallback	Called when it's a valid image that has been loaded
	 * @param fn	failureCallback	Called when it's not a valid image
	 */
	setImage: function (dataUrl, reload, successCallback, failureCallback) {
		var newimage = new Image();
		var container = this;

		newimage.src = dataUrl;

		newimage.onload = function () {
			var cb = successCallback || Ext.emptyFn;
			if (reload) {
				container.clearImage();
			}
			container.setImageFile(newimage);
			container.redraw();
			
			cb();
		};
		newimage.onerror = function () {
			var cb = failureCallback || Ext.emptyFn;
			cb();
		};
	},

	/**
	 * Clears the image and resets all necessary configurations.
	 */
	clearImage: function () {
		var canvas = this.getCanvas();
		this.setGridSize(16);
		this.setImageFile(null);
		this.clearConfigs();

		// clear and redraw canvas
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.createGrid();
	},

	/**
	 * Resets all necessary variables of the GridContainer.
	 */
	clearConfigs: function () {
		this.setScale(1.0);
		this.setOffsetX(0);
		this.setOffsetY(0);
		this.setZoomLvl(0);
		this.setChosenFields(Array());
		this.setImgRotation(0);
		this.setGridOffsetX(0);
		this.setGridOffsetY(0);
		this.setGridSizeX(16);
		this.setGridSizeY(16);
		this.setGridScale(1.0);
		this.setGridZoomLvl(0);
		this.setGridIsHidden(false);
		this.setCvIsColored(false);
	},

	/**
	 * Toggles the color of the grid.
	 */
	toggleBorderColor: function () {
		if (this.getCurGridLineColor() == this.getGridLineColor()) {
			this.setCurGridLineColor(this.getAlternativeGridLineColor());
		} else {
			this.setCurGridLineColor(this.getGridLineColor());
		}

		this.redraw();
	},



	/**
	 * Converts the chosen fields of the grid to objects
	 * to be used as possible answers.
	 */
	getPossibleAnswersFromChosenFields: function () {
		// TODO make abstract method
	},

	/**
	 * Converts possible answers to chosen fields (int[][]) to be used
	 * inside the grid container.
	 *
	 * @param Array	possibleAnswers		The Array of possible answers to convert.
	 */
	getChosenFieldsFromPossibleAnswers: function (possibleAnswers) {
		var chosenFields = Array();
		for (var i = 0; i < possibleAnswers.length; i++) {
			if (possibleAnswers[i].correct) {
				chosenFields.push(this.getChosenFieldFromPossibleAnswer(possibleAnswers[i].text));
			}
		}

		// set directly to grid
		this.setChosenFields(chosenFields);
	},

	/**
	 * Converts a possibleAnswer message to a chosen field.
	 *
	 * @param  possibleAnswer	The possible answer to convert.
	 */
	getChosenFieldFromPossibleAnswer: function (possibleAnswer) {
		var coords = possibleAnswer.split(";");
		var x = coords[0];
		var y = coords[1];
		return new Array(parseInt(x), parseInt(y));
	},

	/**
	 * generates the statistic output.
	 */
	generateStatisticOutput: function (tilesToFill, colorTiles, displayType, weakenSourceImage) {
		// TODO mark as abstract method
	},

	generateUserViewWithAnswers: function (userAnswers, correctAnswers) {
		// TODO mark as abstract method
	},


	/**
	 * Detecting vertical squash in loaded image.
	 * Fixes a bug which squash image vertically while drawing into canvas for some images.
	 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
	 *
	 */
	detectVerticalSquash: function (img) {
		var iw = img.naturalWidth, ih = img.naturalHeight;
		var canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = ih;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		var data = ctx.getImageData(0, 0, 1, ih).data;
		// search image edge pixel position in case it is squashed vertically.
		var sy = 0;
		var ey = ih;
		var py = ih;
		while (py > sy) {
			var alpha = data[(py - 1) * 4 + 3];
			if (alpha === 0) {
				ey = py;
			} else {
				sy = py;
			}
			py = (ey + sy) >> 1;
		}
		var ratio = (py / ih);
		return (ratio === 0) ? 1 : ratio;
	},

	/**
	 * A replacement for context.drawImage
	 * (args are for source and destination).
	 */
	drawImageIOSFix: function (ctx, img, dx, dy, dw, dh) {
		var vertSquashRatio = this.detectVerticalSquash(img);
		ctx.drawImage(img, dx, dy, dw, dh / vertSquashRatio);
	},

	spinRight: function () {
		this.setImgRotation((this.getImgRotation() + 1) % 4);
		this.redraw();
	},
	
	/**
	 * Initialies this objects with the information given by the config structure.
	 * Precondition is, that the "imageFile"-Attribute is set. Otherwise no other
	 * options can be set.
	 * The grid container is redrawn after configutarion.
	 * 
	 * param config The configuration structure. Attributes have to match gridContainter attibutes.
	 */
	setConfig : function(config) {
		
		if (typeof(config) == "undefined") {
			console.log("Could not set config due to undefined config attribute.");
			return;
		}
		
		this.clearConfigs();
		
		if (typeof(config.imageFile) != "undefined") {
			// TODO: path-prefix to config
			var url = "resources/gridTemplates/" + config.imageFile;
			var me = this;
			this.setImage(url, false, 
					function() {
						// set optional attributes if defined
						if (typeof(config.gridSize) != "undefined") me.setGridSize(config.gridSize);
						if (typeof(config.scaleFactor) != "undefined") me.setScaleFactor(config.scaleFactor);
						if (typeof(config.scale) != "undefined") me.setScale(config.scale);
						if (typeof(config.zoomLvl) != "undefined") me.setZoomLvl(config.zoomLvl);
						if (typeof(config.offsetX) != "undefined") me.setOffsetX(config.offsetX);
						if (typeof(config.offsetY) != "undefined") me.setOffsetY(config.offsetY);
						if (typeof(config.gridOffsetX) != "undefined") me.setGridOffsetX(config.gridOffsetX);
						if (typeof(config.gridOffsetY) != "undefined") me.setGridOffsetY(config.gridOffsetY);
						if (typeof(config.gridZoomLvl) != "undefined") me.setGridZoomLvl(config.gridZoomLvl);
						if (typeof(config.gridSizeX) != "undefined") me.setGridSizeX(config.gridSizeX);
						if (typeof(config.gridSizeY) != "undefined") me.setGridSizeY(config.gridSizeY);
						if (typeof(config.gridScale) != "undefined") me.setGridScale(config.gridScale);
						if (typeof(config.imgRotation) != "undefined") me.setImgRotation(config.imgRotation);
						if (typeof(config.cvBackgroundColor) != "undefined") me.setCvBackgroundColor(config.cvBackgroundColor);
						if (typeof(config.cvIsColored) != "undefined") me.setCvIsColored(config.cvIsColored);
						
						me.redraw();
					}, function() {
						console.log("Could not set config. Error while loading image: '" + url + "'.");
					});
		} else {
			console.log("Could not set config. No image path provided.");
			return;
		}
	},
	
	/**
	 * Gets all relevant informations which have to be send to the backend.
	 *
	 * Hint: If the canvas contains an image gotten from url we cannot access the
	 * Base64 of the image in the client due to CORS denial. The image will be
	 * transfered as a URL an will be converted directly on the server.
	 */
	createResult: function() {
		var result = {};
		
		// get image data
		if (this.getImageFile()) {
			result.image = this.getImageFile().src;
		}
		
		result.gridSize = this.getGridSize();
		result.offsetX = this.getOffsetX();
		result.offsetY = this.getOffsetY();
		result.zoomLvl = this.getZoomLvl();
		result.gridOffsetX = this.getGridOffsetX(),
		result.gridOffsetY = this.getGridOffsetY(),
		result.gridZoomLvl = this.getGridZoomLvl(),
		result.gridSizeX = this.getGridSizeX(),
		result.gridSizeY = this.getGridSizeY(),
		result.gridIsHidden = this.getGridIsHidden(),
		result.imgRotation = this.getImgRotation(),
		result.toggleFieldsLeft = this.getToggleFieldsLeft(),
		result.numClickableFields = this.getNumClickableFields(),
		result.thresholdCorrectAnswers = this.getThresholdCorrectAnswers();
		result.cvIsColored = this.getCvIsColored();
		result.gridLineColor = this.getCurGridLineColor();
		
		result.noCorrect = this.getChosenFields().length > 0 ? 0 : 1; // TODO: Check if really needed (and why numbers instead of bool)
		
		return result;
	},
});
