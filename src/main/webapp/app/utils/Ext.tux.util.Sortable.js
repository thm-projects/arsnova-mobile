/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/utils/Ext.tux.util.Sortable.js
 - Beschreibung: Durch den Benutzer sortierbare Liste 
 - Version:      1.0, 01/05/12
 - Autor(en):    http://www.sencha.com/forum/showthread.php?144979-Ext.tux.util.Sortable-Provides-more-informations-on-the-dragged-element
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
Ext.ns('Ext.tux', 'Ext.tux.util');

/**
 * @author Andrea Cammarata
 * @link http://www.andreacammarata.com
 * @class Ext.tux.util.Sortable
 * <p>This is a simple improvement of the official Ext.util.Sortable Sencha Touch object, which extends 
 * some main events to return more additional informations, about the moved element.
 * Below, the definition of the edited events:
 * </p>
 * <pre><code>
 *
 * @event sortstart
 * @param {Ext.Sortable} this
 * @param {Ext.EventObject} e The event object.
 * @param {Number} oldIndex The index of the element before the sort change.
 *
 * @event sortend
 * @param {Ext.Sortable} this
 * @param {Ext.Element} el The Element being dragged.
 * @param {Ext.EventObject} e The event object.
 * @param {Number} oldIndex The index of the element before the sort change.
 * @param {Number} newIndex The index of the element after the sort change.
 *
 * @event sortchange
 * @param {Ext.Sortable} this
 * @param {Ext.Element} el The Element being dragged.
 * @param {Number} oldIndex The index of the element before the sort change.
 * @param {Number} newIndex The index of the element after the sort change.
 *
 * </code></pre> 
 */
Ext.tux.util.Sortable = Ext.extend(Ext.util.Sortable, {
	
	// @private
	onSortStart : function(e, t) {
		this.sorting = true;
		var draggable = new Ext.util.Draggable(t, {
			threshold: 0,
			revert: this.revert,
			direction: this.direction,
			constrain: this.constrain === true ? this.el : this.constrain,
			animationDuration: 100
		});
		draggable.on({
			drag: this.onDrag,
			dragend: this.onDragEnd,
			scope: this
		});

		this.dragEl = t;
		this.calculateBoxes();

		if (!draggable.dragging) {
			draggable.onStart(e);
		}

		// Getting the index of the dragging element before it will be moved
		this.oldIndex = this.element.select(this.itemSelector, false).indexOf(draggable.element.dom);

		// Rising the sortstart event returning the element original index
		this.fireEvent('sortstart', this, e, this.oldIndex);
	},

	// @private
	onDrag : function(draggable, e) {
		var items = this.items,
			ln = items.length,
			region = draggable.region,
			sortChange = false,
			i, intersect, overlap, item;

			for (i = 0; i < ln; i++) {
				item = items[i];
				intersect = region.intersect(item);
				if (intersect) {

					if (this.vertical && Math.abs(intersect.top - intersect.bottom) > (region.bottom - region.top) / 2) {
						if (region.bottom > item.top && item.top > region.top) {
							draggable.element.insertAfter(item.el);
						}
						else {
							draggable.element.insertBefore(item.el);
						}
						sortChange = true;
					}
					else if (this.horizontal && Math.abs(intersect.left - intersect.right) > (region.right - region.left) / 2) {
						if (region.right > item.left && item.left > region.left) {
							draggable.element.insertAfter(item.el);
						}
						else {
							draggable.element.insertBefore(item.el);
						}
						sortChange = true;
					}

					if (sortChange) {
						// We reset the draggable (initializes all the new start values)
						draggable.reset();

						// Move the draggable to its current location (since the transform is now
						// different)
						draggable.moveTo(region.left, region.top);

						// Finally lets recalculate all the items boxes
						this.calculateBoxes();

						// Saving the new element index
						this.newIndex = this.element.select(this.itemSelector, false).indexOf(draggable.element.dom);

						// Rising the sortchange event with the old and new index
						this.fireEvent('sortchange', this, draggable.el, this.oldIndex, this.newIndex);
						return;
					}
				}
			}
	},

	// @private
	onDragEnd : function(draggable, e) {
		draggable.destroy();
		this.sorting = false;

		// Rising the sortend event with the old and new index
		this.fireEvent('sortend', this, draggable, e, this.oldIndex, this.newIndex);
	}
	
});