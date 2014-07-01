/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Autor(en):    Daniel Knapp <daniel.knapp@mni.thm.de>
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

				var imagefile = "resources/images/" + this.getImage() + ".png";
				var imagefile2x = "resources/images/" + this.getImage() + "@2x.png";
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
