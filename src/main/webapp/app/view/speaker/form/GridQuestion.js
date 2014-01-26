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

		/**
		 * Which button should be pressed initially? 'yes', 'no', or 'none'
		 */
		pressed : 'none'
	},

	abstentionAnswer : null,

	constructor : function() {
		this.callParent(arguments);

		this.uploadButton = Ext.create('Ext.Button', {
			text : Messages.SESSIONS,
			ui : 'normal',
			handler : function() {
				Ext.Msg.alert('Status', 'Changes saved successfully.');
			}

		});

		this.add([ {
			xtype : 'button',
			items : [ this.uploadButton ]
		} ]);

	},

	initWithQuestion : function(question) {
		var possibleAnswers = question.possibleAnswers;
		if (possibleAnswers.length === 0) {
			return;
		}
		this.answer.setValue(possibleAnswers[0].text);
	},

	getQuestionValues : function() {
		var result = {};

		result.possibleAnswers = [ {
			text : this.answer.getValue(),
			correct : true
		} ];

		return result;
	}
});