/*
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

Ext.define('ARSnova.view.speaker.form.GridModerationQuestion', {
	extend: 'Ext.Carousel',
	fullscreen: true,
	
	config: {
		fullscreen: true,
		title: 'Template',
		
		questionLoader: null,
		questionCountLoader: null,

	},
	
	initialize: function () {
		var me = this;
		this.callParent(arguments);
	},
	
	/**
	 * Loads the template JSON file and starts the configuration process on success.
	 * 
	 * @param successCallback(templates) The function which gets called after the templates were
	 * loaded successfully.
	 */
	getTemplates : function(successCallback) {
		Ext.Ajax.request({
			url: 'resources/gridTemplates/templates.json',
			success: function(response, opts) {
				var config = JSON.parse(response.responseText);
				var templates = new Array();

				// extract all the templates
				if (typeof(config) != "undefined") {
					config.forEach(function(entry) {
						var template = Ext.create('ARSnova.view.components.GridModerationContainer');
						template.setConfig(entry);
						templates.push(template);
					});
				}
				
				successCallback(templates);
			},
			failure: function(response, opts) {
				// iOS in phonegap returns response.status=0 on success
				if(response.status == 0 && response.responseText != ''){
					console.log(response.responseText);
				} else {
					console.error('Could not find template.json');
				}
			}
		});
	},
});