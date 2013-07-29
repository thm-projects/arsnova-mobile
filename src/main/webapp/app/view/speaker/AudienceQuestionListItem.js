/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
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
Ext.define('ARSnova.view.speaker.AudienceQuestionListItem', {
	extend: 'Ext.dataview.component.ListItem',
	
	xtype: 'audiencequestionlistitem',
	
	config: {
		/**
		 * Whenever these fields change in value, allow refresh of body element
		 */
		importantFields: ['text', 'numAnswers', 'active']
	},
	
	valueStore: {},
	
	// copied from base class...
	updateRecord: function(record) {
		var me = this,
			dataview = me.dataview || this.getDataview(),
			data = record && dataview.prepareData(record.getData(true), dataview.getStore().indexOf(record), record),
			dataMap = me.getDataMap(),
			body = this.getBody(),
			disclosure = this.getDisclosure();
		
		me._record = record;
		
		if (dataMap) {
			me.doMapData(dataMap, data, body);
		} else if (body) {
			// Update the body only if "important" values have changed
			if (record && me.hasImportantChanges(record.getId(), data)) {
				body.updateData(data || null);
				MathJax.Hub.Queue(["Typeset", MathJax.Hub, body.dom]);
			}
		}

		if (disclosure && record && dataview.getOnItemDisclosure()) {
			var disclosureProperty = dataview.getDisclosureProperty();
			disclosure[(data.hasOwnProperty(disclosureProperty) && data[disclosureProperty] === false) ? 'hide' : 'show']();
		}

		/**
		 * @event updatedata
		 * Fires whenever the data of the DataItem is updated.
		 * @param {Ext.dataview.component.DataItem} this The DataItem instance.
		 * @param {Object} newData The new data.
		 */
		me.fireEvent('updatedata', me, data);
	},
	
	hasImportantChanges: function(id, data) {
		var hasChanges = false;
		var store = this.valueStore[id] || {};
		this.getImportantFields().forEach(function(item, index) {
			if (typeof store[item] === "undefined" || store[item] !== data[item]) {
				store[item] = data[item];
				hasChanges = true;
			}
		}, this);
		this.valueStore[id] = store;
		return hasChanges;
	}
});
