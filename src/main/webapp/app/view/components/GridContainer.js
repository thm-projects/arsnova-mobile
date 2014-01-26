Ext.define('ARSnova.view.components.GridContainer', {
	extend: 'Ext.Container',
	
	config: {
		gridSize: 5,
		imgSize: 400,
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.image = {
			xtype	: 'panel',
			cls		: null,
			html	: '<div id="grid-container"><img style="display: block; margin: 0 auto;" id="grid-image" src="../resources/images/planquadrat_test.jpg" usemap="grid"/>'
					  + this.createGrid() + '</div>',
		}

		// Alternativ: Dann ist das image jedoch nur ein css-background, kein img-Element mehr
//		this.image = {
//			xtype	: 'image',
//			src		: '../resources/images/planquadrat_test.jpg',
//			height	: 400,
//			usemap	: 'grid'
//		}
		
//		this.grid = {
//			xtype	: 'panel',
//			html	: this.createGrid()
//		}
		
		this.add([this.image]);
	},

	calculateGridElementSize: function() {
		return this.getImgSize() / this.getGridSize();
	},

	createGrid: function() {
		var elSize = this.calculateGridElementSize();
		var html = '<map name="grid">';
		
		// create all grid elements
		for (var i = 0; i < this.getGridSize(); i++) {
			for (var j = 0; j < this.getGridSize(); j++) {
				html += '<area id="field-' + (i + j + 1) + '" shape="rect" coords="' + (i * elSize) + ',' + (j * elSize) + ',' + elSize + ',' + elSize + '" href="javascript:alert(' + (i+j+1) + ');"/>';
			}
		}
		html += '</map>';
		return html;
	}
});