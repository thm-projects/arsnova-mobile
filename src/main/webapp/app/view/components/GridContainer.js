Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',

	config : {
		gridSize : 5,
		imgSize : 400,
		canvas : null,
		imageFile : null,
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

	getElementKoord : function(x, y) {

		var canvas = this.getCanvas();
		var gridsize = this.getImgSize() / this.getGridSize();

		x -= canvas.getBoundingClientRect().left;
		y -= canvas.getBoundingClientRect().top;

		var xGrid = parseInt(x / gridsize);
		var yGrid = parseInt(y / gridsize);

		// +1 um Rasterlinie nicht zu überdecken
		var x1 = xGrid * gridsize + 1;
		var y1 = yGrid * gridsize + 1;

		return new Array(x1, y1);

	},

	createGrid : function() {

		var ctx = this.getCanvas().getContext("2d");
		var gridsize = this.getImgSize() / this.getGridSize();

		ctx.globalAlpha = 1;

		for (var i = 1; i < this.getGridSize(); i++) {
			ctx.fillStyle = "#000000";
			ctx.fillRect(gridsize * i, 0, 1, this.getImgSize());
			ctx.fillRect(0, gridsize * i, this.getImgSize(), 1);
		}
	},

	onclick : function(event) {

		var info = {};

		info.thiz = this;

		var canvas = document.getElementById("canvasWrapper");
		var ctx = canvas.getContext("2d");

		var container = this.parentContainer;
		var gridsize = container.getImgSize() / container.getGridSize();

		info.gridsize = gridsize;
		info.event = event;

		container.clearAll();
		container.createGrid();

		var x = event.clientX;
		var y = event.clientY;

		info.absolutKoord = {
			xKoord : x,
			yKoord : y
		};

		var gridKorrd = container.getElementKoord(x, y);

		info.gridKoord = {
			xKoord : gridKorrd[0],
			yKoord : gridKorrd[1]
		};

		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(gridKorrd[0], gridKorrd[1], gridsize - 1, gridsize - 1);

		// infoausgabe über clickevent
		console.log(info);

	},

	showGridElement : function(x1, y1, x2, y2) {
		var ctx = document.getElementById("canvasWrapper").getContext("2d");
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(x1, y1, x2, y2);
	},

});