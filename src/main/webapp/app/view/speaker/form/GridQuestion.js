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

	config : {

	},

	constructor : function() {
		this.callParent(arguments);

		var grid = Ext.create('ARSnova.view.components.GridContainer', {
			docked : 'top',
			id : 'gridContainer'

		});

		var uploadButton = Ext.create('Ext.Panel', {
			xtype : 'fieldset',
			title : Messages.EDIT_PICTURE,
			items : [ {
				xtype : 'button',
				text : Messages.UPLOAD_PICTURE,
				style : {
					maxWidth : '250px',
					width : '80%',
					margin : '20px auto'
				},
				defaults : {
					style : 'width: 33%'
				},
				ui : 'round',
				handler : function() { // handler auslagern
					Ext.getCmp('picPanel').hide();
					Ext.getCmp('imageArea').hide();
					Ext.getCmp('upField').show();
					Ext.getCmp('imageControle').hide();
				}
			} ]
		});

		// Panel for picture and settings
		var imageArea = Ext.create('Ext.Panel', {
			id : 'imageArea',
			layout : 'hbox',
			items : [ grid, {
				xtype : 'button',
				iconCls : 'info',
				iconMask : true,
				docked : 'right'
			} ],
			hidden : true
		});

		var uploadField = Ext.create('Ext.Panel', {
			id : 'picPanel',
			items : [ {
				xtype : 'fieldset',
				title : Messages.EDIT_PICTURE,
				items : [ uploadButton ]
			} ]
		});

		var uploadView = Ext.create('Ext.Panel', {
			id : 'upField',
			layout : 'vbox',
			hidden : true,

			items : [ {
				xtype : 'fieldset',
				title : Messages.EDIT_PICTURE,
				docked : 'top',
			}, {
				xtype : 'panel',
				layout : 'vbox',
				items : [ {
					xtype : 'textfield',
					label : Messages.SELECT_PICTURE,
					name : Messages.SELECT_PICTURE,
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
					items : [ {
						xtype : 'button',
						text : Messages.SEARCH_PICTURE,
						handler : this.searchPic
					}, {
						xtype : 'spacer',
					}, {
						xtype : 'button',
						text : Messages.UPLOAD_PICTURE,
						handler : this.searchPic
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
			items : [ answers, {
				xtype : 'fieldset',
				title : Messages.SETTINGS,
				items : [ {
					xtype : 'spinnerfield',
					label : 'Zoom',
					listeners : {
						spinup : function() {
							grid.zoomIn();
						},
						spindown : function() {
							grid.zoomOut();
						}

					},
					minValue : 5,
					maxValue : 100,
					value : 5,
					stepValue : 5
				// cycle : true
				}, {
					xtype : 'spinnerfield',
					label : 'Quadrate',
					listeners : {
						spin : function() {
							grid.setGrids(this.getValue()); // update grid count
						}
					},
					minValue : 4,
					maxValue : 128,
					value : 1,
					stepValue : 2,
					cycle : true,
				} ]
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
			items : [ imageArea, uploadView, uploadField, imageCnt ]
		} ]);

	},

	searchPic : function() {
		Ext.getCmp('picPanel').show();
		Ext.getCmp('imageArea').show();
		Ext.getCmp('gridContainer').show();
		Ext.getCmp('upField').hide();
		Ext.getCmp('imageControle').show();
	},

	initWithQuestion : function(question) {

		var possibleAnswers = question.possibleAnswers;

		if (possibleAnswers.length === 0) {
			return;
		}
	},

	// liefert die Resultate der angewaehlten Komponenten
	getQuestionValues : function() {
		var result = {};

		return result;
	}
});