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
Ext.define("ARSnova.controller.SessionImport", {
	extend: 'Ext.app.Controller',

	requires: [
		'ARSnova.model.Session',
		'ARSnova.model.Answer',
		'ARSnova.model.Question'
	],

	/**
	 * Import a single session from a JSON file.
	 */
	importSession: function(jsonContent) {
		var me = this;
		jsonContent = jsonContent.exportData;

		if (typeof jsonContent === "undefined" || typeof jsonContent.session === "undefined") {
			Ext.Msg.alert(Messages.IMP_ERROR, Messages.IMP_ERROR_FORMAT);
			return;
		}

		// extract session and save it to the database
		var storeSession = this.getElements(jsonContent.session, "ARSnova.model.Session");
		var session = storeSession.getAt(0);
		
		// attribute setup
		storeSession.each(function(e) {
			e._id     = undefined;
			e.creator = localStorage.getItem('login');
		});
		
		session.create({
			success: function(response) {
				//me.saveSessionAttachment(response, jsonContent);
			},
			failure: function(records, operation) {
				Ext.Msg.alert(Messages.IMP_ERROR, Messages.IMP_ERROR_SAVE);
			}
		});
	},
	
	/**
	 * Saves the answers, questions, etc. from a session.
	 * 
	 * @param The session retrieved after saving to the db e.g. for id reference.
	 * @param The content of the JSON file.
	 */
	saveSessionAttachment: function(session, jsonContent) {
		if (typeof jsonContent.answers !== undefined) {
			var storeAnswers     = this.getElements(jsonContent.answers, "ARSnova.model.Answer");	
			storeAnswers.each(function(e) {
				e._id       = undefined;
				e.user      = undefined;
				e.sessionId = session._id;
				
				e.saveAnswer({
					success: function() {
						console.log("Antwort gespeichert");
					},
					failure: function() {
						console.log("Konnte Antwort nicht speichern.");
					}
				});
			});	
		} else {
			console.log("No answers to import");
		}
		var storeQuestions   = this.getElements(jsonContent.questions, "ARSnova.model.Question");		
		// TODO var strgFBQuestions = this.getElements(jsonContent.studentQuestions, "ARSnova.model.Session"); // ???
				
			
		storeQuestions.each(function(e) {
			e._id       = undefined;
			e.sessionId = session._id;
			e.sessionKeyword = session.keyword;
			// TODO e.session = ???;
			
			e.saveSkillQuestion({
				success: function() {
					console.log("Frage gespeichert");
				},
				failure: function() {
					console.log("Konnte Frage nicht speichern.");
				}
			});
		});
	},
	
	/**
	 * Gets the ARSnova class objects from the json file.
	 */
	getElements: function(json, className) {
		var store = new Ext.data.Store({
			model: className,
			autoLoad: true, 
			data: eval('(' + JSON.stringify(json).trim() + ')')
		});
		return store;
	}
});