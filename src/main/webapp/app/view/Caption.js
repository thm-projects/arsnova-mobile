/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Erklärt die Farbgebung der Badges uns Sessions
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
	
	initialize: function() {
		this.callParent(arguments);
		
		this.listButton = new ARSnova.views.MultiBadgeButton({
			ui			: 'small',
			text		: "",
			cls			: 'forwardListButton caption',
			badgeCls	: "badgeicon",
			badgeText	: []
		});
		
		this.items = [].concat(window.innerWidth > 320 ? [{
			cls: 'gravure',
			style: {
				fontSize: "0.6em"
			},
			html: Messages.LEGEND
		}, this.listButton] : []);
	},
	
	explainSessionStatus: function(sessions) {
		var hasActiveSessions = false;
		sessions.forEach(function(session) {
			hasActiveSessions = hasActiveSessions || !!session.active;
		});
		var hasInactiveSessions = false;
		sessions.forEach(function(session) {
			hasInactiveSessions = hasInactiveSessions || !!!session.active;
		});
		
		var activeText = "";
		if (hasActiveSessions) {
			activeText = "<span class='isActive'>" + Messages.OPEN_SESSION + "</span>";
		}
		var inactiveText = "";
		if (hasInactiveSessions) {
			inactiveText = Messages.CLOSED_SESSION;
		}
		if (hasActiveSessions && hasInactiveSessions) {
			this.listButton.setText(inactiveText + " / " + activeText);
		} else {
			this.listButton.setText(activeText || inactiveText);
		}
	},
	
	explainBadges: function(badges) {
		var hasFeedbackQuestions = false;
		var hasQuestions = false;
		var hasAnswers = false;
		badges.forEach(function(item) {
			if (Ext.isNumber(item)) {
				hasQuestions = hasQuestions || item > 0;
			} else {
				hasFeedbackQuestions = hasFeedbackQuestions || item.hasFeedbackQuestions;
				hasQuestions = hasQuestions || item.hasQuestions;
				hasAnswers = hasAnswers || item.hasAnswers;
			}
		});
		this.listButton.setBadge([{
				badgeText: hasFeedbackQuestions ? Messages.QUESTIONS_FROM_STUDENTS : "", badgeCls: "bluebadgeicon"
			}, {
				badgeText: hasQuestions ? Messages.QUESTIONS : "", badgeCls: "badgeicon"
			}, {
				badgeText: hasAnswers ? Messages.ANSWERS : "", badgeCls: "redbadgeicon"
		}]);
	}
});
