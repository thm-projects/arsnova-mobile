Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',
    xtype: 'canvas',

	config : {
		gridSize : 5,  // wurzel der Quadartanzahl 
		imgSize : 400, // fixe größe des Bildfensters
		imgSizeHalf : 200, // TODO diesen Wert zu Beginn berechnen und zuweisen (im Konstruktor?)
		canvas : null, 
		imageFile : null,
		borderWidth : 1, // Dicke des Rasters in pixel
		chosenFields : Array(), // array von ausgewählten Quadraten
		fieldColor : "#C0FFEE", // Farbe der ausgewählten Quadrate
		borderColor : "#000000", // Farbe des Rasters
		defaultBorderColor : "#000000",
		defaultToggleBorderColor : "#FFFFFF",
		scaleFactor : 1.2, // Faktor für zoomschritte
		scale : 1.0, // Aktuelle ZoomScalierung des Bildes
		zoomLvl : 0, // zoomlevel zum vergleichen mit ober und untergrenze
		zoomMin : 0, // Zoom untergrenze
		zoomMax : 5, // zoom obergrenze
		offsetX : 0, // x achsen verschiebung
		offsetY : 0, //  y achsen verschiebung
		moveInterval : 10, // schrittgröße zum verschieben
		moveable : Array(true, true, true, true), // defines in which direction (l, u, r, d) the image is moveable
		onFieldClick : null,
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

	
	clearAll : function() {
		var ctx = this.getCanvas().getContext('2d');
		ctx.save();
		
		ctx.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
		ctx.globalAlpha = 1;

		this.zoom(this.getScale());
		ctx.drawImage(this.getImageFile(), this.getOffsetX(), this.getOffsetY());
		ctx.restore();
		console.log('cleared.')
	
		this.createGrid();
		
		var thiz = this;
		
		this.getChosenFields()
		.forEach(
				function(entry) {
					thiz.markField(entry[0],
							entry[1]);
				});
		
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
		
		console.log('grid created.');
	},

	// mark field by position parameters
	markField : function(x, y) {

		var ctx = this.getCanvas().getContext("2d");
		var koord = this.getFieldKoord(x, y);

		ctx.globalAlpha = 0.5;
		ctx.fillStyle = this.getFieldColor();
		ctx.fillRect(koord[0], koord[1], this.getFieldSize()
				- this.getBorderWidth(), this.getFieldSize()
				- this.getBorderWidth());
	},

	onclick : function(event) {
		var container = this.parentContainer;
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
		console.log("scaleFactor - 1: " + parseFloat(this.getScaleFactor() - 1));
		console.log("OffsetX: " + this.getOffsetX());
		var scaled = parseFloat((this.getScaleFactor() - 1) * this.getZoomLvl());
		if (this.getOffsetX() < scaled * this.getImgSize()/ this.getGeneralScale() / 2) {
			var OffsetX = this.getOffsetX() + this.getMoveInterval() * scaled;
			this.setOffsetX(OffsetX);
			this.clearAll();
			console.log("move right");
		} else {
			var moveable = this.getMoveable();
			moveable[2] = false;
			this.setMoveable(moveable);
			console.log("reached left end");
		}		
	},
	
	moveLeft : function() {
		if (this.getOffsetX() * (-1) < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / this.getGeneralScale() / 2) {
			var OffsetX = this.getOffsetX() - this.getMoveInterval();
			this.setOffsetX(OffsetX);
			this.clearAll();
			console.log("move left");
		} else {
			var moveable = this.getMoveable();
			moveable[0] = false;
			this.setMoveable(moveable);
			console.log("reached right end");
		}	
	},
	
	moveUp : function() {
		if (this.getOffsetY() * (-1) < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / this.getGeneralScale()/ 2) {
			var OffsetY = this.getOffsetY() - this.getMoveInterval();
			this.setOffsetY(OffsetY);
			this.clearAll();
			console.log("move up");
		} else {
			var moveable = this.getMoveable();
			moveable[1] = false;
			this.setMoveable(moveable);
			console.log("reached bottom end");
		}	
	},
	
	moveDown : function() {
		if (this.getOffsetY() < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / this.getGeneralScale() / 2) {
			var OffsetY = this.getOffsetY() + this.getMoveInterval();
			this.setOffsetY(OffsetY);
			this.clearAll();
			console.log("move down");
		} else {
			var moveable = this.getMoveable();
			moveable[3] = false;
			this.setMoveable(moveable);
			console.log("reached top end");
		}	
	},
	
	isMoveable : function() {
		return this.getMoveable();
	},
	
	zoom : function(scale) {
		var ctx = this.getCanvas().getContext("2d");
		var imgSizeHalf = this.getImgSizeHalf();
				
		ctx.translate(imgSizeHalf - (imgSizeHalf * scale), imgSizeHalf - (imgSizeHalf * scale));
		
		scale *= this.getGeneralScale();
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
		console.log("zoom in");
		if (this.getZoomLvl() < this.getZoomMax()) {
			this.setZoomLvl(this.getZoomLvl() + 1);
			this.setScale(this.getScale() * this.getScaleFactor());
			console.log("new zoomlvl: " + this.getZoomLvl());
			this.clearAll();
		} else {
			console.log("max zoom reached");
		}
	},

	zoomOut : function() {
		console.log("zoom out");
		if (this.getZoomLvl() > this.getZoomMin()) {
			this.setZoomLvl(this.getZoomLvl() - 1);
			this.setScale(this.getScale() / this.getScaleFactor());
			console.log("new zoomlvl: " + this.getZoomLvl());
			this.clearAll();
		} else {
			console.log("min zoom reached");
		}
	},
	
	setImage : function(dataUrl) {
		var newimage = new Image();
		var container = this;

		newimage.src = dataUrl;
		
		newimage.onload = function() {
			container.clearImage();
			container.setImageFile(newimage);
			container.clearAll();
		}
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
	}
});