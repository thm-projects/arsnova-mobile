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


	clearAll : function() {

		//TODO
	},

	getElementKoord : function(x, y) {

		//TODO

	},

	onclick : function(event) {

		var info = {};
		
		var canvas = document.getElementById("canvasWrapper");
		var ctx = canvas.getContext("2d");
		var gridsize = 400 / 5;
		
		ctx.globalAlpha = 1;
		
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
			
			
			x -= canvas.getBoundingClientRect().left;
			y -= canvas.getBoundingClientRect().top;
			
			
			info.offset = {left: canvas.getBoundingClientRect().left, top: canvas.getBoundingClientRect().top}
			info.relativKoord = {xKoord:x, yKoord:y};


			var xGrid = parseInt(x / gridsize);
			var yGrid = parseInt(y / gridsize);	
			
			
			info.whichGrid = {xCount:xGrid, yCount:yGrid};

			// +1 um Rasterlinie nicht zu überdecken
			var x1 = xGrid * gridsize+1;
			var y1 = yGrid * gridsize+1;
			
			info.gridKoord = {xKoord:x1, yKoord:y1};

			
			ctx.globalAlpha = 0.5;
			ctx.fillStyle = "#C0FFEE";
			ctx.fillRect(x1, y1, gridsize-1, gridsize-1);
			
			
			//infoausgabe über clickevent 
			console.log(info);
			
		}

		newimage.src = '../resources/images/planquadrat_test.jpg';
		
	},

	showGridElement : function(x1, y1, x2, y2) {
		var ctx = document.getElementById("canvasWrapper").getContext("2d");
		ctx.fillStyle = "#C0FFEE";
		ctx.fillRect(x1, y1, x2, y2);
	},

	
});