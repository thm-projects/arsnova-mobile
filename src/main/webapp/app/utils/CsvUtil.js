/*--------------------------------------------------------------------------+
/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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

/**
 * This utility contains functions to convert json to csv and backwards.
 * Currently we make use of the Papa-Parse library (see: http://papaparse.com/).
 * If you want to change the library later on, please do this inside this utility,
 * so other controllers using csv <-> json coversion won't be affected.
 */
Ext.define('ARSnova.utils.CsvUtil', {
	singleton: true,

	/**
	* Convert a csv string to json
	* @param  {String} csv The csv string to parse.
	* @return {String}     The parsed csv string as json.
	*/
	csvToJson: function (csv) {
		if (!csv) { return; }
		var parsed = Papa.parse(csv);
		if (parsed.errors.length > 0) { return; }
		return JSON.stringify(parsed.data);
	},

	/**
	* Parse a json object to a csv string.
	* @param  {Object} json Json object to parse.
	* @return {String}      Parsed json object as csv string.
	*/
	jsonToCsv: function (json) {
		if (!json) { return; }
		var unparsed = Papa.unparse(json);
		return unparsed;
	}
});
