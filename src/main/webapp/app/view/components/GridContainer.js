Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',
    xtype: 'canvas',

	config : {
		gridSize 				 : 5,			// Sqrt of the gridcount
		imgSize 				 : 400,			// TODO Brauchen wir das ???
		imgSizeHalf 			 : 200,			// TODO Brauchen wir das ???
		canvas 				 	 : null, 
		imageFile 				 : null,
		borderWidth 			 : 1,			// TODO Name ist irreführend: --> gridWidth oder so 
		chosenFields 			 : Array(),
		fieldColor 				 : "#C0FFEE",	// TODO Name ist irreführend: --> highlightColor oder so 
		borderColor 			 : "#000000",	// TODO Name ist irreführend: --> gridColor oder so 
		defaultBorderColor 		 : "#000000",	// TODO Name ist irreführend: --> defaultGridColor oder so
		defaultToggleBorderColor : "#FFFFFF",	// TODO Name ist irreführend: --> alternativeGridColor oder so
		scaleFactor 			 : 1.2,			// zoom level scale factor
		scaleInterval			 : 0.2,			// zoom level scale interval
		scale 					 : 1.0, 		// actual scaling for the image. Necessary to switch between zoomed image an normal scale
		zoomLvl 				 : 0, 			// current zoomlevel
		offsetX 				 : 0,
		offsetY 				 : 0,
		moveInterval 			 : 10,			// steps to take when moving the image
		moveable 				 : Array(true, true, true, true), // defines in which direction (l, u, r, d) the image is moveable
		onFieldClick 			 : null,		// TODO: hier wäre ein Kommentar mal sinnvoll
		editable				 : true			// if set to false click events are prevented
	},

	constructor : function() {
		this.callParent(arguments);

		var canvas = document.createElement('canvas');
		canvas.id = 'canvasWrapper';
		canvas.width = this.getImgSize();
		canvas.height = this.getImgSize();
		canvas.style.display = 'block';
		canvas.style.margin = '0 auto';
		canvas.addEventListener("mousedown", this.onclick, false);
		canvas.parentContainer = this;
		
		this.setImgSizeHalf(this.getImgSize() / 2);

		this.setCanvas(canvas);
		
		this.image = {
			xtype : 'panel',
			cls : null,
			html : canvas,
		}

		this.add([ this.image ]);
	},

	/**
	 * TODO: WEr die geschrieben hat, kommentieren!
	 */
	clearAll : function() {
		this.clearAllWithAlpha(1.0, true);
	},
	
	// TODO: rename to redraw
	clearAllWithAlpha : function(alpha, markChosenFields) {
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

	markChosenFields: function() {
		var thiz = this;
		this.getChosenFields().forEach(
				function(entry) {
					thiz.markField(entry[0],
							entry[1], thiz.getFieldColor(), 0.5);
				});
		console.log('[GridContainer.js] - Done marking chosen fields.');
	},
	
	// get the posotion params of a field by the koords of the
	// click
	// event
	getFieldPosition : function(x, y) {
		var canvas = this.getCanvas();

		x -= canvas.getBoundingClientRect().left;
		y -= canvas.getBoundingClientRect().top;

		var xGrid = parseInt(x
				/ (this.getImgSize() / this.getGridSize()));
		var yGrid = parseInt(y
				/ (this.getImgSize() / this.getGridSize()));
		return new Array(xGrid, yGrid);
	},

	// get relative start koords of a field by its position
	// params
	getFieldKoord : function(x, y) {
		var x1 = x * this.getFieldSize() + 2
				* this.getBorderWidth();
		var y1 = y * this.getFieldSize() + 2
				* this.getBorderWidth();
		return new Array(x1, y1);
	},

	getFieldSize : function() {
		return (this.getImgSize() - 2 * this.getBorderWidth())
				/ this.getGridSize();
	},

	createGrid : function() {
		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 1;
		ctx.fillStyle = this.getBorderColor();

		// rand
		ctx.fillRect(0, 0, this.getBorderWidth(), this
				.getImgSize());
		ctx.fillRect(0, 0, this.getImgSize(), this
				.getBorderWidth());
		ctx.fillRect(this.getImgSize() - this.getBorderWidth(),
				0, this.getBorderWidth(), this.getImgSize());
		ctx.fillRect(0, this.getImgSize()
				- this.getBorderWidth(), this.getImgSize(),
				this.getBorderWidth());

		// innengatter
		for (var i = 1; i < this.getGridSize(); i++) {
			ctx.fillRect(this.getFieldSize() * i
					+ this.getBorderWidth(), 0, this
					.getBorderWidth(), this.getImgSize());
			ctx.fillRect(0, this.getFieldSize() * i
					+ this.getBorderWidth(), this.getImgSize(),
					this.getBorderWidth());
		}
		console.log('[GridContainer.js] - Done creating canvas grid.');
	},

	// mark field by position parameters
	markField : function(x, y, color, alpha) {

		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fillRect(koord[0], koord[1], this.getFieldSize()
				- this.getBorderWidth(), this.getFieldSize()
				- this.getBorderWidth());
	},
	
	
	/**
	 * 
	 */
	addTextToField : function(x, y, text) {
		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);
		
		// calculate exact starting point
		var startX = koord[0] + this.getFieldSize() / 2 - this.getBorderWidth();
		var startY = koord[1] + this.getFieldSize() / 2 - this.getBorderWidth();
		
		ctx.save();
		
		// set font layout
		ctx.globalAlpha  = 1;
		ctx.fillStyle    = this.getBorderColor();
		ctx.font 		 = this.getFontForGridSize(this.getGridSize());
		ctx.textAlign    = "center";
		ctx.textBaseline = "middle";
		
		// draw text
		ctx.fillText(text, startX, startY);

		ctx.restore();
	},
	
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

	onclick : function(event) {
		
		var container = this.parentContainer;
		
		if ( ! container.getEditable() ) {
			// click prevention for non-editable grids
			return;
		}
		
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
			container.clearAll();
		}

		if (container.getOnFieldClick() != null) {
			container.getOnFieldClick()(
					container.getChosenFields().length);
		}
	},

	// TODO init / update oder was anderes?
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
		
		this.clearAll();
		
		if (this.getOnFieldClick() != null) {
			this.getOnFieldClick()(
					this.getChosenFields().length);
		}
	},
	
	moveRight : function() {
		this.setOffsetX(this.getOffsetX() + this.getMoveInterval());
		this.clearAll();
	},
	
	moveLeft : function() {
		this.setOffsetX(this.getOffsetX() - this.getMoveInterval());
		this.clearAll();
	},
	
	moveUp : function() {
		this.setOffsetY(this.getOffsetY() - this.getMoveInterval());
		this.clearAll();
	},
	
	moveDown : function() {
		this.setOffsetY(this.getOffsetY() + this.getMoveInterval());
		this.clearAll();
	},
	
	initZoom: function() {
		console.log('init zoom');
		console.log("scale before: " + this.getScale());
		if (this.getZoomLvl() > 0) {
			console.log ("zoomLvl > 0")
			for (i = 0; i < this.getZoomLvl(); i++) {
				this.setScale(this.getScale() + this.getScaleInterval());
//				this.setScale(this.getScale() * this.getScaleFactor());
			}
		} else if (this.getZoomLvl() < 0) {
			for (i = 0; i > this.getZoomLvl(); i--) {
				this.setScale(this.getScale() - this.getScaleInterval());
//				this.setScale(this.getScale() / this.getScaleFactor());
			}
		} else {
			this.setScale(1.0);
		}
		console.log("scale after: " + this.getScale());
	},
	
	zoom : function(scale) {
		console.log("zoom() with scale: " + scale + " this.scale: " + this.getScale());
		var ctx = this.getCanvas().getContext("2d");
		var imgSizeHalf = this.getImgSizeHalf();
		
		ctx.translate(imgSizeHalf - (imgSizeHalf * scale), imgSizeHalf - (imgSizeHalf * scale));
		
		scale *= this.getGeneralScale();
		console.log("ctx.scale: " + scale);
		ctx.scale(scale, scale);
	},
	
	getGeneralScale : function(){
		var image = this.getImageFile();
		
		console.log("Canvas größe: " + this.getImgSize() );
		console.log("Bildhöhe: " + image.height);
		console.log("Bildbreite: " + image.width);
		
		if(image.height >= image.width){
			return (this.getImgSize() / image.height) ;
		} else {
			return (this.getImgSize() / image.width) ;
		}
	},

	zoomIn : function() {
		// TODO zoomFactor = 1.2 --> zoomStep = 0.2 --> Bei jedem Schritt 0.2 zum scaling addieren, nicht multiplizieren
		// --> kein exponentieller Zoom mehr
		console.log("zoom in");
		console.log("scale before: " + this.getScale());
		this.setZoomLvl(this.getZoomLvl() + 1);
		this.setScale(this.getScale() + this.getScaleInterval());
//		this.setScale(this.getScale() * this.getScaleFactor());
		console.log("scale after: " + this.getScale());
		console.log("new zoomlvl: " + this.getZoomLvl());
		this.clearAll();
	},

	zoomOut : function() {
		console.log("zoom out");
		console.log("scale before: " + this.getScale());
		this.setZoomLvl(this.getZoomLvl() - 1);
		this.setScale(this.getScale() - this.getScaleInterval());
//		this.setScale(this.getScale() / this.getScaleFactor());
		console.log("scale after: " + this.getScale());
		console.log("new zoomlvl: " + this.getZoomLvl());
		this.clearAll();
	},
	
	setImage : function(dataUrl, reload) {
		console.log("setImage()");
		var newimage = new Image();
		var container = this;

		newimage.src = dataUrl;
		
		newimage.onload = function() {
			if (reload)
				container.clearImage();
			container.setImageFile(newimage);
			container.clearAll();
		};
	},
	
	clearImage : function() {
		var canvas = this.getCanvas();
		this.setImageFile(null);
		this.clearConfigs();
		
		// clear and redraw canvas
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.createGrid();

	}, 
	
	clearConfigs : function() {
		this.setScale(1.0);
		this.setOffsetX(0);
		this.setOffsetY(0);
		this.setZoomLvl(0);
		this.setChosenFields(Array());
		this.setMoveable( Array(true, true, true, true) );
	},
	
	toggleBorderColor : function(){
		if(this.getBorderColor() == this.getDefaultBorderColor()){
			this.setBorderColor(this.getDefaultToggleBorderColor());
		} else {
			this.setBorderColor(this.getDefaultBorderColor());
		}	
		
		this.clearAll();
	},
	
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
		console.log("possible answers");
		console.log(possibleAnswers);
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
	 * Converts a possibleAnswer message to a chosen field
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
		this.setBorderColor(toggleColors ? this.getDefaultToggleBorderColor() : this.getDefaultBorderColor());
		
		// clear canvas
		weakenSourceImage ? this.clearAllWithAlpha(0.2, false) : this.clearAll();
		
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