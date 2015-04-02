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

Ext.define('ARSnova.model.PublicPool', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
		{
			name: 'name'
		},
		{
			name: 'hs'
		},
		{
			name: 'logo'
		},
		{
			name: 'subject'
		},
		{
			name:	'licence'
		},
		{
			name:	'email'
		},
		{
			name: 'sessionName'
		},
		{
			name: 'sessionShortName'
		},
		{
			name: 'description'
		},
		{
			name: 'faculty'
		},
		{
			name: 'level'
		}
		],
		validations: [
		{
			type: 'presence',
			field: 'name',
			message: Messages.EXPORT_FIELD_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_NAME
		},
		{
			type: 'presence',
			field: 'hs',
			message: Messages.EXPORT_FIELD_UNI + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_UNIVERSITY
		},
		{
			type: 'presence',
			field: 'subject',
			message: Messages.EXPORT_FIELD_SUBJECT + ':\t ' + Messages.SESSIONPOOL_NOTIFICATION_SUBJECT
		},
		{
			type: 'presence',
			field: 'licence',
			message: Messages.EXPORT_FIELD_LICENCE + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_LICENCE
		},
		{
			type: 'email',
			field: 'email',
			message: Messages.EXPORT_FIELD_EMAIL + ': ' + Messages.SESSIONPOOL_NOTIFICATION_EMAIL
		},
		{
			type: 'presence',
			field: 'sessionName',
			message: Messages.SESSION_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_SESSION_NAME
		},
		{
			type: 'presence',
			field: 'sessionShortName',
			message: Messages.SESSION_SHORT_NAME + ':\t' + Messages.SESSIONPOOL_NOTIFICATION_SESSION_SHORTNAME
		}
		]
	}
});
