Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',
    xtype: 'canvas',

	config : {
		gridSize : 5,
		imgSize : 400,
		imgSizeHalf : 200, // TODO diesen Wert zu Beginn berechnen und zuweisen (im Konstruktor?)
		canvas : null,
		imageFile : null,
		borderWidth : 1,
		chosenFields : Array(),
		fieldColor : "#C0FFEE",
		borderColor : "#000000",
		scaleFactor : 1.2,
		scale : 1.0,
		zoomLvl : 0,
		zoomMin : 0,
		zoomMax : 5,
		moveX : 0,
		moveY : 0,
		moveInterval : 10,
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

		var newimage = new Image();
		var container = this;

		newimage.onload = function() {
			var ctx = canvas.getContext('2d');
			canvas.getContext('2d').drawImage(newimage, 0, 0);
			container.setImageFile(newimage);
			container.createGrid();
		}

		newimage.src = '../resources/images/planquadrat_test.jpg';

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
		ctx.clearRect(0, 0, this.getCanvas().width, this.getCanvas().height);
		ctx.globalAlpha = 1;

		this.zoom();
		ctx.drawImage(this.getImageFile(), this.getMoveX(), this.getMoveY());
		console.log('cleared.')
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

		// register mouse click and position for further events
//		container.setCanvasMouseX(parseInt(event.clientX - container.getCanvasOffsetX()));
//		container.setCanvasMouseY(parseInt(event.clientY - container.getCanvasOffsetY()));
//		container.setMouseClicked(true);
		
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
			container.createGrid();

			container.getChosenFields()
					.forEach(
							function(entry) {
								container.markField(entry[0],
										entry[1]);
							});
		}

		if (container.getOnFieldClick() != null) {
			container.getOnFieldClick()(
					container.getChosenFields().length);
		}
		
//		container.moveRight();
//		container.moveRight();
//		container.moveUp();
	},

	setGrids : function(count) {
		this.setChosenFields(Array());
		this.clearAll();
		this.setGridSize(count);
		this.createGrid();
		if (this.getOnFieldClick() != null) {
			this.getOnFieldClick()(
					this.getChosenFields().length);
		}
	},
	
	moveRight : function() {
		console.log("scaleFactor - 1: " + parseFloat(this.getScaleFactor() - 1));
		console.log("moveX: " + this.getMoveX());
		var scaled = parseFloat((this.getScaleFactor() - 1) * this.getZoomLvl());
		if (this.getMoveX() < scaled * this.getImgSize() / 2) {
			var moveX = this.getMoveX() + this.getMoveInterval() * scaled;
			this.setMoveX(moveX);
//			console.log("new moveX: " + moveX);
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
		if (this.getMoveX() * (-1) < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / 2) {
			var moveX = this.getMoveX() - this.getMoveInterval();
			this.setMoveX(moveX);
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
		if (this.getMoveY() * (-1) < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / 2) {
			var moveY = this.getMoveY() - this.getMoveInterval();
			this.setMoveY(moveY);
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
		if (this.getMoveY() < (this.getScaleFactor() - 1) * this.getZoomLvl() * this.getImgSize() / 2) {
			var moveY = this.getMoveY() + this.getMoveInterval();
			this.setMoveY(moveY);
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
	
	zoom : function() {
		// TODO automatisch verschieben, wenn wieder aus dem Bild rausgezoomt wird
		var ctx = this.getCanvas().getContext("2d");
//		if (this.getZoomLvl() == 0) {
//			ctx.scale(1, 1);
//		} else {
		var imgSizeHalf = this.getImgSizeHalf();
		ctx.translate(imgSizeHalf - (imgSizeHalf * this.getScale()), imgSizeHalf - (imgSizeHalf * this.getScale()));
		ctx.scale(this.getScale(), this.getScale());
//		}
	},

	zoomIn : function() {
		console.log("zoom in");
		if (this.getZoomLvl() < this.getZoomMax()) {
			this.setZoomLvl(this.getZoomLvl() + 1);
			this.setScale(1 * this.getScaleFactor());
			console.log("new zoomlvl: " + this.getZoomLvl());
			this.clearAll();
			this.setScale(1);
		} else {
			console.log("min zoom reached");
		}
	},

	zoomOut : function() {
		console.log("zoom out");
		if (this.getZoomLvl() > this.getZoomMin()) {
			this.setZoomLvl(this.getZoomLvl() - 1);
			this.setScale(1 / this.getScaleFactor());
			console.log("new zoomlvl: " + this.getZoomLvl());
			this.clearAll();
			this.setScale(1);
		} else {
			console.log("min zoom reached");
		}
	},
	
	setImage : function(dataUrl) {
		var newimage = new Image();
		var canvas = this.getCanvas();
		
		// set new image url
		newimage.src = dataUrl;
		
		// clear and redraw canvas
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		canvas.getContext('2d').drawImage(newimage, 0, 0);
		this.setImageFile(newimage);
		this.createGrid();

	}
});