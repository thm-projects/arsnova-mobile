Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',

	config : {
		gridSize : 5,
		imgSize : 400,
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
		onFieldClick : null,
		mouseClicked : false,
		canvasOffsetX : 0,
		canvasOffsetY : 0,
		canvasMouseX : 0,
		canvasMouseY : 0
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
//		canvas.addEventListener("mouseup", this.onclickUp, false);
//		canvas.addEventListener("mousemove", this.onMove, false);
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

		this.setCanvasOffsetX(canvas.offsetLeft);
		this.setCanvasOffsetY(canvas.offsetTop);
		
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
		container.setCanvasMouseX(parseInt(event.clientX - container.getCanvasOffsetX()));
		container.setCanvasMouseY(parseInt(event.clientY - container.getCanvasOffsetY()));
		container.setMouseClicked(true);
		
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
		
		container.moveRight();
	},
	
	onclickUp : function(event) {
		var container = this.parentContainer;
		// register mouse release and position for further events
		container.setCanvasMouseX(parseInt(event.clientX - container.getCanvasOffsetX()));
		container.setCanvasMouseY(parseInt(event.clientY - container.getCanvasOffsetY()));
		container.setMouseClicked(false);
	},
	
	onMove : function(event) {
		var container = this.parentContainer;
		
		container.setCanvasMouseX(parseInt(event.clientX - container.getCanvasOffsetX()));
		container.setCanvasMouseY(parseInt(event.clientY - container.getCanvasOffsetY()));
		
		var rect = container.getCanvas().getBoundingClientRect();
		
//		console.log("event.clientX: " + event.clientX);
//		console.log("event.clientY: " + event.clientY);
//		console.log("rect.left: " + rect.left);
//		console.log("rect.top: " + rect.top);
//		console.log("canvasOffsetX: " + container.getCanvasOffsetX());
//		console.log("canvasOffsetY: " + container.getCanvasOffsetY());
//		console.log("canvasMouseX: " + container.getCanvasMouseX());
//		console.log("canvasMouseY: " + container.getCanvasMouseY());
		
		// only act when mouse is clicked during movement
		if (container.getMouseClicked()) {
//			var canvas = container.getCanvas();
//			var ctx = canvas.getContext("2d");
			container.clearAll(event.clientX - rect.left, event.clientY - rect.top);
//			ctx.clearRect(0, 0, canvas.width, canvas.height);
//			ctx.drawImage(container.getImageFile(), container.getCanvasMouseX() - 128 / 2, container.getCanvasMouseY() - 128 / 2);
		}
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

//	move : function(x, y) {
//		// TODO alternativ: hier die Berechnung der neuen x und y Werte, 
//		//		dann werden jedoch beide neu berechnet, auch wenn nur einer gebraucht wird.
//		this.clearAll(this.getMoveX(), this.getMoveY());
//	},
	
	moveRight : function() {
		// TODO linken Bildrand überprüfen --> Bild soll nur soweit verschoben werden,
		//		dass es am anderen Ende noch bündig ist.
		var moveX = this.getMoveX() + this.getMoveInterval();
		this.setMoveX(moveX);
//		this.move();
		this.clearAll();
	},
	
	moveLeft : function() {
		var moveX = this.getMoveX() - this.getMoveInterval();
		this.setMoveX(moveX);
//		this.move();
		this.clearAll();
	},
	
	moveUp : function() {
		var moveY = this.getMoveY() - this.getMoveInterval();
		this.setMoveY(moveY);
//		this.move();
		this.clearAll();
	},
	
	moveDown : function() {
		var moveY = this.getMoveY() + this.getMoveInterval();
		this.setMoveY(moveY);
//		this.move();
		this.clearAll();
	},
	
	zoom : function() {
		var ctx = this.getCanvas().getContext("2d");
//		if (this.getZoomLvl() == 0) {
//			ctx.scale(1, 1);
//		} else {
			ctx.scale(this.getScale(), this.getScale());
//		}
		// TODO zentrieren
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
	}
});