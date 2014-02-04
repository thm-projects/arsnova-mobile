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
		scaleFactor : 1,
		zoomLvl : 1.2,
		zoomMin : 200, // min und max zoom in pixel
		zoomMax : 800,
		onFieldClick : null
	},

	constructor : function() {
		this.callParent(arguments);

		var canvas = document.createElement('canvas');
		canvas.id = 'canvasWrapper';
		canvas.width = this.getImgSize();
		canvas.height = this.getImgSize();
		canvas.style.display = 'block';
		canvas.style.margin = '0 auto';
		canvas.addEventListener("mousedown", this.onclick,
				false);
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
		ctx.clearRect(0, 0, this.getCanvas().width, this
				.getCanvas().height);
		ctx.globalAlpha = 1;
		this.zoom();
		//TODO zentrieren
		ctx.drawImage(this.getImageFile(), 0, 0);
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
		
		// zu Testzwecken
		// container.zoomOut();
	},
	
	setGrids : function(count){
		this.setChosenFields( Array() );
		this.clearAll();
		this.setGridSize(count);
		this.createGrid();
	},
	
	zoom: function() {
		var ctx = this.getCanvas().getContext("2d");
		ctx.scale(this.getScaleFactor(), this.getScaleFactor());
	},
	
	zoomIn: function() {
		// TODO mit max zoom vergleichen
		// image size * scaleFactor > max zoom --> nichts tun
		this.setScaleFactor(this.getScaleFactor() * this.getZoomLvl());
		this.clearAll();
	},
	
	zoomOut: function() {
		// TODO mit min zoom vergleichen
		// image size * scaleFactor < min zoom --> nichts tun
		this.setScaleFactor(this.getScaleFactor() / this.getZoomLvl());
		this.clearAll();
	}
});