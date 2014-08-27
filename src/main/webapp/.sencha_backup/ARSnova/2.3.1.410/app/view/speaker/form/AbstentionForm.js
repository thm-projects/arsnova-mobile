/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel zum Umschalten der Enthaltung
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.speaker.form.AbstentionForm', {
	extend: 'Ext.form.FormPanel',

	config: {
		abstention: true,

		scrollable: null,
		cls: 'newQuestionOptions'
	},

	constructor: function() {
		this.callParent(arguments);

		this.add([{
			xtype: 'fieldset',
			title: Messages.ABSTENTION_POSSIBLE,
			items: [{
				xtype: 'segmentedbutton',
				style: 'margin: auto',
				cls: 'yesnoOptions',
				items: [{
					text: Messages.YES,
					pressed: this.getAbstention(),
					scope: this,
					handler: function() {
						this.setAbstention(true);
					}
				}, {
					text: Messages.NO,
					pressed: !this.getAbstention(),
					scope: this,
					handler: function() {
						this.setAbstention(false);
					}
				}]
			}]
		}]);
	}
});
