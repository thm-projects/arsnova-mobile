/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/FreetextAnswerList.js
 - Beschreibung: Template für Freitext-Antwortliste.
 - Version:      1.0, 11/06/12
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
Ext.define('ARSnova.view.FreetextAnswerList', {
	extend: 'Ext.List',
	
	config: {
		activeCls: 'search-item-active',
		style: {
			backgroundColor: 'transparent'
		},
		
		itemCls: 'forwardListButton',
		itemTpl: [
			'<div class="search-item">',
			'<span style="color:gray">{formattedTime}</span><span style="padding-left:30px">{answerSubject}</span>',
			'</div>'
		],
		grouped: true,
		
		listeners: {
			itemtap: function (list, index, element) {
				var answer = list.store.getAt(index).data;
				ARSnova.app.getController('Questions').freetextDetailAnswer({
					answer		: Ext.apply(answer, {
						deselectItem: function() { list.deselect(index); },
						removeItem: function() { list.store.remove(list.store.getAt(index)); }
					})
				});
			}
		}
	},
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.config.scroll = !arguments.disableScrolling ? 'vertical' : false;
		this.config.store = arguments.store;
	},
});
