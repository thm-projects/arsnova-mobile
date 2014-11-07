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
Ext.define('ARSnova.view.components.ModerationToolbar', {
	extend: 'Ext.Toolbar',

	config: {
		title: 'Template',
		docked: 'top',
		ui: 'light',

		backButtonHandler: Ext.emptyFn,
		saveButtonHandler: Ext.emptyFn
	},

	constructor: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			text: Messages.BACK,
			scope: this,
			handler: function () {
				var animation = {
					type: 'slide',
					direction: 'right',
					duration: 700
				};
				var callback = this.getBackButtonHandler();
				callback(animation);
			}
		});

		this.questionCounter = Ext.create('Ext.Component', {
			cls: "x-toolbar-title alignRight counterText",
			html: '0/0'
		});

		this.statisticsButton = Ext.create('Ext.Button', {
			text: 'Übernehmen'
		});

		this.add([
			this.backButton,
			{xtype: 'spacer'},
			this.questionCounter
		]);
	},

	setQuestionTitle: function (question) {
	
	},

	setTitleOptions: function (longVersion, shortVersion) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		if (screenWidth > 320 || this.backButton.isHidden()) {
			this.setTitle(longVersion);
		} else {
			this.setTitle(shortVersion);
		}
	},

	incrementQuestionCounter: function (activeIndex) {
		var counter = this.questionCounter.getHtml().split("/");
		counter[0] = activeIndex + 1;
		this.questionCounter.setHtml(counter.join("/"));
	},

	resetQuestionCounter: function (maxValue) {
		var counter = this.questionCounter.getHtml().split("/");
		counter[0] = "1";
		counter[1] = maxValue;
		this.questionCounter.setHtml(counter.join("/"));
	},

	checkStatistics: function (question, isDisabled) {
		if (typeof question !== 'undefined' && !!question.showStatistic && isDisabled) {
			this.statisticsButton.show();
		} else {
			this.statisticsButton.hide();
		}
	}
});
