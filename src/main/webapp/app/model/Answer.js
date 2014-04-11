/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/model/Answer.js
 - Beschreibung: Answer-Model
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
Ext.define('ARSnova.model.Answer', {
	extend: 'ARSnova.model.ARSmodel',
	
	config: {
		proxy: { type: 'restProxy' },
		
		fields: [
			     'correct',
			     'id',
			     'text',
			     'user',
			     'answerSubject',
			     'answerText',
			     'questionId',
			     'sessionId',
			     'abstention',
			     'timestamp',
			     'questionVariant',
			     'questionValue',
			     'value'
		         ],

		idProperty: '_id'
	},
	
	getUserAnswer: function(questionId, callbacks){
		return this.getProxy().getUserAnswer(questionId, callbacks);
	},
	
	getAnswerByUserAndSession: function(sessionKeyword, callbacks){
		return this.getProxy().getAnswerByUserAndSession(sessionKeyword, callbacks);
	},
	
	saveAnswer: function(callbacks) {
		if (this.get('_id') && this.get('_rev')) {
			return this.getProxy().updateAnswer(this, callbacks);
		}
		return this.getProxy().saveAnswer(this, callbacks);
	}
});
