/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/utils/Ext.plugins.ResizableTextArea.js
 - Beschreibung: Eine "mitwachsende" TextArea
 - Version:      1.0, 01/05/12
 - Autor(en):    THM Notes
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
/**
 * @class Ext.plugins.ResizableTextArea
 * @extends Ext.form.TextArea
 *
 */
Ext.define('Ext.plugins.ResizableTextArea', {
	extend: 'Ext.form.TextArea',

	config: {
		maxHeight: -1
	},

	initialize: function(config) {
		this.callParent(arguments);
	},

	onKeyUp: function() {
		textarea = Ext.DomQuery.select('textarea', this.element.dom)[0];

		/* Default max height */
		/* Don't let it grow over the max height */
		if ((this.maxHeight > -1) && (textarea.scrollHeight > this.maxHeight)) {
			/* Add the scrollbar back and bail */
			if (textarea.style.overflowY != 'scroll') {
				textarea.style.overflowY = 'scroll';
			}
			return;
		}
		/* Make sure element does not have scroll bar to prevent jumpy-ness */
		if (textarea.style.overflowY != 'hidden') {
			textarea.style.overflowY = 'hidden';
		}
		/* Now reset and adjust the height */
		textarea.style.height = 0;

		var scrollH = textarea.scrollHeight;

		if (scrollH > textarea.style.height.replace(/[^0-9]/g, '')) {
			textarea.style.height = scrollH+'px';
		}
	}
});
