/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Erklärt die Farbgebung der Badges und Fragen/Sessions
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.Caption', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.MultiBadgeButton'],

	config: {
		translation: {
			active: Messages.OPEN_SESSION,
			inactive: Messages.CLOSED_SESSION
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.listButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'small',
			text: "",
			cls: 'forwardListButton caption'
		});

		this.add([].concat(window.innerWidth > 320 ? [{
			cls: 'gravure',
			style: {
				fontSize: "0.6em"
			},
			html: Messages.LEGEND
		}, this.listButton]: []));
	},

	explainStatus: function (items) {
		var hasActiveItems = false;
		items.forEach(function (item) {
			hasActiveItems = hasActiveItems || !!item.active;
		});
		var hasInactiveItems = false;
		items.forEach(function (item) {
			hasInactiveItems = hasInactiveItems || !!!item.active;
		});

		var activeText = "";
		if (hasActiveItems) {
			activeText = this.getTranslation().active;
		}
		var inactiveText = "";
		if (hasInactiveItems) {
			inactiveText = "<span class='isInactive'>" + this.getTranslation().inactive + "</span>";
		}
		if (hasActiveItems && hasInactiveItems) {
			this.listButton.setText(inactiveText + " / " + activeText);
		} else {
			this.listButton.setText(activeText || inactiveText);
		}
	},

	explainBadges: function (badges) {
		var hasFeedbackQuestions = false;
		var hasQuestions = false;
		var hasAnswers = false;
		badges.forEach(function (item) {
			if (Ext.isNumber(item)) {
				hasQuestions = hasQuestions || item > 0;
			} else {
				hasFeedbackQuestions = hasFeedbackQuestions || item.hasFeedbackQuestions;
				hasQuestions = hasQuestions || item.hasQuestions;
				hasAnswers = hasAnswers || item.hasAnswers;
			}
		});
		this.listButton.setBadge([{
				badgeText: hasFeedbackQuestions ? Messages.QUESTIONS_FROM_STUDENTS: "", badgeCls: "bluebadgeicon"
			}, {
				badgeText: hasQuestions ? Messages.QUESTIONS: "", badgeCls: "greybadgeicon"
			}, {
				badgeText: hasAnswers ? Messages.ANSWERS: "", badgeCls: "redbadgeicon"
		}]);
		return badges;
	},

	connectToStore: function (store) {
		store.on('updaterecord', function (theStore, record) {
			var records = [];
			store.each(function (r) {
				records.push(r.data);
			});
			this.explainStatus(records);
		}, this);
	}
});
