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
		
		this.uploadField = Ext.create('Ext.form.Panel',{
			id: 'upload',
			//hidden: true,
			  fullscreen: true,
			items: [
			         {
			             xtype: 'fieldset',
			             title: 'About You',
			             instructions: 'Tell us all about yourself',
			             items: [
			                 {
			                     xtype: 'textfield',
			                     name : 'firstName',
			                     label: 'First Name'
			                 },
			                 {
			                     xtype: 'textfield',
			                     name : 'lastName',
			                     label: 'Last Name'
			                 }
			             ]
			         }
			     ]
		});
		
		//in den FormPanel die restlichen Bearbeitungswerkzeuge fuer das Bild
		this.uploadButton = Ext.create('Ext.form.FormPanel', {
			id: 'picPanel',
			scrollable : null,
			items : [ {
				xtype : 'fieldset',
				title : 'Bild bearbeiten:',
				items : [ {
					xtype :	'button',
					text : 	'Durchsuchen',
					style: {
						maxWidth: '250px',
						width: '80%',
						margin: '20px auto'
					},
					defaults: {
						style: 'width: 33%'
					},
					ui : 	'round',

					handler: function() {
						//this.getParent().getParent().getParent().getParent().hide();		//noch zu ändern
						Ext.getCmp('picPanel').hide();
						Ext.getCmp('gridContainer').hide();
						//this.uploadField.show();
					}	
				} ]
			} ]
		});
		
		this.grid = Ext.create('ARSnova.view.components.GridContainer',{id: 'gridContainer'});

		this.add([ this.grid, 
		    {
			xtype : 'container',
			padding : 10,
			items : [this.uploadButton]
		},
		{
		xtype : 'container',
		padding : 10,
		items : [this.uploadField]
	},]);
	},
	
	
	//initialisierung der Startzustaende der jeweiligen Komponenten
	initWithQuestion : function(question) {
		
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length === 0) {
			return;
		}
	},
	//liefert die Resultate der angewaehlten Komponenten
	getQuestionValues : function() {
		var result = {};
	

		return result;
	},
	
});