Ext.define('ARSnova.view.components.GridContainer', {
	extend : 'Ext.Container',

	config : {
		gridSize : 5,
		imgSize : 400,
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

		var newimage = new Image();

		newimage.onload = function() {
			canvas.getContext('2d').drawImage(newimage, 0, 0);
			var ctx = canvas.getContext("2d");
			
			
			for( var i = 1; i<5; i++){
				ctx.fillStyle = "#000000";
				ctx.fillRect(400/5*i, 0, 1, 400);
				ctx.fillRect(0, 400/5*i, 400, 1);
			}
		}

		newimage.src = '../resources/images/planquadrat_test.jpg';

		this.image = {
			xtype : 'panel',
			cls : null,
			html : canvas,
		}

		this.add([ this.image ]);
	},

	calculateGridElementSize : function() {
		return this.getImgSize() / this.getGridSize();
	},

	clearAll : function() {

		var ctx = document.getElementById("canvasWrapper").getContext("2d");

		// Use the identity matrix while clearing the canvas
		// http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	},

	getElementKoord : function(x, y) {

		var xGrid = x / this.getGridSize();
		var yGrid = y / this.getGridSize();

		var x1 = xGrid * this.getGridSize();
		var y1 = yGrid * this.getGridSize();

		var x2 = x1 + this.getGridSize() - 1;
		var y2 = y1 + this.getGridSize() - 1;

		return new Array(x1, y1, x2, y2);

	},

	onclick : function(event) {

		var info = {};
		
		var canvas = document.getElementById("canvasWrapper");
		var ctx = canvas.getContext("2d");
		var gridsize = 400 / 5;
		
		info.gridsize = gridsize;
		info.event = event;
		
		// Use the identity matrix while clearing the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		var newimage = new Image();

		newimage.onload = function() {
			canvas.getContext('2d').drawImage(newimage, 0, 0);
			
			for( var i = 1; i<5; i++){
				ctx.fillStyle = "#000000";
				ctx.fillRect(gridsize*i, 0, 1, 400);
				ctx.fillRect(0, gridsize*i, 400, 1);
			}
			
			var x = event.clientX;
			var y = event.clientY;
			
			info.absolutKoord = { xKoord: x, yKoord:y};
			
			
			x -= canvas.offsetLeft;
			/*y -= canvas.offsetTop;*/ y -= 280;
			
			
			info.offset = {left: canvas.offsetLeft, top: canvas.offsetTop}
			info.relativKoord = {xKoord:x, yKoord:y};


			var xGrid = parseInt(x / gridsize);
			var yGrid = parseInt(y / gridsize);	
			
			
			info.whichGrid = {xCount:xGrid, yCount:yGrid};

			
			var x1 = xGrid * gridsize;
			var y1 = yGrid * gridsize;
			
			info.gridKoord = {xKoord:x1, yKoord:y1};

			ctx.fillStyle = "#C0FFEE";
			ctx.fillRect(x1, y1, gridsize, gridsize);
			
			
			//infoausgabe über clickevent 
			//console.log(JSON.stringify(info));
			console.log(info);

			
		}

		newimage.src = '../resources/images/planquadrat_test.jpg';
		
		

		
	},

	showGridElement : function(x1, y1, x2, y2) {
		var ctx = document.getElementById("canvasWrapper").getContext("2d");
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(x1, y1, x2, y2);
	},

	createGrid : function() {
		var elSize = this.calculateGridElementSize();
		var html = '<map name="grid">';

		var k = 1;

		// create all grid elements
		for (var i = 0; i < this.getGridSize(); i++) {
			for (var j = 0; j < this.getGridSize(); j++) {
				html += '<area id="field-' + (k) + '" shape="rect" coords="'
						+ (i * elSize) + ',' + (j * elSize) + ','
						+ ((i * elSize) + elSize) + ','
						+ ((j * elSize) + elSize) + '" href="javascript:alert('
						+ (k) + ');"/>';
				k++;
			}
		}
		html += '</map>';
		return html;
	}
});