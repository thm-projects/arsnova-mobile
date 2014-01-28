/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel für die Frageform: Playnquadrat
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
		textYes : Messages.YES,
		textNo : Messages.NO,
		textNone : Messages.NONE,
		pressed : 'none'
	},

	abstentionAnswer : null,

	constructor : function() {
		this.callParent(arguments);
		//in den FormPanel die restlichen Bearbeitungswerkzeuge fuer das Bild
		this.uploadButton = Ext.create('Ext.form.FormPanel', {
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
							Ext.Msg.alert('Title', 'The quick brown fox jumped over the lazy dog.', Ext.emptyFn); // dummy test
						}	
				} ]
			} ]
		});
		
		this.grid = Ext.create('ARSnova.view.components.GridContainer');

		this.add([ this.grid, {
			xtype : 'container',
			padding : 10,
			items : [ this.uploadButton ]
		} ]);
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
	}
});