Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',

	config : {
		gridSize : 5,
		imgSize : 400,
		canvas : null,
		imageFile : null,
		gridWidth : 1,
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
		ctx.drawImage(this.getImageFile(), 0, 0);
		console.log('cleared.')
	},

	getFieldKoord : function(x, y) {

		var canvas = this.getCanvas();

		x -= canvas.getBoundingClientRect().left;
		y -= canvas.getBoundingClientRect().top;

		var xGrid = parseInt(x / this.getFieldSize());
		var yGrid = parseInt(y / this.getFieldSize());

		// +1 um Rasterlinie nicht zu überdecken
		var x1 = xGrid * this.getFieldSize() + 2 * this.getGridWidth();
		var y1 = yGrid * this.getFieldSize() + 2 * this.getGridWidth();

		return new Array(x1, y1);

	},

	getFieldSize : function() {
		return (this.getImgSize() - 2 * this.getGridWidth())
				/ this.getGridSize();
	},

	createGrid : function() {

		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 1;
		ctx.fillStyle = "#000000";

		// rand
		ctx.fillRect(0, 0, this.getGridWidth(), this.getImgSize());
		ctx.fillRect(0, 0, this.getImgSize(), this.getGridWidth());
		ctx.fillRect(this.getImgSize() - this.getGridWidth(), 0, this
				.getGridWidth(), this.getImgSize());
		ctx.fillRect(0, this.getImgSize() - this.getGridWidth(), this
				.getImgSize(), this.getGridWidth());

		// innengatter
		for (var i = 1; i < this.getGridSize(); i++) {
			ctx.fillRect(this.getFieldSize() * i + this.getGridWidth(), 0, this
					.getGridWidth(), this.getImgSize());
			ctx.fillRect(0, this.getFieldSize() * i + this.getGridWidth(), this
					.getImgSize(), this.getGridWidth());
		}
	},

	markField : function(x, y) {

		var ctx = this.getCanvas().getContext("2d");

		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(x, y, this.getFieldSize() - this.getGridWidth(), this
				.getFieldSize()
				- this.getGridWidth());
	},

	onclick : function(event) {

		var info = {};

		info.thiz = this;
		info.event = event;

		var canvas = document.getElementById("canvasWrapper");
		var ctx = canvas.getContext("2d");
		var container = this.parentContainer;

		container.clearAll();
		container.createGrid();

		var x = event.clientX;
		var y = event.clientY;

		info.absolutKoord = {
			xKoord : x,
			yKoord : y
		};

		var gridKorrd = container.getFieldKoord(x, y);

		info.gridKoord = {
			xKoord : gridKorrd[0],
			yKoord : gridKorrd[1]
		};

		container.markField(gridKorrd[0], gridKorrd[1]);

		// infoausgabe über clickevent
		console.log(info);

	},

	showGridElement : function(x1, y1, x2, y2) {
		var ctx = document.getElementById("canvasWrapper").getContext("2d");
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(x1, y1, x2, y2);
	},

});