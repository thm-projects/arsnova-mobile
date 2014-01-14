/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: MessageBox mit Mathjax-Unterstützung
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>,
 				 Andreas Gärtner <andreas.gaertner@mni.thm.de>
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
Ext.define('ARSnova.view.CustomMessageBox', {
	override: 'Ext.MessageBox',

	show: function(config) {
		this.callParent(arguments);
		
		if (this.getTitle()) {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.getTitle().element.dom]);
		}
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this._message.element.dom]);
		return this;
	},
	
	confirm: function(title, message, fn, scope) {
		this.callParent(arguments);
		
		return this.show({
	        title       : title || null,
	        message     : message || null,
	        buttons     : [
	            {text: Messages.YES, itemId: 'yes', ui: 'action'},
	 			{text: Messages.NO,  itemId: 'no'}
			],
	        promptConfig: false,
	        scope       : scope,
	        fn: function() {
	            if (fn) {
	                fn.apply(scope, arguments);
	            }
	        }
		});
	}
});
