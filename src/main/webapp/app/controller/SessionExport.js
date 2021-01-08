/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
Ext.define("ARSnova.controller.SessionExport", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Session',
		'ARSnova.model.Answer',
		'ARSnova.model.Question'
	],
	/**
	 * Exports selected sessions from the exportSessionMap to the public pool.
	 *
	 * @param exportSessions		An array of sessions the user wants to exort.
	 * @param publicPoolAttributes	An array of attributes to describe the sessions in the public pool.
	 */
	exportSessionsToPublicPool: function (sessionkey, publicPoolAttributes) {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_EXPORT, 240000);
		var showMySessionsPanel = function () {
			// forward to session panel
			var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
			hTP.animateActiveItem(hTP.mySessionsPanel, {
				type: 'slide',
				direction: 'right'
			});
			hideLoadMask();
		};
		var errorHandler = function (error) {
			hideLoadMask();
		};

		ARSnova.app.restProxy.copySessionToPublicPool(
			sessionkey, publicPoolAttributes, {
				success: function (response) {
					showMySessionsPanel();
				},
				failure: function () {
					console.log("export was not possible");
				}
			}
		);
	},

	getExportedSessions: function (sessionkeys, withAnswerStatistics, withFeedbackQuestions) {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_EXPORT, 240000);

		var sessionkeystring = sessionkeys.join('&sessionkey=');

		ARSnova.app.restProxy.exportSessions(
			sessionkeys, withAnswerStatistics, withFeedbackQuestions, {
				success: function (response) {
					var eD = Ext.decode(response.responseText);
					for (var i = 0; i < eD.length; i++) {
						me.writeExportDataToFile(eD[i]);
					}
					hideLoadMask();
				},
				failure: function () {
					console.log("export was not possible");
					hideLoadMask();
				}
			}
		);
	},

	writeExportDataToFile: function (exportData) {
		var jsonData = JSON.stringify({exportData: exportData});
		var dateTimeString = moment().format('YYYYMMDDHHmm');

		var filename = 'arsnova-session-' + exportData.session.shortName + '-' + dateTimeString + ".json";
		this.saveFileOnFileSystem(jsonData, filename);

		return jsonData;
	},

	saveFileOnFileSystem: function (rawJson, filename) {
		var blob = new Blob([rawJson], {type: "text/plain;charset=utf-8"});
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf("MSIE ");

		if (msie > 0 || navigator.userAgent.match(/Trident.*rv\:11\./)) {
			window.navigator.msSaveBlob(blob, filename);
		} else {
			var a = window.document.createElement('a');
			a.className = "session-export";
			a.href = window.URL.createObjectURL(blob);
			a.download = filename;

			// Append anchor to body.
			document.body.appendChild(a);
			a.click();
		}
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(hTP.mySessionsPanel, {
			type: 'slide',
			direction: 'right'
		});
	}
});
