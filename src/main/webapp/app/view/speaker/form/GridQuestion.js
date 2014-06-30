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
	imageSettings 	 	: null,		// the image settings (offset, zoom,...)
	uploadView 		 	: null,		// view containing the upload options
	answers 		 	: null,
	buttonUploadFromFS	: null,
	zoomSpinner 		: null,
	gridXSpinner 		: null,
	gridYSpinner 		: null,
	btnMoveLeft			: null,
	btnMoveRight		: null,
	btnMoveUp			: null,
	btnMoveDown			: null,
	btnZoomInGrid		: null,
    btnZoomOutGrid		: null,
    btnMoveGridLeft		: null,
    btnMoveGridRight	: null,
    btnMoveGridUo		: null,
    btnMoveGridDown		: null,
	infoButton			: null,
    infoPanel			: null,
    gridColorsToggle 	: null,
    deleteButton		: null,
    rotateButton		: null,
    hideGridButton		: null,
    
    
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

		this.infoPanel = Ext.create('Ext.Panel',{
			cls: 'infoPanel',
			html: Messages.SETTINGS_HINT_TEXT,
			hideOnMaskTap: true,
			modal: true
		});

		 this.infoButton = Ext.create('Ext.Button',{
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

		this.deleteButton = Ext.create('Ext.Button',{
			iconCls : 'delete',
			iconMask : true,
			handler : function(){ me.resetView(); }
		});
		
		this.rotateButton = Ext.create('Ext.Button',{
			iconCls : 'refresh',
			iconMask : true,
			handler : function(){
				me.grid.spinRight();
			}
		});
		
		this.btnZoomInGrid = Ext.create('Ext.Button', {
			iconCls : 'add',
			iconMask : true,
			handler : function(){ me.grid.zoomInGrid(); }
		});
		
		this.btnZoomOutGrid = Ext.create('Ext.Button', {
			iconCls : 'minus2',
			iconMask : true,
			handler : function(){ me.grid.zoomOutGrid(); }
		});
		
		this.btnMoveGridLeft = Ext.create('Ext.Button', {
			iconCls : 'arrow_left',
			iconMask : true,
			handler : function(){ me.grid.moveGridLeft(); }
		});

		this.btnMoveGridRight = Ext.create('Ext.Button', {
			iconCls : 'arrow_right',
			iconMask : true,
			handler : function(){ me.grid.moveGridRight(); }
		});

		this.btnMoveGridUp = Ext.create('Ext.Button', {
			iconCls : 'arrow_up',
			iconMask : true,
			handler : function(){ me.grid.moveGridUp(); }
		});

		this.btnMoveGridDown = Ext.create('Ext.Button', {
			iconCls : 'arrow_down',
			iconMask : true,
			handler : function(){ me.grid.moveGridDown(); }
		});
		
		this.hideGridButton = Ext.create('Ext.Button',{
			iconCls : 'delete',
			iconMask : true,
			handler : function(){ 
				me.grid.setGridIsHidden( !me.grid.getGridIsHidden()); 
				me.grid.redraw();
			}
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
					xtype: 'label',
					html: Messages.GRID_CONFIG_IMAGE
			    },
				{
					xtype: 'panel',
					layout:{
						type: 'hbox',
						align: 'center',
						pack: 'center'
					},
					items : [
					    
						this.infoButton,
						this.btnMoveLeft,
						this.btnMoveRight,
						this.btnMoveUp,
						this.btnMoveDown,
						this.deleteButton,
						this.rotateButton
			       ]
			   },			   
			   {
					xtype: 'label',
					html: Messages.GRID_CONFIG_GRID,
					style: "margin-top: 15px"
				},
			   {
					xtype: 'panel',
					layout:{
						type: 'hbox',
						align: 'center',
						pack: 'center'
					},
					items : [
						this.btnZoomInGrid,
						this.btnZoomOutGrid,
						this.btnMoveGridLeft,
						this.btnMoveGridRight,
						this.btnMoveGridUp,
						this.btnMoveGridDown,
						this.hideGridButton,
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
				docked : 'top'
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
					docked : 'top'
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
						xtype : 'spacer'
					}, {
						xtype : 'button',
						text : Messages.SELECT_PICTURE_URL,
						handler : this.updateCanvasWithUrl
					} ]
				} ]
			}]
		});

		this.answers = Ext.create('Ext.Panel', {
			items : [ {
				xtype : 'fieldset',
				id : 'fs_answers',
				style: 'margin-bottom: 0',
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
		
		
		this.questionValueFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWER_POINTS,
			hidden: true
		});

		var questionValueOptions = {
			minValue: -10,
			maxValue: 10,
			value: 0,
			increment: 1
		};
		
		this.ValueOfCorrectAnswers=Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
			label: Messages.GRID_LABEL_THRESHOLD_CORRECT_ANSWERS
		}));
		
		this.correctValueComponent = Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
			label: Messages.ANSWER_POINTS_CORRECT
		}));
		this.incorrectValueComponent = Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
			label: Messages.ANSWER_POINTS_INCORRECT
		}));
		this.questionValueFieldset.add([this.correctValueComponent, this.incorrectValueComponent,this.ValueOfCorrectAnswers]);

		this.zoomSpinner = Ext.create('Ext.field.Spinner', {
			xtype : 'spinnerfield',
			label : Messages.GRID_LABEL_ZOOM,
			listeners : {
				spinup : function() {
						me.grid.zoomIn();
						this.setValue(Math.round(me.grid.getScale()*100));
				},
				spindown : function() {
				     if(this.getValue() > 1) {
						me.grid.zoomOut();
						this.setValue(Math.round(me.grid.getScale()*100));
				     }
				}

			},
			minValue: 1,
			value : this.grid.getScale() * 100	// set value as default
		});

		this.gridXSpinner = Ext.create('Ext.field.Spinner', {
			xtype : 'spinnerfield',
			label : Messages.GRID_LABEL_FIELD_X,
			listeners : {
				spin : function(spinner, value) {
					me.grid.setGridSizeX(value); // update grid count
					me.grid.setChosenFields(Array());
					me.grid.redraw();
					me.grid.getOnFieldClick()(0);
				}
			},
			minValue : 1,
			maxValue : 16,
			value :  this.grid.getGridSizeX(),
			stepValue : 1,
			cycle : true
		});
		
		this.gridYSpinner = Ext.create('Ext.field.Spinner', {
			xtype : 'spinnerfield',
			label : Messages.GRID_LABEL_FIELD_Y,
			listeners : {
				spin : function(spinner, value) {
					me.grid.setGridSizeY(value); // update grid count
					me.grid.setChosenFields(Array());
					me.grid.redraw();
					me.grid.getOnFieldClick()(0);
				}
			},
			minValue : 1,
			maxValue : 16,
			value :  this.grid.getGridSizeY(),
			stepValue : 1,
			cycle : true
		});
		

		this.gridColorsToggle = Ext.create('Ext.field.Toggle', {
			label:		Messages.GRID_LABEL_INVERT_GRIDCOLORS,
			value:  	false
		});
		
		this.toggleAnswers = Ext.create('Ext.field.Toggle', {
			label:		Messages.GRID_LABEL_MARK_TOGGLE_ANSWERS,
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
				         this.gridXSpinner,
				         this.gridYSpinner,
				         this.gridColorsToggle,
				         this.toggleAnswers
				         ]
			}]
		});

		this.imageCnt = Ext.create('Ext.form.FormPanel', {
			scrollable : null,
			id : 'imageControle',
			hidden : true,
			items : [ this.imageSettings,
				         this.answers,
				         this.questionValueFieldset ]
		});


		var toggleColorListener =  {
		        beforechange: function (slider, thumb, newValue, oldValue) {
		        	me.grid.toggleBorderColor();
		        },
		        change: function (slider, thumb, newValue, oldValue) {
		        	me.grid.toggleBorderColor();
		        }
		};
		
		var toggleMarkAnswers =  {
		        beforechange: function (slider, thumb, newValue, oldValue) {
		        	me.grid.setToggleFieldsLeft(this.getValue());
		        },
		        change: function (slider, thumb, newValue, oldValue) {
		        	me.grid.setToggleFieldsLeft(this.getValue()); 
		        }
		};
		
		this.gridColorsToggle.setListeners(toggleColorListener);
		this.toggleAnswers.setListeners(toggleMarkAnswers);
		
		var thresholdAnswers =  {
		        change: function (slider, thumb, newValue, oldValue) {
		        	me.grid.setThresholdCorrectAnswers(newValue);

		        }
		};
						
		//this.correctValueComponent.setListeners(thresholdAnswers);
		this.ValueOfCorrectAnswers.setListeners(thresholdAnswers);
		
		// update answers counter
		this.grid.setOnFieldClick(function(answerValue) {
			me.ValueOfCorrectAnswers.setMaxValue(me.correctValueComponent.getMaxValue() *me.grid.getChosenFields().length);
        	me.ValueOfCorrectAnswers.setMinValue(me.incorrectValueComponent.getMinValue() * me.grid.getChosenFields().length);   
        	me.ValueOfCorrectAnswers.setSliderValue(me.correctValueComponent.getMaxValue() * me.grid.getChosenFields().length);
        	
			me.answers.getComponent('fs_answers').getComponent('tf_answers').setValue(answerValue);
			if (!me.reset && answerValue > 0) {
				console.log("true");
				me.reset = true;
				me.questionValueFieldset.setHidden(false);
				me.correctValueComponent.setSliderValue(me.correctValueComponent.getMaxValue());
				me.incorrectValueComponent.setSliderValue(me.correctValueComponent.getMinValue());
			} else if (answerValue === 0) {
				me.reset = false;
				me.questionValueFieldset.setHidden(true);
				me.correctValueComponent.reset();
				me.incorrectValueComponent.reset();
			}
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
		}, this.questionValueFieldset]);

	},

	/**
	 * Interface to the grid element to set a new image.
	 */
	updateCanvas : function(dataUrl, reload) {
		// update canvas
		this.grid.setImage(dataUrl, reload, Ext.bind(function validImage() {
      this.showImageView();
    }, this), function invalidImage() {
      Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_IMAGE_NOT_LOADED);
    });
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
		this.infoPanel.showBy(this.infoButton);
	},


	/**
	 * Shows the image view and hides the upload view.
	 */
	showImageView : function() {
		this.imageArea.show();
		this.imageCnt.show();
		this.uploadView.hide();
		//this.questionValueFieldset.show();
	},

	/**
	 * Shows the upload view and hides the image view.
	 */
	showUploadView : function() {
		this.imageArea.hide();
		this.imageCnt.hide();
		this.uploadView.show();
		this.questionValueFieldset.setHidden(true);
	},

	/**
	 * Resets the image view to the initial state.
	 */
	resetView : function() {
		this.showUploadView();
		this.grid.clearImage();
		this.clearTextfields();
	},

	clearTextfields : function() {
		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');
		var urlField 	= this.uploadView.getComponent('pnl_upfield').getComponent('tf_url');

		this.zoomSpinner.setValue(this.grid.getScale() * 100);
		this.gridXSpinner.setValue(this.grid.getGridSizeX());
		this.gridYSpinner.setValue(this.grid.getGridSizeY());
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

		var possibleAnswers = this.grid.getPossibleAnswersFromChosenFields();
		possibleAnswers.forEach(function(answer) {
			if (answer.correct) {
				answer.value = this.correctValueComponent.getSliderValue();
			} else {
				answer.value = this.incorrectValueComponent.getSliderValue();
			}
		}, this);

		// get image data
		if (this.grid.getImageFile()) {
			result.image 	 	   = this.grid.getImageFile().src;
		}
		result.gridSize 	   	= this.grid.getGridSize();
		result.offsetX  	   	= this.grid.getOffsetX();
		result.offsetY 		   	= this.grid.getOffsetY();
		result.zoomLvl 		   	= this.grid.getZoomLvl();
		result.gridOffsetX		= this.grid.getGridOffsetX(),
		result.gridOffsetY		= this.grid.getGridOffsetY(),
		result.gridZoomLvl		= this.grid.getGridZoomLvl(),
		result.gridSizeX		= this.grid.getGridSizeX(),
		result.gridSizeY		= this.grid.getGridSizeY(),
		result.gridIsHidden		= this.grid.getGridIsHidden(),
		result.imgRotation		= this.grid.getImgRotation(),
		result.toggleFieldsLeft	= this.grid.getToggleFieldsLeft(),
		result.numClickableFields = this.grid.getNumClickableFields(),
		result.thresholdCorrectAnswers = this.grid.getThresholdCorrectAnswers();
		
		result.possibleAnswers 	= possibleAnswers;

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
		var minValue = question.possibleAnswers.reduce(function(a, b) {
			return a < b.value ? a : b.value;
		}, 0);
		var maxValue = question.possibleAnswers.reduce(function(a, b) {
			return a < b.value ? b.value : a;
		}, 0);

		// set image data (base64 --> grid)
		this.updateCanvas(question.image, false);

		this.grid.update(question.gridSize, question.offsetX,
				question.offsetY, question.zoomLvl,
				question.gridOffsetX, question.gridOffsetY,
				question.gridZoomLvl, question.gridSizeX, 
				question.gridSizeY, question.gridIsHidden,
				question.imgRotation, question.toggleFieldsLeft, 
				question.numClickableFields, question.thresholdCorrectAnswers,
				question.possibleAnswers, true);

		answerField.setValue(this.grid.getChosenFields().length);		//set the spinner with correct values (last storage)
		this.questionValueFieldset.setHidden(this.grid.getChosenFields().length === 0);
		this.incorrectValueComponent.setSliderValue(minValue);
		this.correctValueComponent.setSliderValue(maxValue);
		this.zoomSpinner.setValue(Math.round(this.grid.getScale()*100));
		this.gridXSpinner.setValue(this.grid.getGridSizeX());
		this.gridYSpinner.setValue(this.grid.getGridSizeY());
		this.deleteButton.setHidden(true);	//disable delete button in edit mode
		this.toggleAnswers.setValue(this.grid.getToggleFieldsLeft());
		this.ValueOfCorrectAnswers.setMaxValue(this.correctValueComponent.getMaxValue() *this.grid.getChosenFields().length);
    	this.ValueOfCorrectAnswers.setMinValue(this.incorrectValueComponent.getMinValue() * this.grid.getChosenFields().length);   
    	this.ValueOfCorrectAnswers.setSliderValue(this.grid.getThresholdCorrectAnswers());
		
	}
});
