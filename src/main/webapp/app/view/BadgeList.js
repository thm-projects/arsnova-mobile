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
		
		this.config.tpl = ['<tpl for="."><div class="x-list-item x-hasbadge ' + this.config.itemCls + '">',
		            '<span class="x-button-label">' + this.config.itemTpl + '</span>',
		            '<tpl if="numAnswers &gt; 0"><span class="redbadgeicon">{numAnswers}</span></tpl>',
		            '</div></tpl>'].join("");

		if (this.config.grouped) {
			this.config.listItemTpl = this.config.tpl;
			if (Ext.isString(this.config.listItemTpl) || Ext.isArray(this.config.listItemTpl)) {
				this.config.listItemTpl = Ext.create('Ext.XTemplate', this.config.listItemTpl);
			}
			if (Ext.isString(this.config.groupTpl) || Ext.isArray(this.config.groupTpl)) {
				this.config.tpl = Ext.create('Ext.XTemplate', this.config.groupTpl);
			}
		}

		this.on('updatedata', function(list, newData ) {
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