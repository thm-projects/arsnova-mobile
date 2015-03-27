﻿/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('ARSnova.view.speaker.form.GridQuestion', {
	extend: 'Ext.Container',

	// identifier
	xtype: 'grid',
	scrollable: 'vertical',
	requires: [
		'Ext.ux.Fileup' // file upload framework
	],

	imageArea: null, // contains all image relevant items
	grid: null, // encapsulated canvas element
	imageCnt: null, // image manipulation options
	imageSettings: null, // the image settings (offset, zoom,...)
	uploadView: null, // view containing the upload options
	answers: null,
	zoomSpinner: null,
	gridXSpinner: null,
	gridYSpinner: null,
	btnMoveLeft: null,
	btnMoveRight: null,
	btnMoveUp: null,
	btnMoveDown: null,
	btnZoomInGrid: null,
	btnZoomOutGrid: null,
	btnMoveGridLeft: null,
	btnMoveGridRight: null,
	btnMoveGridUp: null,
	btnMoveGridDown: null,
	infoButton: null,
	infoPanel: null,
	gridColorsToggle: null,
	cvBackgroundToggle: null,
	deleteButton: null,
	rotateButton: null,
	hideGridButton: null,

	/**
	 * Initializes the grid question area and the needed
	 * form elements.
	 */
	initialize: function () {
		var me = this;
		this.callParent(arguments);

		this.grid = null;
		//		this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
		//			docked: 'top',
		//			itemId: 'gridImageContainer'
		//		});

		/**
		 * The view containing the url textfield and the
		 * functionality to load an image into the canvas
		 */
		this.uploadView = Ext.create('ARSnova.view.speaker.form.ImageUploadPanel', {
				handlerScope: me,
				urlUploadHandler: me.handleFS,
				fsUploadHandler: me.handleUrl,
				templateHandler: me.handleTemplate
			});

		this.add([
				this.uploadView
			]);
	},

	/**
	 * Initialize the form fields depending on the type of gridContainer loaded in this question.
	 */
	initializeFormFields: function () {
		var me = this;
		this.remove(this.imageArea);
		this.remove(this.imageCnt);

		// TODO check if necessary
		//		if (this.imageCnt) {
		//			this.remove(this.imageCnt);
		//		}

		this.infoPanel = Ext.create('Ext.Panel', {
				cls: 'infoPanel',
				html: Messages.SETTINGS_HINT_TEXT,
				hideOnMaskTap: true,
				modal: true
			});

		this.infoButton = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'info',
				iconMask: true,
				handler: function () {
					me.onInfoButton();
				}
			});

		this.btnMoveLeft = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_left',
				iconMask: true
			});

		this.btnMoveRight = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_right',
				iconMask: true
			});

		this.btnMoveUp = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_up',
				iconMask: true
			});

		this.btnMoveDown = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_down',
				iconMask: true
			});

		this.deleteButton = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'delete',
				iconMask: true,
				handler: function () {
					me.resetView();
				}
			});

		this.rotateButton = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'refresh',
				iconMask: true,
				handler: function () {
					me.grid.spinRight();
				}
			});

		this.btnZoomInGrid = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'add',
				iconMask: true,
				handler: function () {
					me.grid.zoomInGrid();
				}
			});

		this.btnZoomOutGrid = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'minus2',
				iconMask: true,
				handler: function () {
					me.grid.zoomOutGrid();
				}
			});

		this.btnMoveGridLeft = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_left',
				iconMask: true,
				handler: function () {
					me.grid.moveGridLeft();
				}
			});

		this.btnMoveGridRight = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_right',
				iconMask: true,
				handler: function () {
					me.grid.moveGridRight();
				}
			});

		this.btnMoveGridUp = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_up',
				iconMask: true,
				handler: function () {
					me.grid.moveGridUp();
				}
			});

		this.btnMoveGridDown = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'arrow_down',
				iconMask: true,
				handler: function () {
					me.grid.moveGridDown();
				}
			});

		this.hideGridButton = Ext.create('Ext.Button', {
				ui: 'action',
				iconCls: 'delete',
				iconMask: true,
				handler: function () {
					me.grid.setGridIsHidden(!me.grid.getGridIsHidden());
					me.grid.redraw();
				}
			});

		// initialize tap repeater for move buttons
		// TapRepeater for left button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveLeft.bodyElement
		}).on('tap', function () {
			me.grid.moveLeft();
		}, me);

		// TapRepeater for right button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveRight.bodyElement
		}).on('tap', function () {
			me.grid.moveRight();
		}, me);

		// TapRepeater for up button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveUp.bodyElement
		}).on('tap', function () {
			me.grid.moveUp();
		}, me);

		// TapRepeater for down button
		Ext.create('Ext.util.TapRepeater', {
			el: this.btnMoveDown.bodyElement
		}).on('tap', function () {
			me.grid.moveDown();
		}, me);

		this.answers = Ext.create('Ext.Panel', {
				items: [{
						xtype: 'fieldset',
						itemId: 'fs_answers',
						style: 'margin-bottom: 0',
						name: 'fs_answers',
						title: Messages.CORRECT_ANSWERS,
						items: [{
								xtype: 'textfield',
								itemId: 'tf_answers',
								cls: 'centerAligned',
								label: Messages.COUNT,
								name: Messages.COUNT,
								placeHolder: '0',
								readOnly: true
							}
						]
					}
				]
			});

		if (ARSnova.app.globalConfig.features.learningProgress) {
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

			this.ValueOfCorrectAnswers = Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
						label: Messages.GRID_LABEL_THRESHOLD_CORRECT_ANSWERS
					}));

			this.correctValueComponent = Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
						label: Messages.ANSWER_POINTS_CORRECT
					}));
			this.incorrectValueComponent = Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
						label: Messages.ANSWER_POINTS_INCORRECT
					}));
			this.questionValueFieldset.add([this.correctValueComponent, this.incorrectValueComponent, this.ValueOfCorrectAnswers]);
		}

		this.zoomSpinner = Ext.create('Ext.field.Spinner', {
				xtype: 'spinnerfield',
				label: Messages.GRID_LABEL_ZOOM,
				listeners: {
					spinup: function () {
						me.grid.zoomIn();
						this.setValue(Math.round(me.grid.getScale() * 100));
					},
					spindown: function () {
						if (this.getValue() > 1) {
							me.grid.zoomOut();
							this.setValue(Math.round(me.grid.getScale() * 100));
						}
					}
				},
				minValue: 1,
				value: this.grid.getScale() * 100 // set value as default
			});

		this.gridXSpinner = Ext.create('Ext.field.Spinner', {
				xtype: 'spinnerfield',
				label: Messages.GRID_LABEL_FIELD_X,
				listeners: {
					spin: function (spinner, value) {
						me.grid.setGridSizeX(value); // update grid count
						me.grid.setChosenFields(Array());
						me.grid.redraw();
						me.grid.getOnFieldClick()(0);
					}
				},
				minValue: 1,
				maxValue: 16,
				value: this.grid.getGridSizeX(),
				stepValue: 1,
				cycle: true
			});

		this.gridYSpinner = Ext.create('Ext.field.Spinner', {
				xtype: 'spinnerfield',
				label: Messages.GRID_LABEL_FIELD_Y,
				listeners: {
					spin: function (spinner, value) {
						me.grid.setGridSizeY(value); // update grid count
						me.grid.setChosenFields(Array());
						me.grid.redraw();
						me.grid.getOnFieldClick()(0);
					}
				},
				minValue: 1,
				maxValue: 16,
				value: this.grid.getGridSizeY(),
				stepValue: 1,
				cycle: true
			});

		this.gridColorsToggle = Ext.create('Ext.field.Toggle', {
				label: Messages.GRID_LABEL_INVERT_GRIDCOLORS,
				cls: 'rightAligned',
				value: false
			});

		this.cvBackgroundToggle = Ext.create('Ext.field.Toggle', {
				label: Messages.GRID_LABEL_CV_TRANSPARENCY,
				cls: 'rightAligned',
				value: false
			});

		this.toggleAnswers = Ext.create('Ext.field.Toggle', {
				label: Messages.GRID_LABEL_MARK_TOGGLE_ANSWERS,
				cls: 'rightAligned',
				value: false
			});

		var toggleColorListener = {
			beforechange: function (slider, thumb, newValue, oldValue) {
				me.grid.toggleBorderColor();
			},
			change: function (slider, thumb, newValue, oldValue) {
				me.grid.toggleBorderColor();
			}
		};

		var toggleCvBackgroundListener = {
			beforechange: function (slider, thumb, newValue, oldValue) {
				me.grid.toggleCvBackground(newValue);
			},
			change: function (slider, thumb, newValue, oldValue) {
				me.grid.toggleCvBackground(this.getValue());
			}
		};

		var toggleMarkAnswers = {
			beforechange: function (slider, thumb, newValue, oldValue) {
				me.grid.setToggleFieldsLeft(this.getValue());
			},
			change: function (slider, thumb, newValue, oldValue) {
				me.grid.setToggleFieldsLeft(this.getValue());
			}
		};

		this.gridColorsToggle.setListeners(toggleColorListener);
		this.cvBackgroundToggle.setListeners(toggleCvBackgroundListener);
		this.toggleAnswers.setListeners(toggleMarkAnswers);

		var thresholdAnswers = {
			change: function (slider, thumb, newValue, oldValue) {
				me.grid.setThresholdCorrectAnswers(newValue);
			}
		};

		if (ARSnova.app.globalConfig.features.learningProgress) {
			//this.correctValueComponent.setListeners(thresholdAnswers);
			this.ValueOfCorrectAnswers.setListeners(thresholdAnswers);
		}

		// update answers counter
		this.grid.setOnFieldClick(function (answerValue) {
			me.answers.getComponent('fs_answers').getComponent('tf_answers').setValue(answerValue);
			if (ARSnova.app.globalConfig.features.learningProgress) {
				if (me.grid.getGridType() !== 'moderation') {
					me.ValueOfCorrectAnswers.setMaxValue(me.correctValueComponent.getMaxValue() * me.grid.getChosenFields().length);
					me.ValueOfCorrectAnswers.setMinValue(me.incorrectValueComponent.getMinValue() * me.grid.getChosenFields().length);
					me.ValueOfCorrectAnswers.setSliderValue(me.correctValueComponent.getMaxValue() * me.grid.getChosenFields().length);

					if (!me.reset && answerValue > 0) {
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
				}
			}
		});

		var panelItems = [];
		var abstention = Ext.getCmp('abstentionPart');
		if (this.grid instanceof ARSnova.view.components.GridModerationContainer) {
			// hide abstention panel
			abstention.hide();

			this.numberOfDotsSpinner = Ext.create('Ext.field.Spinner', {
					xtype: 'spinnerfield',
					label: Messages.GRID_LABEL_NUMBER_OF_DOTS,
					listeners: {
						spin: function (spinner, value) {
							me.grid.setNumberOfDots(value); // update value in grid
							me.grid.setChosenFields(Array());
							me.grid.redraw();
							me.grid.getOnFieldClick()(0);
						}
					},
					minValue: 1,
					maxValue: Math.min(this.grid.getGridSizeX() * this.grid.getGridSizeY(), 8),
					value: this.grid.getNumberOfDots(),
					stepValue: 1,
					cycle: true
				});

			this.deleteModerationButton = Ext.create('Ext.Button', {
					ui: 'action',
					cls: 'saveQuestionButton',
					style: 'margin-top: 30px',
					text: Messages.GRID_LABEL_DELETE_MODERATION,
					handler: function () {
						me.resetView();
						Ext.getCmp('abstentionPart').show();
					},
					scope: me
				});

			panelItems = [
				this.imageSettings = Ext.create('Ext.Panel', {
						itemId: 'answerField',
						items: [{
								xtype: 'fieldset',
								itemId: 'fs_imagesettings',
								title: Messages.SETTINGS,
								items: [
									this.numberOfDotsSpinner
								]
							}
						]
					})
			];

			this.imageArea = Ext.create('Ext.Panel', {
					itemId: 'imageArea',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					items: [
						this.grid,
						this.deleteModerationButton
						//				    {
						//						xtype: 'container',
						//						layout:{
						//							type: 'hbox',
						//							align: 'stretch',
						////							pack: 'stretch',
						//						},
						//						items: [
						//
						//						]
						//					}
					],
					hidden: true
				});
		} else {
			abstention.show();
			panelItems = [
				this.imageSettings = Ext.create('Ext.Panel', {
						itemId: 'answerField',
						items: [{
								xtype: 'fieldset',
								itemId: 'fs_imagesettings',
								title: Messages.SETTINGS,
								items: [
									this.zoomSpinner,
									this.gridXSpinner,
									this.gridYSpinner,
									this.gridColorsToggle,
									this.cvBackgroundToggle,
									this.toggleAnswers
								]
							}
						]
					}),
				this.answers
			];

			this.imageArea = Ext.create('Ext.Panel', {
					itemId: 'imageArea',
					layout: {
						type: 'vbox',
						align: 'center',
						pack: 'center'
					},
					items: [
						this.grid, {
							xtype: 'label',
							html: Messages.GRID_CONFIG_IMAGE
						}, {
							xtype: 'panel',
							layout: {
								type: 'hbox',
								align: 'center',
								pack: 'center'
							},
							items: [
								this.infoButton,
								this.btnMoveLeft,
								this.btnMoveRight,
								this.btnMoveUp,
								this.btnMoveDown,
								this.deleteButton,
								this.rotateButton
							]
						}, {
							xtype: 'label',
							html: Messages.GRID_CONFIG_GRID,
							style: "margin-top: 15px"
						}, {
							xtype: 'panel',
							layout: {
								type: 'hbox',
								align: 'center',
								pack: 'center'
							},
							items: [
								this.btnZoomInGrid,
								this.btnZoomOutGrid,
								this.btnMoveGridLeft,
								this.btnMoveGridRight,
								this.btnMoveGridUp,
								this.btnMoveGridDown,
								this.hideGridButton
							]
						}
					],
					hidden: true
				});
		}

		this.add(this.imageArea);

		if (ARSnova.app.globalConfig.features.learningProgress) {
			panelItems.push(this.questionValueFieldset);
		}

		this.imageCnt = Ext.create('Ext.form.FormPanel', {
				scrollable: null,
				itemId: 'imageControls',
				hidden: true,
				items: panelItems
			});

		this.add(this.imageCnt);

		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.add([this.questionValueFieldset]);
		}
	},

	handleFS: function (dataUrl, reload) {
		this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				docked: 'top',
				itemId: 'gridImageContainer'
			});
		this.initializeFormFields();
		this.updateCanvas(dataUrl, reload);
		this.image = dataUrl;
	},

	handleUrl: function (url) {
		this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				docked: 'top',
				itemId: 'gridImageContainer'
			});
		this.initializeFormFields();
		this.updateCanvasWithUrl(url);
		this.image = url;
	},

	handleTemplate: function (templateGrid) {
		this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
				docked: 'top',
				style: 'margin-top: 30px',
				itemId: 'gridImageContainer'
			});

		this.grid.setImageFile(templateGrid.getImageFile());

		this.grid.updateFromTemplate(templateGrid);

		this.grid.redraw();

		this.initializeFormFields();
		this.showImageView();

		// show GridQuestion
		var newQuestionPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.setActiveItem(newQuestionPanel);
		newQuestionPanel.activateButtonWithText(Messages.GRID);
		this.image = this.grid.image.html.toDataURL();
	},

	/**
	 * Interface to the grid element to set a new image.
	 */
	updateCanvas: function (dataUrl, reload) {
		// update canvas
		this.grid.setImage(dataUrl, reload, Ext.bind(function validImage() {
				this.showImageView();
			}, this), function invalidImage() {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_IMAGE_NOT_LOADED);
		});
	},

	/**
	 * TODO: This method does nearly the same as updateCanvas, now and should be merged into it
	 */
	updateCanvasWithUrl: function (url) {
		if (url) {
			this.updateCanvas(url, true);
		} else {
			Ext.Msg.alert(Messages.NOTIFICATION, Messages.GRID_ERROR_URL_MISSING);
		}
	},

	/**
	 * Handler function for the event of info button
	 */
	onInfoButton: function () {
		this.infoPanel.showBy(this.infoButton);
	},

	/**
	 * Shows the image view and hides the upload view.
	 */
	showImageView: function () {
		this.imageArea.show();
		this.imageCnt.show();
		this.uploadView.hide();
		//this.questionValueFieldset.show();
	},

	/**
	 * Shows the upload view and hides the image view.
	 */
	showUploadView: function () {
		this.imageArea.hide();
		this.imageCnt.hide();
		this.uploadView.show();
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.questionValueFieldset.setHidden(true);
		}
	},

	/**
	 * Resets the image view to the initial state.
	 */
	resetView: function () {
		this.showUploadView();
		this.grid.clearImage();
		this.clearTextfields();
	},

	clearTextfields: function () {
		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');

		this.uploadView.setUrl("");
		this.zoomSpinner.setValue(this.grid.getScale() * 100);
		this.gridXSpinner.setValue(this.grid.getGridSizeX());
		this.gridYSpinner.setValue(this.grid.getGridSizeY());
		answerField.setValue(0);
	},

	/**
	 * Gets all relevant informations which have to be send to the backend.
	 *
	 * Hint: If the canvas contains an image gotten from url we cannot access the
	 * Base64 of the image in the client due to CORS denial. The image will be
	 * transfered as a URL an will be converted directly on the server.
	 */
	getQuestionValues: function () {
		var result = {};

		if (this.grid === null) {
			return;
		} else {
			result = this.grid.createResult();
		}

		var possibleAnswers = this.grid.getPossibleAnswersFromChosenFields();
		if (ARSnova.app.globalConfig.features.learningProgress) {
			possibleAnswers.forEach(function (answer) {
				if (answer.correct) {
					answer.value = this.correctValueComponent.getSliderValue();
				} else {
					answer.value = this.incorrectValueComponent.getSliderValue();
				}
			}, this);
		}

		result.possibleAnswers = possibleAnswers;

		return result;
	},

	/**
	 * Initializes the GridQuestion with the values from the given question.
	 *
	 * @param question		The questionObj providing all necessary information.
	 */
	initWithQuestion: function (question) {
		// reinstantiate grid if necessary
		if (question.gridType === 'moderation') {
			this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
					docked: 'top',
					itemId: 'gridImageContainer'
				});
		} else {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
					docked: 'top',
					itemId: 'gridImageContainer'
				});
		}

		this.initializeFormFields();

		// set image data (base64 --> grid)
		this.updateCanvas(question.image, false);

		this.grid.update(question, true);

		this.zoomSpinner.setValue(Math.round(this.grid.getScale() * 100));
		this.gridXSpinner.setValue(this.grid.getGridSizeX());
		this.gridYSpinner.setValue(this.grid.getGridSizeY());
		this.deleteButton.setHidden(true); // disable delete button in edit mode
		this.toggleAnswers.setValue(this.grid.getToggleFieldsLeft());

		if (this.grid instanceof ARSnova.view.components.GridModerationContainer) {
			this.numberOfDotsSpinner.setValue(this.grid.getNumberOfDots());
			this.deleteModerationButton.setHidden(true); // disable delete moderation button in edit mode
		}

		var answerField = this.answers.getComponent('fs_answers').getComponent('tf_answers');
		var minValue = question.possibleAnswers.reduce(function (a, b) {
				return a < b.value ? a : b.value;
			}, 0);
		var maxValue = question.possibleAnswers.reduce(function (a, b) {
				return a < b.value ? b.value : a;
			}, 0);

		answerField.setValue(this.grid.getChosenFields().length); // set the spinner with correct values (last storage)

		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.questionValueFieldset.setHidden(this.grid.getChosenFields().length === 0);
			this.incorrectValueComponent.setSliderValue(minValue);
			this.correctValueComponent.setSliderValue(maxValue);
			this.ValueOfCorrectAnswers.setMaxValue(this.correctValueComponent.getMaxValue() * this.grid.getChosenFields().length);
			this.ValueOfCorrectAnswers.setMinValue(this.incorrectValueComponent.getMinValue() * this.grid.getChosenFields().length);
			this.ValueOfCorrectAnswers.setSliderValue(this.grid.getThresholdCorrectAnswers());
			this.cvBackgroundToggle.setValue(this.grid.getCvIsColored());
		}
	},

	previewHandler: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel,
		answerPreview = Ext.create('ARSnova.view.AnswerPreviewBox'),
		answerValues = [];

		answerPreview.showPreview({
			title: panel.subject.getValue(),
			content: panel.textarea.getValue(),
			questionType: 'grid',
			answers: answerValues,
			image: panel.gridQuestion.image
		});
	}
});
