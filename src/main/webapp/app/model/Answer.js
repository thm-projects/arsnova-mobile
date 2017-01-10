/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.model.Answer', {
	extend: 'ARSnova.model.ARSmodel',

	config: {
		proxy: {type: 'restProxy'},

		fields: [
			'correct',
			'id',
			'text',
			'user',
			'answerSubject',
			'answerText',
			'answerImage',
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

	getUserAnswer: function (questionId, callbacks) {
		return this.getProxy().getUserAnswer(questionId, callbacks);
	},

	getAnswerCount: function (questionId, callbacks) {
		return this.getProxy().getAnswerCount(questionId, callbacks);
	},

	getAnswerAndAbstentionCount: function (questionId, callbacks) {
		return this.getProxy().getAnswerAndAbstentionCount(questionId, callbacks);
	},

	getAnswerByUserAndSession: function (sessionKeyword, callbacks) {
		return this.getProxy().getAnswerByUserAndSession(sessionKeyword, callbacks);
	},

	saveAnswer: function (questionId, callbacks) {
		if (!this.phantom) {
			return this.getProxy().updateAnswer(this, questionId, callbacks);
		}
		return this.getProxy().saveAnswer(this, questionId, callbacks);
	}
});
