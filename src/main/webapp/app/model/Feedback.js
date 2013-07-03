/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/model/Feedback.js
 - Beschreibung: Feedback-Model
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
Ext.define('ARSnova.model.Feedback', {
	extend: 'Ext.data.Model',
	
	mixin: ['Ext.mixin.Observable'],
	
	config: {
		proxy: { type: 'restProxy' }
	},
	
	currentValues: [0, 0, 0, 0],
	currentAverage: null,
	
	constructor: function() {
		this.callParent(arguments);
		
		ARSnova.app.socket.addListener("arsnova/socket/feedback/update", function(values) {
			this.currentValues = values;
			this.fireEvent("arsnova/session/feedback/update", this.currentValues);
			this.fireEvent("arsnova/session/feedback/count", this.currentValues.reduce(function(a, b){
				return a + b;
			}, 0));
		}, this);
		
		ARSnova.app.socket.addListener("arsnova/socket/feedback/average", function(average) {
			this.currentAverage = average;
			this.fireEvent("arsnova/session/feedback/average", this.currentAverage);
		}, this);
	},
	
	getUserFeedback: function(sessionKeyword, callbacks){
		return this.getProxy().getUserFeedback(sessionKeyword, callbacks);
	},
	
	postFeedback: function(sessionKeyword, feedbackValue, callbacks) {
		return this.getProxy().postFeedback(sessionKeyword, feedbackValue, callbacks);
	},
	
	getAverageSessionFeedback: function(sessionKeyword, callbacks){
		return callbacks.success(this.currentAverage);
	},
	
	countFeedback: function(sessionKeyword, callbacks){
		return this.getProxy().countFeedback(sessionKeyword, callbacks);
	}
});