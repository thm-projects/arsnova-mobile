/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/BadgeList.js
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
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
Ext.define('ARSnova.view.BadgeList', {
	extend: 'Ext.List',

	initialize : function() {
		this.callParent(arguments);
		
		this.tpl = ['<tpl for="."><div class="x-list-item x-hasbadge ' + this.itemCls + '">',
		            '<span class="x-button-label">' + this.itemTpl + '</span>',
		            '<tpl if="numAnswers &gt; 0"><span class="redbadgeicon">{numAnswers}</span></tpl>',
		            '</div></tpl>'].join("");
		if (this.grouped) {
			this.listItemTpl = this.tpl;
			if (Ext.isString(this.listItemTpl) || Ext.isArray(this.listItemTpl)) {
				this.listItemTpl = new Ext.XTemplate(this.listItemTpl);
			}
			if (Ext.isString(this.groupTpl) || Ext.isArray(this.groupTpl)) {
				this.tpl = new Ext.XTemplate(this.groupTpl);
			}
		}
		
		this.on('update', function(list) {
			var allJax = MathJax.Hub.getAllJax(list.id);
			if (allJax.length === 0) {
				MathJax.Hub.Queue(["Typeset", MathJax.Hub, list.id]);
			} else {
				for (var i=0, jax; jax = allJax[i]; i++) {
					MathJax.Hub.Queue(["needsUpdate", jax], function() {
						console.log(arguments);
					});
				}
			}
		});
	}
});