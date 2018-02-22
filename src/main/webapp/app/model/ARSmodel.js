/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define('ARSnova.model.ARSmodel', {
	extend: 'Ext.data.Model',

	/**
	 * Sets the given field to the given value, marks the instance as dirty.
	 * @param {String/Object} fieldName The field to set, or an object containing key/value pairs.
	 * @param {Object} value The value to set.
	 */
	set: function (fieldName, value) {
		var me = this,
			// We are using the fields map since it saves lots of function calls
			fieldMap = me.fields.map,
			modified = me.modified,
			notEditing = !me.editing,
			modifiedCount = 0,
			modifiedFieldNames = [],
			field, key, i, currentValue, ln, convert;

		/*
		 * If we're passed an object, iterate over that object. NOTE: we pull out fields with a convert function and
		 * set those last so that all other possible data is set before the convert function is called
		 */
		if (arguments.length === 1) {
			for (key in fieldName) {
				if (fieldName.hasOwnProperty(key)) {
					// here we check for the custom convert function. Note that if a field doesn't have a convert function,
					// we default it to its type's convert function, so we have to check that here. This feels rather dirty.
					field = fieldMap[key];
					if (field && field.hasCustomConvert()) {
						modifiedFieldNames.push(key);
						continue;
					}

					if (!modifiedCount && notEditing) {
						me.beginEdit();
					}
					++modifiedCount;
					me.set(key, fieldName[key]);
				}
			}

			ln = modifiedFieldNames.length;
			if (ln) {
				if (!modifiedCount && notEditing) {
					me.beginEdit();
				}
				modifiedCount += ln;
				for (i = 0; i < ln; i++) {
					field = modifiedFieldNames[i];
					me.set(field, fieldName[field]);
				}
			}

			if (notEditing && modifiedCount) {
				me.endEdit(false, modifiedFieldNames);
			}
		} else if (modified) {
			field = fieldMap[fieldName];
			convert = field && field.getConvert();
			if (convert) {
				value = convert.call(field, value, me);
			}

			currentValue = me.data[fieldName];
			me.data[fieldName] = value;
			me.raw[fieldName] = value;

			if (field && !me.isEqual(currentValue, value)) {
				if (modified.hasOwnProperty(fieldName)) {
					if (me.isEqual(modified[fieldName], value)) {
						// the original value in me.modified equals the new value, so the
						// field is no longer modified
						delete modified[fieldName];
						// we might have removed the last modified field, so check to see if
						// there are any modified fields remaining and correct me.dirty:
						me.dirty = false;
						for (key in modified) {
							if (modified.hasOwnProperty(key)) {
								me.dirty = true;
								break;
							}
						}
					}
				} else {
					me.dirty = true;
					// We only go one level back?
					modified[fieldName] = currentValue;
				}
			}

			if (notEditing) {
				me.afterEdit([fieldName], modified);
			}
		}
	}
});
