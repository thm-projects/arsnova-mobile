/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel für die Frageform: Planquadrat
 - Autor(en):    Artjom Siebert <artjom.siebert@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/

Ext.define('ARSnova.view.speaker.form.GridQuestion', {
	extend : 'Ext.Container',
	
	// identifier
	xtype: 'grid',
	
	requires: [
	           'Ext.ux.Fileup'	// file upload framework
	           ],

	imageArea 		 : null,		// contains all image relevant items
	grid 			 : null,		// encapsulated canvas element
	imageCnt		 : null,		// image manipulation options
	imageSettings 	 : null,		// the image settings (offset, zoom,...)
	uploadView 		 : null,		// view containing the upload options
	answers 		 : null,

	/**
	 * Initializes the grid question area and the needed
	 * form elements.
	 */
	initialize : function() {
		var me = this;
		this.callParent(arguments);

		this.grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked 	: 'top',
			id 		: 'gridContainer'
		});
		
		this.imageArea = Ext.create('Ext.Panel', {
			id : 'imageArea',
			layout : 'hbox',
			items : [ 
			    this.grid, 
			    {
					xtype: 'button',
			    	iconCls : 'delete',
			    	iconMask : true,
			    	docked : 'right',
			    	handler : function(){ me.resetView(); }
				},
			    {
			    	xtype : 'button',
			    	iconCls : 'info',
			    	iconMask : true,
			    	docked : 'right'
			    },
			    {
			    	xtype : 'button',
			    	iconCls : 'reply',
			    	iconMask : true,
			    	docked : 'right',
			    	handler : function(){ me.grid.toggleBorderColor(); }
			    },
			    {
					xtype: 'button',
			    	iconCls : 'arrow_left',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { me.grid.moveLeft(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_up',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { me.grid.moveUp(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_down',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { me.grid.moveDown(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_right',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { me.grid.moveRight(); }
				}],
			hidden : true
		});


		/**
		 * The view containing the url textfield and the
		 * functionality to load an image into the canvas
		 */
		this.uploadView = Ext.create('Ext.Panel', {
			id : 'upField',
			layout : 'vbox',

			items : [ {
				id : 'fs_upfield',
				xtype : 'fieldset',
				title : Messages.EDIT_PICTURE,
				docked : 'top',
			}, {
				id : 'pnl_upfield',
				xtype : 'panel',
				layout : 'vbox',
				items : [ {
					id : 'tf_url',
					xtype : 'textfield',
					label : Messages.SELECT_PICTURE_FS,
					name : 'tf_url',
					placeHolder : 'http://',
					docked : 'top',
				}, {
					xtype : 'spacer',
					height : 50,
					docked : 'top'
				}, {
					docked : 'bottom',
					xtype : 'panel',
					layout : 'hbox',
					defaults : {
						flex : 1
					},
					items : [{
					    itemId: 'imageToCanvasButton',
					    xtype: 'fileupload',
					    autoUpload: true,
					    loadAsDataUrl: true,
					    states: {
					        browse: {
					            text: Messages.SEARCH_PICTURE
					        },
					        ready: {
					            text: Messages.LOAD
					        },
					
					        uploading: {
					            text: Messages.LOADING,
					            loading: true
					        }
					    }
					}, {
						xtype : 'spacer',
					}, {
						xtype : 'button',
						text : Messages.SELECT_PICTURE_URL,
						handler : this.updateCanvasWithUrl
					} ]
				} ]
			}, {
				xtype : 'spacer',
				height : 100,
				docked : 'bottom'
			} ]
		});

		this.answers = Ext.create('Ext.Panel', {
			items : [ {
				xtype : 'fieldset',
				id : 'fs_answers',
				name : 'fs_answers',
				title : Messages.CORRECT_ANSWERS,
				items : [ {
					xtype : 'textfield',
					id : 'tf_answers',
					label : Messages.COUNT,
					name : Messages.COUNT,
					placeHolder : '0',
					readOnly : true 
				}]
			} ]
		});

		this.imageSettings = Ext.create('Ext.Panel', {
			id : 'answerField',
			items : [ 
			         {
						xtype : 'fieldset',
						id : 'fs_imagesettings',
						title : Messages.SETTINGS,
						items : [ {
							xtype : 'spinnerfield',
							id : 'sf_zoom',
							label : Messages.GRID_LABEL_ZOOM,
							listeners : {
								spinup : function() {
									me.grid.zoomIn();
								},
								spindown : function() {
									me.grid.zoomOut();
								}
		
							},
							value : 100,
							stepValue : 20
							}, {
								xtype : 'spinnerfield',
								id : 'sf_grids',
								label : Messages.GRID_LABEL_SQUARES,
								listeners : {
									spin : function(spinner, value) {
										me.grid.setGrids(value); // update grid count
									}
								},
								minValue : 2,
								maxValue : 16,
								value : 5,
								stepValue : 1,
								cycle : true,
							},
						this.answers
						]
			} ]
		});

		this.imageCnt = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			id : 'imageControle',
			hidden : true,
			items : [ this.imageSettings ]
		});

		// update answers counter
		this.grid.setOnFieldClick(function(answerValue) {
			me.answers.getComponent('fs_answers').getComponent('tf_answers').setValue(answerValue);
		});

		this.add([{
			xtype : 'fieldset',
			title : ' ',
			items : [ 
			          this.imageArea, 
			          this.uploadView,
			          this.imageCnt 
			        ]
		}]);

	},
	
	initWithQuestion : function(question) {

		var possibleAnswers = question.possibleAnswers;

		if (possibleAnswers.length === 0) {
			return;
		}
	},
	
	/**
	 * Interface to the grid element to set a new image.
	 */
	updateCanvas : function(dataUrl, reload) {
		// update canvas
		this.grid.setImage(dataUrl, reload);	
		
		// show picture
		this.toggleViews();
	},
	
	/**
	 * Gets the value of the url textfield and forwards it to the
	 * update canvas method.
	 */
	updateCanvasWithUrl : function() {
		var url = this.up('grid').uploadView.getComponent('pnl_upfield').getComponent('tf_url').getValue();
		console.log("url: " + url);
		console.log(this);
		console.log(this);
		
		if (url) {
			this.up('grid').updateCanvas(url, true);
		} else {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_URL_MISSING);
		}
		
	},
	
	/**
	 * Toggles between the image view and the upload view
	 */
	toggleViews : function() {	
		this.imageArea.isHidden()	? this.imageArea.show()		: this.imageArea.hide();
		this.imageCnt.isHidden()	? this.imageCnt.show()		: this.imageCnt.hide();
		this.uploadView.isHidden()	? this.uploadView.show()	: this.uploadView.hide();
	},

	/**
	 * Resets the image view to the initial state.
	 */
	resetView : function() {
		this.toggleViews();
		this.grid.clearImage();
		this.clearTextfields();
	},
	
	clearTextfields : function() {
		var zoomField 	= this.imageSettings.getComponent('fs_imagesettings').getComponent('sf_zoom');
		var gridField 	= this.imageSettings.getComponent('fs_imagesettings').getComponent('sf_grids');
		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');
		var urlField 	= this.uploadView.getComponent('pnl_upfield').getComponent('tf_url');
		
		zoomField.setValue(100);
		gridField.setValue(5);
		answerField.setValue(0);
		urlField.setValue("");
		
	},
	
	/**
	 * Gets all relevant informations which have to be send to the backend.
	 * 
	 * Hint: If the canvas contains an image gotten from url we cannot access the
	 * Base64 of the image in the client due to CORS denial. The image will be
	 * transfered as a URL an will be converted directly on the server.
	 */
	getQuestionValues: function() {
		var result = {};
		
		// get image data
		result.image 	 	   = this.grid.getImageFile().src;
		result.gridSize 	   = this.grid.getGridSize();
		result.offsetX  	   = this.grid.getOffsetX();
		result.offsetY 		   = this.grid.getOffsetY();
		result.zoomLvl 		   = this.grid.getZoomLvl();
		result.possibleAnswers = this.grid.getPossibleAnswersFromChosenFields();
		result.noCorrect 	   = this.grid.getChosenFields().length > 0 ? 0 : 1; // TODO: Check if really needed (and why numbers instead of bool)

		return result;
	},
	
	updateGrid: function(gridSize, offsetX, offsetY, zoomLvl, possibleAnswers, mark) {
		this.grid.update(gridSize, offsetX, offsetY, zoomLvl, possibleAnswers, mark);
	}
});