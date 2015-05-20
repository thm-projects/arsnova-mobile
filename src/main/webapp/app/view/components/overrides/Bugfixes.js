/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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

Ext.define('Override.util.SizeMonitor', {
	override: 'Ext.util.SizeMonitor',

	constructor: function (config) {
		var namespace = Ext.util.sizemonitor;

		if (Ext.browser.is.Firefox) {
			return new namespace.OverflowChange(config);
		} else if (Ext.browser.is.WebKit) {
			if (!Ext.browser.is.Silk && Ext.browser.engineVersion.gtEq('535') && !Ext.browser.engineVersion.ltEq('537.36')) {
				return new namespace.OverflowChange(config);
			} else {
				return new namespace.Scroll(config);
			}
		} else if (Ext.browser.is.IE11) {
			return new namespace.Scroll(config);
		} else {
			return new namespace.Scroll(config);
		}
	}
});

Ext.define('Override.util.PaintMonitor', {
	override: 'Ext.util.PaintMonitor',

	constructor: function (config) {
		if (Ext.browser.is.Firefox || (Ext.browser.is.WebKit && Ext.browser.engineVersion.gtEq('536') && !Ext.browser.engineVersion.ltEq('537.36') && !Ext.os.is.Blackberry)) {
			return new Ext.util.paintmonitor.OverflowChange(config);
		} else {
			return new Ext.util.paintmonitor.CssAnimation(config);
		}
	}
});
