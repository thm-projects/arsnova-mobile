Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',
    xtype: 'canvas',

	config : {
		gridSize 				 : 5,			// Sqrt of the gridcount
		canvasSize 				 : 400,			// Size of the canvas element (width and height)
		canvas 				 	 : null, 		// The canvas element.
		imageFile 				 : null,		// The image file.
		gridLineWidth		 	 : 1,			// Width of the grid lines.
		chosenFields 			 : Array(),
		fieldColor 				 : "#C0FFEE",	// TODO Name ist irreführend: --> highlightColor oder so 
		curGridLineColor		 : "#000000",	// Current color of the grid lines. 
		GridLineColor 			 : "#000000",	// Default color of the grid lines.
		AlternativeGridLineColor : "#FFFFFF",	// Alternative color of the grid lines.
		scaleFactor 			 : 1.2,			// Zoom level scale factor.
		scale 					 : 1.0, 		// Actual scaling for the image. Necessary to switch between scale for zoomed image an normal scale.
		zoomLvl 				 : 0, 			// Current zoomlevel.
		offsetX 				 : 0,			// Current offset in x direction.
		offsetY 				 : 0,			// Current offset in y direction.
		moveInterval 			 : 10,			// Steps to take when moving the image (in pixel).
		onFieldClick 			 : null,		// TODO: hier wäre ein Kommentar mal sinnvoll
		editable				 : true			// If set to false click events are prevented
	},

	/**
	 * Constructor.
	 * 
	 * Creates the canvas element and initializes all necessary variables.
	 */
	constructor : function() {
		this.callParent(arguments);

		var canvas = document.createElement('canvas');
		canvas.id = 'canvasWrapper';
		canvas.width = this.getCanvasSize();
		canvas.height = this.getCanvasSize();
		canvas.style.display = 'block';
		canvas.style.margin = '0 auto';
		canvas.addEventListener("mousedown", this.onclick, false);
		canvas.parentContainer = this;
		this.setCanvas(canvas);
		
		this.image = {
			xtype : 'panel',
			cls : null,
			html : canvas,
		}

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
		
		ctx.drawImage(this.getImageFile(), this.getOffsetX(), this.getOffsetY());
		// restore context to draw grid with default scale
		ctx.restore();
		console.log('[GridContainer.js] - Done restoring canvas image.');
	
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
							entry[1], thiz.getFieldColor(), 0.5);
				});
		console.log('[GridContainer.js] - Done marking chosen fields.');
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
	 * Gets the field size relative to the size of the canvas element.
	 * 
	 * @return	int		The field size.
	 */
	getFieldSize : function() {
		return (this.getCanvasSize() - 2 * this.getGridLineWidth())
				/ this.getGridSize();
	},

	/**
	 * Draws the grid in the canvas element.
	 */
	createGrid : function() {
		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 1;
		ctx.fillStyle = this.getCurGridLineColor();

		// draw border
		ctx.fillRect(0, 0, this.getGridLineWidth(), this
				.getCanvasSize());
		ctx.fillRect(0, 0, this.getCanvasSize(), this
				.getGridLineWidth());
		ctx.fillRect(this.getCanvasSize() - this.getGridLineWidth(),
				0, this.getGridLineWidth(), this.getCanvasSize());
		ctx.fillRect(0, this.getCanvasSize()
				- this.getGridLineWidth(), this.getCanvasSize(),
				this.getGridLineWidth());

		// draw inner grid
		for (var i = 1; i < this.getGridSize(); i++) {
			ctx.fillRect(this.getFieldSize() * i
					+ this.getGridLineWidth(), 0, this
					.getGridLineWidth(), this.getCanvasSize());
			ctx.fillRect(0, this.getFieldSize() * i
					+ this.getGridLineWidth(), this.getCanvasSize(),
					this.getGridLineWidth());
		}
		console.log('[GridContainer.js] - Done creating canvas grid.');
	},

	/**
	 * Marks the field by the position parameters.
	 */
	markField : function(x, y, color, alpha) {

		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		
		var width =this.getFieldSize() - this.getGridLineWidth();
		var height = this.getFieldSize() - this.getGridLineWidth();
		
		/*
		 * rounding rest in separating the canvas size in fields stretches the first fields 
		 * in row and in column. At this point, the respective field mark get this stretch, too.
		 */
		if (y == 0) {
			height += this.getCanvasSize() - (this.getFieldSize() * this.getGridSize() + this.getGridLineWidth());
		} 
		if (x == 0) {
			width += this.getCanvasSize() - (this.getFieldSize() * this.getGridSize() + this.getGridLineWidth());
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

		// eigenes indexof
		var index = -1;
		var fields = container.getChosenFields();
		for (var i = 0; i < fields.length; i++) {
			if (fields[i][0] == position[0]
					&& fields[i][1] == position[1]) {
				index = i;
				break;
			}
		}

		var changed = false;
		if (index > -1) {
			container.getChosenFields().splice(index, 1);
			changed = true;
		} else if (container.getGridSize()
				* container.getGridSize() > container
				.getChosenFields().length) {
			container.getChosenFields().push(position);
			changed = true;
		}

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
	update: function(gridSize, offsetX, offsetY, zoomLvl, possibleAnswers, mark) {
		this.setGridSize(gridSize);
		this.setOffsetX(offsetX);
		this.setOffsetY(offsetY);
		this.setZoomLvl(zoomLvl);
		if (mark) {
			this.getChosenFieldsFromPossibleAnswers(possibleAnswers);
		} else {
			this.setChosenFields(new Array());
		}
		this.initZoom();
	},
	
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
	 * Moves the image one step in positive x direction.
	 */
	moveRight : function() {
		this.setOffsetX(this.getOffsetX() + this.getMoveInterval());
		this.redraw();
	},
	
	/**
	 * Moves the image one step in negative x direction.
	 */
	moveLeft : function() {
		this.setOffsetX(this.getOffsetX() - this.getMoveInterval());
		this.redraw();
	},
	
	/**
	 * Moves the image one step in negative y direction.
	 */
	moveUp : function() {
		this.setOffsetY(this.getOffsetY() - this.getMoveInterval());
		this.redraw();
	},
	
	/**
	 * Moves the image one step in positive y direction.
	 */
	moveDown : function() {
		this.setOffsetY(this.getOffsetY() + this.getMoveInterval());
		this.redraw();
	},
	
	/**
	 * Initializes the zoom level and scale.
	 */
	initZoom: function() {
		if (this.getZoomLvl() > 0) {
			for (i = 0; i < this.getZoomLvl(); i++) {
				this.setScale(this.getScale() * this.getScaleFactor());
			}
		} else if (this.getZoomLvl() < 0) {
			for (i = 0; i > this.getZoomLvl(); i--) {
				this.setScale(this.getScale() / this.getScaleFactor());
			}
		} else {
			this.setScale(1.0);
		}
	},
	
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
	 * Gets the general scale factor relative to the image to scale the image in the center of the canvas element.
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
		// no redraw the image with the new scale
		this.redraw();
	},

	/**
	 * Zooms out of the image by one step.
	 */
	zoomOut : function() {
		this.setZoomLvl(this.getZoomLvl() - 1);
		this.setScale(this.getScale() / this.getScaleFactor());
		// no redraw the image with the new scale
		this.redraw();
	},
	
	/**
	 * Sets the image of the canvas element.
	 * 
	 * @param 		dataUrl		The url specifiyng the source of the image file.
	 * @param bool	reload		<code>true</code> if the image should be reloaded, <code>false</code> otherwise.
	 */
	setImage : function(dataUrl, reload) {
		var newimage = new Image();
		var container = this;

		newimage.src = dataUrl;
		
		newimage.onload = function() {
			if (reload)
				container.clearImage();
			container.setImageFile(newimage);
			container.redraw();
		};
	},
	
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
	 * Calculates the size in bytes of the image file.
	 */
	getImageFileSizeBytes : function() {
		
		var src = this.getImageFile().src;
		
		if ( src.indexOf('http') == 0 ) {
			// image from url
			
			// TODO: Doesn't work due to CORS... have to find alternative
			
			var xhr = new XMLHttpRequest();
			xhr.open( 'HEAD', src, true );
			xhr.onreadystatechange = function(){
			    if ( xhr.readyState == 4 ) {
			        if ( xhr.status == 200 ) {
			            console.log('Canvas image from url filesize: ' + xhr.getResponseHeader('Content-Length'));
			            return xhr.getResponseHeader('Content-Length');
			        }
			    }
			};
			xhr.send(null);
		} else {
			// image from fs, so wen consult the base64 directly
			// formula according to: http://en.wikipedia.org/wiki/Base64#MIME
			
			console.log('Canvas image from fs filesize: ' + ((src.length - 814) / 1.37));
			return (src.length - 814) / 1.37;
		}
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
	 */
	getChosenFieldsFromPossibleAnswers : function(possibleAnswers) {
		var chosenFields = Array();
		for (var i=0 ; i < possibleAnswers.length ; i++) {
			if (possibleAnswers[i].correct) {
				chosenFields.push(this.getChosenFieldFromPossibleAnswer(possibleAnswers[i].text));
			}
		}

		console.log(chosenFields);
		// set directly to grid
		this.setChosenFields(chosenFields);
	},
	
	/**
	 * Converts a possibleAnswer message to a chosen field.
	 * 
	 * @param 	possibleAnswer	The possible answer to convert.
	 */
	getChosenFieldFromPossibleAnswer : function(possibleAnswer) {
		var coords = possibleAnswer.split(";");
		x = coords[0];
		y = coords[1];
		return new Array(parseInt(x),parseInt(y));
	},
	
	
	/**
	 * 
	 */
	generateStatisticOutput : function(tilesToFill, colorTiles, showPercentages, weakenSourceImage, toggleColors) {
		
		var totalAnswers = 0;
		
		// toggle grid color
		this.setCurGridLineColor(toggleColors ? this.getAlternativeGridLineColor() : this.getGridLineColor());
		
		// clear canvas
		weakenSourceImage ? this.redrawWithAlpha(0.2, false) : this.redraw();
		
		// count answers
		for (var key in tilesToFill) {
	    	totalAnswers += tilesToFill[key];
		}
		
		for (var row=0; row < this.getGridSize() ; row++) {
			for (var column=0; column < this.getGridSize() ; column++) {
				var key = row + ";" + column;
				var coords = this.getChosenFieldFromPossibleAnswer(key);

				if (colorTiles) {
					var alphaOffset = 0.05;
					var alphaScale 	= 0.9;
					var alpha 		= 0;
					
					if (typeof tilesToFill[key] !==  "undefined") {
						alpha = (tilesToFill[key] / totalAnswers) * alphaScale;
					}
					
					var color = "FF0000";
					for (var i=0;i<this.getChosenFields().length;i++) {
						if (this.getChosenFields()[i][0] == coords[0] && this.getChosenFields()[i][1] == coords[1]) {
							color = "00FF00";
						}
					}

					this.markField(coords[0], coords[1], color, alpha + alphaOffset);   // alpha between 0.15 and 0.9
				}
				
				if (showPercentages) {
					var text = (typeof tilesToFill[key] ===  "undefined" ) ? "0,0%" : Number((tilesToFill[key] / totalAnswers * 100.0).toFixed(1)) + "%";
					this.addTextToField(coords[0], coords[1], text);
				}	
			}
		}
	}
});