﻿/*
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
Ext.define('ARSnova.view.speaker.TabPanel', {
	extend: 'Ext.tab.Panel',

	requires: [
		'ARSnova.view.speaker.InClass',
		'ARSnova.view.speaker.AudienceQuestionPanel',
		'ARSnova.view.speaker.NewQuestionPanel',
		'ARSnova.view.speaker.ShowcaseQuestionPanel',
		'ARSnova.view.LearningProgressPanel',
		'ARSnova.view.about.AboutTabPanel'
	],

	config: {
		title: Messages.HOME,
		iconCls: 'icon-home',

		tabBar: {
			hidden: true
		}
	},

	initialize: function () {
		this.callParent(arguments);

		this.inClassPanel = Ext.create('ARSnova.view.speaker.InClass');
		this.audienceQuestionPanel = Ext.create('ARSnova.view.speaker.AudienceQuestionPanel');
		this.newQuestionPanel = Ext.create('ARSnova.view.speaker.NewQuestionPanel');
		this.showcaseQuestionPanel = Ext.create('ARSnova.view.speaker.ShowcaseQuestionPanel');
		this.learningProgressPanel = Ext.create('ARSnova.view.LearningProgressPanel');
		this.infoTabPanel = Ext.create('ARSnova.view.about.AboutTabPanel');

		this.on('activeitemchange', function (panel, newCard, oldCard) {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.lastActivePanel = oldCard;

			this.setWindowTitle(newCard);

			switch (oldCard) {
			case this.infoTabPanel:
			case this.audienceQuestionPanel:
			case this.newQuestionPanel:
			case this.showcaseQuestionPanel:
			case this.learningProgressPanel:
			case ARSnova.app.getController('Application').embeddedPage:
				break;

			default:
				ARSnova.app.lastActiveMainTabPanel = oldCard;
			}
		}, this);

		this.add([
				this.inClassPanel,
				this.audienceQuestionPanel,
				this.newQuestionPanel,
				this.infoTabPanel
			]);
	},

	renew: function () {
		this.remove(this.inClassPanel);
		this.inClassPanel = Ext.create('ARSnova.view.speaker.InClass');
		this.insert(0, this.inClassPanel);
		this.setActiveItem(this.inClassPanel);
		this.inClassPanel.registerListeners();
	}
});
