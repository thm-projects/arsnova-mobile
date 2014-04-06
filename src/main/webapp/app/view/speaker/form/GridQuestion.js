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

	imageArea 		 	: null,		// contains all image relevant items
	grid 			 	: null,		// encapsulated canvas element
	imageCnt		 	: null,		// image manipulation options
	imageSettings 	 		: null,		// the image settings (offset, zoom,...)
	uploadView 		 	: null,		// view containing the upload options
	answers 		 	: null,
	buttonUploadFromFS		: null,
	zoomSpinner 			: null,
	gridSpinner 			: null,
	btnMoveLeft			: null,
	btnMoveRight			: null,
	btnMoveUp			: null,
	btnMoveDown			: null,
	InfoButton			: null,
    	InfoPanel			: null,
    gridColorsToggle 	: null,

	/**
	 * Initializes the grid question area and the needed
	 * form elements.
	 */
	initialize : function() {
		var me = this;
		this.callParent(arguments);

		this.grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked 	: 'top',
			id 	: 'gridContainer'
		});
		
		this.InfoPanel = Ext.create('Ext.Panel',{
			height: '20%',
			html: Messages.SETTINGS_HINT_TEXT,
			left: '50%',
			padding: 20,
			top: '30%',
			width: '40%',
			hideOnMaskTap: true,
			modal: true		
		});
		
		 this.InfoButton = Ext.create('Ext.Button',{
			iconCls : 'info',
			iconMask : true,
			handler : function(){ me.onInfoButton();}
		});

		this.btnMoveLeft = Ext.create('Ext.Button', {
			iconCls : 'arrow_left',
			iconMask : true
		});
		
		this.btnMoveRight = Ext.create('Ext.Button', {
			iconCls : 'arrow_right',
			iconMask : true
		});
		
		this.btnMoveUp = Ext.create('Ext.Button', {
			iconCls : 'arrow_up',
			iconMask : true
		});
		
		this.btnMoveDown = Ext.create('Ext.Button', {
			iconCls : 'arrow_down',
			iconMask : true
		});
		
		this.imageArea = Ext.create('Ext.Panel', {
			id : 'imageArea',
			layout :{
				type: 'vbox',
                align: 'center',
                pack: 'center'
			}, 
			items : [ 
				this.grid,
				{
					xtype: 'panel',
					layout:{
						type: 'hbox',
						align: 'center',
						pack: 'center'
					},
					items : [
						this.InfoButton,
						this.btnMoveLeft,
						this.btnMoveRight,
						this.btnMoveUp,
						this.btnMoveDown,
						{
							xtype: 'button',
							iconCls : 'delete',
							iconMask : true,
							handler : function(){ me.resetView(); }
						}
			       ]
			   }
			],
			hidden : true
		});
		
		// initialize tap repeater for move buttons
		// TapRepeater for left button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveLeft.bodyElement
		}).on('tap', function() {
			me.grid.moveLeft();
		}, me);

		// TapRepeater for right button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveRight.bodyElement
		}).on('tap', function() {
			me.grid.moveRight();
		}, me);
		
		// TapRepeater for up button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveUp.bodyElement
		}).on('tap', function() {
			me.grid.moveUp();
		}, me);
		
		// TapRepeater for down button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveDown.bodyElement
		}).on('tap', function() {
			me.grid.moveDown();
		}, me);
		
		// button: load from filesystem
		this.buttonUploadFromFS = Ext.create('Ext.ux.Fileup', {
		    itemId			: 'buttonUploadFromFS',
		    xtype			: 'fileupload',
		    autoUpload		: true,
		    loadAsDataUrl	: true,
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
		    },
		    listeners: {
		    	loadsuccess: function(dataurl, e) {
		    		me.updateCanvas(dataurl, true);
		    	},
			    loadfailure: function(message) {
					Ext.Msg.alert(Messages.ERROR, Messages.GRID_ERROR_LOADING_IMAGE_FS);
					console.log("Error while loading image: " + message);
			    }
		    }
		    
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
					items : [
						this.buttonUploadFromFS
						, {
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
		
		this.zoomSpinner = Ext.create('Ext.field.Spinner', {
			xtype : 'spinnerfield',
			label : Messages.GRID_LABEL_ZOOM,
			listeners : {
				spinup : function() {
					me.grid.zoomIn();
				},
				spindown : function() {
					me.grid.zoomOut();
				}

			},
			value : this.grid.getZoomLvl(),
			stepValue : this.grid.getScaleFactor()
		});
		
		this.gridSpinner = Ext.create('Ext.field.Spinner', {
			xtype : 'spinnerfield',
			label : Messages.GRID_LABEL_SQUARES,
			listeners : {
				spin : function(spinner, value) {
					me.grid.setGrids(value); // update grid count
				}
			},
			minValue : 2,
			maxValue : 16,
			value :  this.grid.getGridSize(),
			stepValue : 1,
			cycle : true,
		
		});
		
		this.gridColorsToggle = Ext.create('Ext.field.Toggle', {
			label:		Messages.GRID_LABEL_INVERT_GRIDCOLORS,
			value:  	false
		});

		this.imageSettings = Ext.create('Ext.Panel', {
			id : 'answerField',
			items : [{
				xtype : 'fieldset',
				id : 'fs_imagesettings',
				title : Messages.SETTINGS,
				items : [
				         this.zoomSpinner,
				         this.gridSpinner,
				         this.gridColorsToggle,
				         this.answers
				         ]
			}]
		});

		this.imageCnt = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			id : 'imageControle',
			hidden : true,
			items : [ this.imageSettings ]
		});
	
		
		var toggleColorListener =  {
		        beforechange: function (slider, thumb, newValue, oldValue) {
		        	me.grid.toggleBorderColor();
		        },
		        change: function (slider, thumb, newValue, oldValue) {
		        	me.grid.toggleBorderColor(); 
		        }
		};
		this.gridColorsToggle.setListeners(toggleColorListener);
		

		// update answers counter
		this.grid.setOnFieldClick(function(answerValue) {
			me.answers.getComponent('fs_answers').getComponent('tf_answers').setValue(answerValue);
		});
		
		this.buttonUploadFromFS.on({
			loadsuccess: 'onFileLoadSuccess',
		    loadfailure: 'onFileLoadFailure'
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
		this.showImageView();
	},
	
	/**
	 * Gets the value of the url textfield and forwards it to the
	 * update canvas method.
	 */
	updateCanvasWithUrl : function() {
		var url = this.up('grid').uploadView.getComponent('pnl_upfield').getComponent('tf_url').getValue();
		
		if (url) {
			this.up('grid').updateCanvas(url, true);
		} else {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_URL_MISSING);
		}
		
	},

	/**
	 * Handler function for the event of info button
	 */
	onInfoButton : function(){
		this.InfoPanel.showBy(this.InfoButton);
	},
	
	/**
	 * Shows the image view and hides the upload view.
	 */
	showImageView : function() {
		this.imageArea.show();
		this.imageCnt.show();
		this.uploadView.hide();
	},
	
	/**
	 * Shows the upload view and hides the image view.
	 */
	showUploadView : function() {
		this.imageArea.hide();
		this.imageCnt.hide();
		this.uploadView.show();
	},

	/**
	 * Resets the image view to the initial state.
	 */
	resetView : function() {
		this.showUploadView();
		this.grid.clearImage();
		this.clearTextfields();
		// TODO clear spinners (zoom, gridsize)
		// Ich denke das dies hier nicht noetig ist, da diese FUnktion nur ausgeführt wird,
		// wenn das Bild abgebrochen wird um ein neues zu laden!
	},
	
	clearTextfields : function() {
		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');
		var urlField 	= this.uploadView.getComponent('pnl_upfield').getComponent('tf_url');
		
		this.zoomSpinner.setValue(this.grid.getZoomLvl());
		this.gridSpinner.setValue(this.grid.getGridSize());
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
		if (this.grid.getImageFile()) {
			result.image 	 	   = this.grid.getImageFile().src;	
		}
		result.gridSize 	   = this.grid.getGridSize();
		result.offsetX  	   = this.grid.getOffsetX();
		result.offsetY 		   = this.grid.getOffsetY();
		result.zoomLvl 		   = this.grid.getZoomLvl();
		result.possibleAnswers = this.grid.getPossibleAnswersFromChosenFields();
		result.noCorrect 	   = this.grid.getChosenFields().length > 0 ? 0 : 1; // TODO: Check if really needed (and why numbers instead of bool)

		return result;
	},
	
	/**
	 * Initializes the GridQuestion with the values from the given question.
	 * 
	 * @param question		The questionObj providing all necessary information.
	 */
	initWithQuestion : function(question) {
		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');
		
		// set image data (base64 --> grid)
		this.updateCanvas(question.image, false);
		
		this.grid.update(question.gridSize, question.offsetX, 
				question.offsetY, question.zoomLvl, question.possibleAnswers, true);
		
		answerField.setValue(this.grid.getChosenFields().length);		//set the spinner with correct values (last storage)
		this.zoomSpinner.setValue(this.grid.getZoomLvl());
		this.gridSpinner.setValue(this.grid.getGridSize());
	}
});
