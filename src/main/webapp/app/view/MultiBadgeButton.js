/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Ein Button mit mehreren Badges.
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

Ext.define('ARSnova.view.MultiBadgeButton', {
	extend: 'Ext.Button',
	alias: 'x-multibadgebutton',
	
	config: {
		multiBadges: [],
	},
	
	/**
	 * Creates a badge overlay on the button for displaying notifications. (with code borrowed from Ext.Button)
	 * @param {Array} badges The array of badge configurations. If you pass null or undefined the badges will be removed.
	 * Objects inside this array need the following parameter: "badgeText"; "badgeCls" is optional and defaults to
	 * this objects badgeCls.
	 * @return {ARSnova.app.view.MultiBadgeButton} this
	 */
	setBadge: function(badges) {
		var me = this;
		
		if (badges && !Ext.isArray(badges)) {
			return ARSnova.app.view.MultiBadgeButton.superclass.setBadge.call(this, badges);
		}
		me.badgeText = badges;
		
		if (!me.rendered) return me;
		
		me.multiBadges.forEach(function(item) {
			item.remove();
		});
		me.el.removeCls(me.hasBadgeCls);
		me.multiBadges = [];
		
		badges.forEach(function(item) {
			if (!!item.badgeText) {
				var aBadge = me.el.createChild({
					tag: 'span',
					cls: item.badgeCls || me.badgeCls,
					html: item.badgeText
				});
				me.multiBadges.push(aBadge);
			}
		});
		if (me.multiBadges.length > 1) {
			// Use special badge class on all but the last badge. The class sticks the badges together but leaves
			// enough space for the last (right most) badge.
			me.multiBadges.splice(0, me.multiBadges.length-1).forEach(function(item) {
				item.addCls("withdoublebadge");
			});
		}
		
		me.el.addCls(me.hasBadgeCls);
		return me;
	}
});
