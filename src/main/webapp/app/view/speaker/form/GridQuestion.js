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
	
	config : {
		
	},

	constructor : function() {
		this.callParent(arguments);
		

		var grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked : 'top',
			id : 'gridContainer'

		});

		// Panel for picture and settings
		var imageArea = Ext.create('Ext.Panel', {
			id : 'imageArea',
			layout : 'hbox',
			items : [ 
			    grid, 
			    {
					xtype: 'button',
			    	iconCls : 'delete',
			    	iconMask : true,
			    	docked : 'right',
					handler: this.resetView
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
			    	handler : function(){ grid.toggleBorderColor(); }
			    },
			    {
					xtype: 'button',
			    	iconCls : 'arrow_left',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { grid.moveLeft(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_up',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { grid.moveUp(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_down',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { grid.moveDown(); }
				}, {
					xtype: 'button',
			    	iconCls : 'arrow_right',
			    	iconMask : true,
			    	docked : 'right',
					handler: function() { grid.moveRight(); }
				}],
			hidden : true
		});


		/**
		 * The view containing the url textfield and the
		 * functionality to load an image into the canvas
		 */
		var uploadView = Ext.create('Ext.Panel', {
			id : 'upField',
			layout : 'vbox',

			items : [ {
				xtype : 'fieldset',
				title : Messages.EDIT_PICTURE,
				docked : 'top',
			}, {
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
		
		
		var answers = Ext.create('Ext.Panel', {
			items : [ {
				xtype : 'fieldset',
				id : 'fieldsetAnswers',
				title : Messages.CORRECT_ANSWERS,
				items : [ {
					xtype : 'textfield',
					id : 'textfieldAnswers',
					label : Messages.COUNT,
					name : Messages.COUNT,
					placeHolder : '0',
					readOnly : true
				} ]
			} ]
		});

		var imageSettings = Ext.create('Ext.Panel', {
			id : 'answerField',
			items : [ 
			         {
						xtype : 'fieldset',
						title : Messages.SETTINGS,
						items : [ {
							xtype : 'spinnerfield',
							label : 'Zoom (in %)',
							listeners : {
								spinup : function() {
									grid.zoomIn();
								},
								spindown : function() {
									grid.zoomOut();
								}
		
							},
							minValue : 100,
							maxValue : 200,
							value : 100,
							stepValue : 20
						// cycle : true
						}, {
							xtype : 'spinnerfield',
							label : 'Quadrate (Breiten x Höhe)',
							listeners : {
								spin : function() {
									grid.setGrids(this.getValue()); // update grid count
								}
							},
							minValue : 2,
							maxValue : 16,
							value : 5,
							stepValue : 1,
							cycle : true,
						},
						answers
						]
			} ]
		});

		var imageCnt = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			id : 'imageControle',
			hidden : true,
			items : [ imageSettings ]
		});

		// update answers counter
		grid.setOnFieldClick(function(AnswerValue) {
			var cnt = Ext.getCmp('textfieldAnswers');
			cnt.setValue(AnswerValue);
			console.log(AnswerValue);

		});

		this.add([ {
			xtype : 'fieldset',
			title : ' ',
			items : [ 
			          imageArea, 
			          uploadView,
			          imageCnt ]
		} ]);

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
	updateCanvas : function(dataUrl) {
		// update canvas
		Ext.getCmp('gridContainer').setImage(dataUrl);	
		
		// show picture
		this.toggleViews();
	},
	
	/**
	 * Gets the value of the url textfield and forwards it to the
	 * update canvas method.
	 */
	updateCanvasWithUrl : function() {
		var url = Ext.ComponentQuery.query('#tf_url')[0].getValue();
		
		if (url) {
			Ext.getCmp('grid').updateCanvas(url);
		} else {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_URL_MISSING);
		}
		
	},
	
	/**
	 * Toggles between the two view possibilities.
	 */
	toggleViews : function() {
		Ext.getCmp('imageArea').isHidden() 	   ? Ext.getCmp('imageArea').show() 	 : Ext.getCmp('imageArea').hide();
		Ext.getCmp('imageControle').isHidden() ? Ext.getCmp('imageControle').show() : Ext.getCmp('imageControle').hide();
		Ext.getCmp('upField').isHidden() 	   ? Ext.getCmp('upField').show() 		 : Ext.getCmp('upField').hide();
	},

	/**
	 * Resets the view to the initial state.
	 */
	resetView : function() {
		var self = Ext.getCmp('grid');
		self.toggleViews();
		Ext.getCmp('gridContainer').clearImage();
	},
	
	/**
	 * Gets all relevant informations which have to 
	 * be send to the backend.
	 */
	getQuestionValues: function() {
		var grid   = Ext.getCmp('gridContainer')
		var result = {};
		
		// get image data
		result.image 	 	   = grid.getImageFile().src;
		result.gridSize 	   = grid.getGridSize();
		result.offsetX  	   = grid.getOffsetX();
		result.offsetY 		   = grid.getOffsetY();
		result.zoomLvl 		   = grid.getZoomLvl();
		result.chosenFields    = grid.getChosenFields();
		result.noCorrect 	   = grid.getChosenFields().length > 0 ? 0 : 1; // TODO: Check if really needed (and why numbers instead of bool)

		return result;
	},
	
	
});