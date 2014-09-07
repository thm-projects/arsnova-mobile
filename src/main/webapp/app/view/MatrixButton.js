/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
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
Ext.define('ARSnova.view.MatrixButton', {
	extend: 'Ext.Button',
	alias: 'x-matrixbutton',
	xtype: 'matrixbutton',

	requires: ['Ext.Img'],

	config: {
		image: '',
		text: '',
		cls: 'noBackground noBorder matrixButton',
		html: ['<span class="iconBtn"></span><span class="gravure buttonText" style="display:block"></span>'],
		listeners: {
			initialize: function (element, options) {
				var parent = Ext.get(element.id);
				var buttonText = parent.select(".buttonText").elements;
				var retina = window.devicePixelRatio >= 2;

				var imagefile = this.getImage() + ".png";
				var imagefile2x = this.getImage() + "@2x.png";
				if (this.getImage().indexOf("/") !== 0) {
					imagefile = "resources/images/" + imagefile;
					imagefile2x = "resources/images/" + imagefile2x;
				}
				var promise = new RSVP.Promise();
				if (retina) {
					var img = new Image();
					img.onload = function imageExists() {
						promise.resolve(imagefile2x);
					};
					img.onerror = function imageNotFound() {
						promise.resolve(imagefile);
					};
					img.src = imagefile2x;
				} else {
					promise.resolve(imagefile);
				}

				buttonText[0].innerHTML = this.getText();

				promise.then(function(theImage) {
					Ext.create('Ext.Img', {
						src: theImage,
						renderTo: parent.select(".iconBtn").elements[0],
						cls: "iconBtnImg"
					});
				});
			}
		}
	}
});
