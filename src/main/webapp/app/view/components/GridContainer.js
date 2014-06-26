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

Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',
    xtype: 'canvas',

	config : {
		gridSize 				 : 5,			// Sqrt of the gridcount
		canvasSize 				 : 400,			// Size of the canvas element (width and height).
		canvas 				 	 : null, 		// The canvas element.
		imageFile 				 : null,		// The image file.
		gridLineWidth		 	 : 1,			// Width of the grid lines.
		chosenFields 			 : Array(),
		highlightColor 			 : '#C0FFEE',	// Color of highlighted fields.
		curGridLineColor		 : '#000000',	// Current color of the grid lines.
		gridLineColor 			 : '#000000',	// Default color of the grid lines.
		alternativeGridLineColor : '#FFFFFF',	// Alternative color of the grid lines.
		statisticWrongColor		 : '#FF0000',	// Color for wrong fields in statistic.
		statisticRightColor		 : '#00FF00',	// Color for right fields in statistic.
		scaleFactor 			 : 1.2,			// Zoom level scale factor.
		scale 					 : 1.0, 		// Actual scaling for the image. Necessary to switch between scale for zoomed image an normal scale.
		zoomLvl 				 : 0, 			// Current zoomlevel.
		offsetX 				 : 0,			// Current offset in x direction.
		offsetY 				 : 0,			// Current offset in y direction.
		moveInterval 			 : 10,			// Steps to take when moving the image (in pixel).
		onFieldClick 			 : null,		// Hook for function, that will be called after onClick event.
		editable				 : true,		// If set to false click events are prevented.
		possibleAnswers  		 : [], 			// The pre-set, correct answers of the lecturer
		heatmapMaxAlpha			 : 0.9,			// The alpha value of a field with 100% of votes.
		heatmapMinAlpha			 : 0.2,			// The alpha value of a field with 0% of votes. 
		gridOffsetX 			 : 0,			// current x offset for grid start point
		gridOffsetY 			 : 0,			// current y offset for grid start point
		gridZoomLvl 			 : 0,			// zoom level for grid (defines size of grid fields)
		gridSizeX 				 : 0,			// number of horizontal grid fields
		gridSizeY 				 : 0,			// number of vertical grid fields
		gridIsHidden 			 : false,      	// flag for visual hiding of the grid
		gridScale				 : 1.0,			// Current scale for the grid.
		imgRotation				 : 0,			// Current rotation for the image.
		toggleFieldsLeft		 : false,		// toggle the number of clickable fields. true: all fields are clickable, false: only the number of fields the lecturer has selected are clickable
		numClickableFields		 : 0,			// number of clickable fields the lecturer has chosen
	},

	/**
	 * Constructor.
	 *
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor : function() {
		this.callParent(arguments);

		// set canvas size depending on screen size
		var width 			= (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var extraPadding 	= 40;
		var canvasSize 		= (width < 400 + extraPadding) ? width - extraPadding : 400;
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
			xtype : 'panel',
			cls : null,
			html : canvas
		};

		this.add([ this.image ]);
	},

	/**
	 * Redraws the whole canvas element with default alpha value and marks the chosen fields.
	 */
	redraw : function() {
		this.redrawWithAlpha(1.0, true);
	},

	/**
	 * Redraws the whole canvas element.
	 *
	 * @param double	alpha				The alpha value of the field color.
	 * @param boolean	markChosenFields	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	redrawWithAlpha : function(alpha, markChosenFields) {
		var ctx = this.getCanvas().getContext('2d');
		// save context
		ctx.save();


		ctx.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);

		this.zoom(this.getScale());

		ctx.globalAlpha = alpha;

		// draw image avoiding ios 6/7 squash bug
		this.drawImageIOSFix(
				ctx, 
				this.getImageFile(), 
				0, 0, 
				this.getImageFile().naturalWidth, this.getImageFile().naturalHeight, 
				this.getOffsetX(), this.getOffsetY(), 
				this.getImageFile().width, this.getImageFile().height);
		
		// restore context to draw grid with default scale
		ctx.restore();
		
		this.createGrid();
		
		if ( markChosenFields ) {
			this.markChosenFields();
		}
	},

	/**
	 * Marks all chosen fields.
	 */
	markChosenFields: function() {
		var thiz = this;
		this.getChosenFields().forEach(
				function(entry) {
					thiz.markField(entry[0],
							entry[1], thiz.getHighlightColor(), 0.5);
				});
	},

	/**
	 * Get field position of the given coordinates relative to the grid.
	 *
	 * @param x 	The x-coordinate of the position.
	 * @param y 	The y-coordinate of the position.
	 */
	getFieldPosition : function(x, y) {
		var canvas = this.getCanvas();

		x -= canvas.getBoundingClientRect().left;
		y -= canvas.getBoundingClientRect().top;

		var xGrid = parseInt(x
				/ (this.getCanvasSize() / this.getGridSize()));
		var yGrid = parseInt(y
				/ (this.getCanvasSize() / this.getGridSize()));
		return new Array(xGrid, yGrid);
	},

	/**
	 * Gets the relative start coordinates of a field by its position parameters.
	 *
	 * @param int	x	The fields x-coordinate.
	 * @param int	y	The fields y-coordinate.
	 */
	getFieldKoord : function(x, y) {
		var x1 = x * this.getFieldSize() + 2 * this.getGridLineWidth();
		var y1 = y * this.getFieldSize() + 2 * this.getGridLineWidth();

		/*
		 * If the field is near to the left or top edge, the border is just the half.
		 */
		if(x == 0) {
			x1 -= this.getGridLineWidth();
		}

		if(y == 0){
			y1 -= this.getGridLineWidth();
		}
		return new Array(x1, y1);
	},

	/**
	 * Gets the field size relative to the size of the canvas element and the current grid scaling.
	 *
	 * @return	int		The field size.
	 */
	getFieldSize : function() {
		return ((this.getCanvasSize() - 2 * this.getGridLineWidth())
				/ this.getGridSize()) * this.getGridScale();
	},
	
	/**
	 * Gets the canvas size relative to the current grid scaling.
	 * 
	 * @return	int		The relative canvas size. 
	 */
	getRelativeCanvasSize : function() {
		return this.getCanvasSize() * this.getGridScale();
	},

	/**
	 * Draws the grid in the canvas element.
	 */
	createGrid : function() {
		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 1;
		ctx.fillStyle = this.getCurGridLineColor();

		// draw border
		ctx.fillRect(this.getGridOffsetX(), this.getGridOffsetY(), this.getGridLineWidth(), this
				.getRelativeCanvasSize());
		ctx.fillRect(this.getGridOffsetX(), this.getGridOffsetY(), this.getRelativeCanvasSize(), this
				.getGridLineWidth());
		ctx.fillRect(this.getGridOffsetX() + this.getRelativeCanvasSize() - this.getGridLineWidth(),
				this.getGridOffsetY(), this.getGridLineWidth(), this.getRelativeCanvasSize());
		ctx.fillRect(this.getGridOffsetX(), this.getGridOffsetY() + this.getRelativeCanvasSize()
				- this.getGridLineWidth(), this.getRelativeCanvasSize(),
				this.getGridLineWidth());

		// draw inner grid
		for (var i = 1; i < this.getGridSize(); i++) {
			ctx.fillRect(this.getGridOffsetX() + this.getFieldSize() * i
					+ this.getGridLineWidth(), this.getGridOffsetY(), this
					.getGridLineWidth(), this.getRelativeCanvasSize());
			ctx.fillRect(this.getGridOffsetX(), this.getGridOffsetY() + this.getFieldSize() * i
					+ this.getGridLineWidth(), this.getRelativeCanvasSize(),
					this.getGridLineWidth());
		}
	},

	/**
	 * Marks the field by the position parameters.
	 */
	markField : function(x, y, color, alpha) {

		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;

		var width = this.getFieldSize() - this.getGridLineWidth();
		var height = this.getFieldSize() - this.getGridLineWidth();

		/*
		 * rounding rest in separating the canvas size in fields stretches the first fields
		 * in row and in column. At this point, the respective field mark get this stretch, too.
		 */
		if (y == 0) {
			height += this.getRelativeCanvasSize() - (this.getFieldSize() * this.getGridSize() + this.getGridLineWidth());
		}
		if (x == 0) {
			width += this.getRelativeCanvasSize() - (this.getFieldSize() * this.getGridSize() + this.getGridLineWidth());
		}

		ctx.fillRect(koord[0], koord[1], width, height);
	},


	/**
	 * Draws the given text in the field by the specified coordinates.
	 *
	 * @param int 		x		The x-coordinate of the field.
	 * @param int 		y		The y-coordinate of the field.
	 * @param String	text	The text to display in the field.
	 */
	addTextToField : function(x, y, text) {
		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);

		// calculate exact starting point
		var startX = koord[0] + this.getFieldSize() / 2 - this.getGridLineWidth();
		var startY = koord[1] + this.getFieldSize() / 2 - this.getGridLineWidth();

		ctx.save();

		// set font layout
		ctx.globalAlpha  = 1;
		ctx.fillStyle    = this.getCurGridLineColor();
		ctx.font 		 = this.getFontForGridSize(this.getGridSize());
		ctx.textAlign    = "center";
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
	getFontForGridSize : function(gridsize) {
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
	 * Handles mouse click events on the canvas element.
	 *
	 * @param event		The mouse click event.
	 */
	onclick : function(event) {

		var container = this.parentContainer;

		if ( ! container.getEditable() ) {
			// click prevention for non-editable grids
			return;
		}

		// get field position of the mouse click relative to the grid.
		var x = event.clientX;
		var y = event.clientY;
		var position = container.getFieldPosition(x, y);

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

	    var numChosenFields = container.getChosenFields().length;
	    var numCorrectFields = container.getPossibleAnswers().filter(function isCorrect(e) {
	    	return e.correct;
	    }).length;
	    // either allow the maximum of correct fields, or allow all fields to be clicked if no correct answers are present
	    var fieldsLeft = ((numChosenFields < numCorrectFields) || (numCorrectFields === 0) || container.getToggleFieldsLeft());
		var changed = false;
		if (index > -1) {
			container.getChosenFields().splice(index, 1);
			changed = true;
		} else if ((container.getGridSize()
				* container.getGridSize() > container
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
	 * @param int	gridSize		The gridSize to set.
	 * @param int	offsetX			The offsetX to set.
	 * @param int	offsetY			The offsetY to set.
	 * @param 		possibleAnswers	The Array of possible answers to set.
	 * @param bool	<code>true</code> if the chosen fields should be marked, <code>false</code> otherwise.
	 */
	update: function(gridSize, offsetX, offsetY, zoomLvl, gridOffsetX, gridOffsetY, gridZoomLvl, gridSizeX, gridSizeY, gridIsHissen, imgRotation, possibleAnswers, mark) {
		this.setGridSize(gridSize);
		this.setOffsetX(offsetX);
		this.setOffsetY(offsetY);
		this.setZoomLvl(zoomLvl);
		this.setGridOffsetX(gridOffsetX);
		this.setGridOffsetY(gridOffsetY);
		this.setGridZoomLvl(gridZoomLvl);
		this.setGridSizeX(gridSizeX);
		this.setGridSizeY(gridSizeY);
		this.setGridIsHidden(gridIsHissen);
		this.setImgRotation(imgRotation);
		
		if (mark) {
			this.getChosenFieldsFromPossibleAnswers(possibleAnswers);
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
	setGrids : function(count) {
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
	moveRight : function() {
		this.setOffsetX(this.getOffsetX() + this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in left (negative x) direction.
	 */
	moveLeft : function() {
		this.setOffsetX(this.getOffsetX() - this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in up (negative y) direction.
	 */
	moveUp : function() {
		this.setOffsetY(this.getOffsetY() - this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Moves the image one step in down (positive y) direction.
	 */
	moveDown : function() {
		this.setOffsetY(this.getOffsetY() + this.getMoveInterval() / this.getScale());
		this.redraw();
	},

	/**
	 * Initializes the zoom level and scale.
	 */
	initZoom : function() {
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
	zoom : function(scale) {
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
	getGeneralScaleFactor : function() {
		var image = this.getImageFile();

		if(image.height >= image.width) {
			return (this.getCanvasSize() / image.height) ;
		} else {
			return (this.getCanvasSize() / image.width) ;
		}
	},

	/**
	 * Zooms in the image by one step.
	 */
	zoomIn : function() {
		this.setZoomLvl(this.getZoomLvl() + 1);
		this.setScale(this.getScale() * this.getScaleFactor());
		// now redraw the image with the new scale
		this.redraw();
	},

	/**
	 * Zooms out of the image by one step.
	 */
	zoomOut : function() {
		this.setZoomLvl(this.getZoomLvl() - 1);
		this.setScale(this.getScale() / this.getScaleFactor());
		// now redraw the image with the new scale
		this.redraw();
	},
	
	/**
	 * Initializes the zoom level and scale of the grid.
	 */
	initGridZoom : function() {
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
	
	zoomInGrid : function() {
		this.setGridZoomLvl(this.getGridZoomLvl() + 1);
		this.setGridScale(this.getGridScale() * this.getScaleFactor());
		// TODO Zoom muss noch zentriert werden
		
		// now redraw the grid
		//this.redrawGrid();
		this.redraw();
	},
	
	zoomOutGrid : function() {
		this.setGridZoomLvl(this.getGridZoomLvl() - 1);
		this.setGridScale(this.getGridScale() / this.getScaleFactor());
		// TODO Zoom muss noch zentriert werden
		
		// now redraw the grid
		// this.redrawGrid();
		this.redraw();
	},
	
	/**
	 * Moves the grid one step in right (positive x) direction.
	 */
	moveGridRight : function() {
		this.setGridOffsetX(this.getGridOffsetX() + this.getMoveInterval() / this.getGridScale());
		this.redraw();
	},

	/**
	 * Moves the grid one step in left (negative x) direction.
	 */
	moveGridLeft : function() {
		this.setGridOffsetX(this.getGridOffsetX() - this.getMoveInterval() / this.getGridScale());
		this.redraw();
	},

	/**
	 * Moves the grid one step in up (negative y) direction.
	 */
	moveGridUp : function() {
		this.setGridOffsetY(this.getGridOffsetY() - this.getMoveInterval() / this.getGridScale());
		this.redraw();
	},

	/**
	 * Moves the grid one step in down (positive y) direction.
	 */
	moveGridDown : function() {
		this.setGridOffsetY(this.getGridOffsetY() + this.getMoveInterval() / this.getGridScale());
		this.redraw();
	},

	/**
	 * Sets the image of the canvas element.
	 *
	 * @param 		dataUrl		The url specifiyng the source of the image file.
	 * @param bool	reload		<code>true</code> if the image should be reloaded, <code>false</code> otherwise.
   * @param fn successCallback Called when it's a valid image that has been loaded
   * @param fn failureCallback Called when it's not a valid image
	 */
	setImage : function(dataUrl, reload, successCallback, failureCallback) {
		var newimage = new Image();
		var container = this;

		newimage.src = dataUrl;

		newimage.onload = function() {
      var cb = successCallback || Ext.emptyFn;
			if (reload) {
				container.clearImage();
      }
			container.setImageFile(newimage);
			container.redraw();

			cb();
		};
    newimage.onerror = function() {
      var cb = failureCallback || Ext.emptyFn;
      cb();
    }
	},

	/**
	 * Clears the image and resets all necessary configurations.
	 */
	clearImage : function() {
		var canvas = this.getCanvas();
		this.setGridSize(5);
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
	clearConfigs : function() {
		this.setScale(1.0);
		this.setOffsetX(0);
		this.setOffsetY(0);
		this.setZoomLvl(0);
		this.setChosenFields(Array());
	},

	/**
	 * Toggles the color of the grid.
	 */
	toggleBorderColor : function() {
		if(this.getCurGridLineColor() == this.getGridLineColor()){
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
	getPossibleAnswersFromChosenFields : function() {
		var values = [], obj;

		for (var i = 0 ; i < this.getGridSize() ; i++) {
			for (var j = 0 ; j < this.getGridSize() ; j++) {
				obj = {
						text: i + ";" + j,
						correct: false
				}
				for (var k = 0 ; k < this.getChosenFields().length ; k++) {
					var currentField = this.getChosenFields()[k];
					if ( currentField[0] == i && currentField[1] == j ) {
						obj.correct = true;
						break;
					}
				}
				values.push(obj);
			}
		}
		return values;
	},

	/**
	 * Converts possible answers to chosen fields (int[][]) to be used
	 * inside the grid container.
	 *
	 * @param Array	possibleAnswers		The Array of possible answers to convert.
	 */
	getChosenFieldsFromPossibleAnswers : function(possibleAnswers) {
		var chosenFields = Array();
		for (var i=0 ; i < possibleAnswers.length ; i++) {
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
	getChosenFieldFromPossibleAnswer : function(possibleAnswer) {
		var coords = possibleAnswer.split(";");
		x = coords[0];
		y = coords[1];
		return new Array(parseInt(x),parseInt(y));
	},

	/**
	 * generates the statistic output.
	 */
	generateStatisticOutput : function(tilesToFill, colorTiles, displayType, weakenSourceImage, toggleColors) {

		var totalAnswers = 0;
		
		var wrongColor =  this.getStatisticWrongColor();
		var rightColor = this.getStatisticRightColor();
		
		
		if(this.getChosenFields().length == 0){
			wrongColor = this.getHighlightColor();
		}
		

		// toggle grid color
		this.setCurGridLineColor(toggleColors ? this.getAlternativeGridLineColor() : this.getGridLineColor());

		// clear canvas
		weakenSourceImage ? this.redrawWithAlpha(0.2, false) : this.redraw();

		// count answers
		for (var key in tilesToFill) {
	    	totalAnswers += tilesToFill[key];
		}
		
		// pre-iterate through answers to get min and max value, used to define the alpha value
		// TODO: find a more elagant way than iterating twice through all tiles.
		var maxVotes = 0;
		var minVotes = 0;
		for (var row=0; row < this.getGridSize() ; row++) {
			for (var column=0; column < this.getGridSize() ; column++) {
				var key = row + ";" + column;
				if (typeof tilesToFill[key] !==  "undefined") {
					if ( tilesToFill[key] > maxVotes ) {
						maxVotes = tilesToFill[key];
						if ( minVotes == 0 ) {
							minVotes = maxVotes;
						}
					}
					minVotes = (tilesToFill[key] > 0 && tilesToFill[key] < minVotes) ? tilesToFill[key] : minVotes;
				}
			}
		}

		for (var row=0; row < this.getGridSize() ; row++) {
			for (var column=0; column < this.getGridSize() ; column++) {
				var key = row + ";" + column;
				var coords = this.getChosenFieldFromPossibleAnswer(key);

				if (colorTiles) {
					var alphaOffset = this.getHeatmapMinAlpha();
					var alphaScale 	= this.getHeatmapMaxAlpha() - this.getHeatmapMinAlpha();
					var alpha 		= 0;

					if (typeof tilesToFill[key] !==  "undefined") {
						if ( maxVotes == minVotes ){
							alpha = this.getHeatmapMaxAlpha();
						} else if (tilesToFill[key] == 0) {
							alpha = 0;
						} else {
							alpha = this.getHeatmapMinAlpha() + ( ((this.getHeatmapMaxAlpha()-this.getHeatmapMinAlpha())/(maxVotes-minVotes)) * (tilesToFill[key] - minVotes) );
						}
					}

					var color = wrongColor;
					for (var i=0;i<this.getChosenFields().length;i++) {
						if (this.getChosenFields()[i][0] == coords[0] && this.getChosenFields()[i][1] == coords[1]) {
							color = rightColor;
						}
					}

					this.markField(coords[0], coords[1], color, alpha);
				}

				if (displayType == Messages.GRID_LABEL_RELATIVE || displayType == Messages.GRID_LABEL_RELATIVE_SHORT) {
					var text = (typeof tilesToFill[key] !==  "undefined" ) ? Number((tilesToFill[key] / totalAnswers * 100.0).toFixed(1)) + "%" : "";
					this.addTextToField(coords[0], coords[1], text);
				} else if (displayType == Messages.GRID_LABEL_ABSOLUTE || displayType == Messages.GRID_LABEL_ABSOLUTE_SHORT) {
					var text = (typeof tilesToFill[key] !==  "undefined" ) ? tilesToFill[key] : "";
					this.addTextToField(coords[0], coords[1], text);
				}


			}
		}
	},

	/**
	 * TODO kommentieren
	 */
	generateUserViewWithAnswers : function (userAnswers, correctAnswers, toggleColors){

		// toggle grid color
		this.setCurGridLineColor(toggleColors ? this.getAlternativeGridLineColor() : this.getGridLineColor());

		var lowAlpha = 0.2;
		var highAlpha = 0.9;

		for (var row=0; row < this.getGridSize(); row++) {
			for (var column=0; column < this.getGridSize(); column++) {

				var i = row * this.getGridSize() + column;
				var color = correctAnswers[i] ? this.getStatisticRightColor() : this.getStatisticWrongColor();
				var alpha = userAnswers[i] ? highAlpha : lowAlpha;


				this.markField(row,column, color, alpha);

			}
		}
	},
	
	
	/**
	 * Detecting vertical squash in loaded image.
	 * Fixes a bug which squash image vertically while drawing into canvas for some images.
	 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
	 * 
	 */
	detectVerticalSquash : function (img) {
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
	    return (ratio===0)?1:ratio;
	},

	/**
	 * A replacement for context.drawImage
	 * (args are for source and destination).
	 */
	drawImageIOSFix : function (ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
		var vertSquashRatio = this.detectVerticalSquash(img);
		ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
	},

	
});
