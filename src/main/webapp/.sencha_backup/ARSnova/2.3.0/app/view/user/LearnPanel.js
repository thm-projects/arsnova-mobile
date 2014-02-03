/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Zum Anzeigen der Lernoptionen
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
Ext.define('ARSnova.view.user.LearnPanel', {
	extend: 'Ext.Container',
	
	config: {
		title: 'Learn',
		fullscreen: true,
		scrollable: true
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		var comingSoon = function(component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				html: "<div style='padding: 0.5em'>"+Messages.FEATURE_COMING_SOON+"</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function() {
				comingSoonPanel.destroy();
			}, 2000);
		};
		
		var titlebar = {
			docked: 'top',
			xtype: 'titlebar',
			ui: 'light',
			title: Messages.LEARN,
			items: [{
				ui: 'back',
				text: Messages.BACK,
				handler: function() {
					var uTP = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
					uTP.animateActiveItem(uTP.inClassPanel, {
						type: 'slide',
						direction: 'right'
					});
				}
			}]
		};
		
		var lectureToggle = Ext.create('Ext.field.Toggle', {
			cls: 'questionDetailsToggle',
			value: 1
		});
		var lecture = Ext.create('Ext.Container', {
			cls: 'twoButtons left',
			items: [lectureToggle, {
				html: Messages.LECTURE,
				cls: 'centerTextSmall'
			}]
		});
		var preparationToggle = Ext.create('Ext.field.Toggle', {
			cls: 'questionDetailsToggle',
			value: 1
		});
		var preparation = Ext.create('Ext.Container', {
			items: [preparationToggle, {
				html: Messages.PREPARATION,
				cls: 'centerTextSmall'
			}]
		});
		var firstRow = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm',
			scrollable: null,
			
			style: {
				marginTop: '15px'
			},
			items: [lecture, preparation]
		});
		
		var flashcardsToggle = Ext.create('Ext.field.Toggle', {
			cls: 'questionDetailsToggle',
			value: 1
		});
		var flashcards = Ext.create('Ext.Container', {
			cls: 'twoButtons left',
			items: [flashcardsToggle, {
				html: Messages.FLASHCARDS,
				cls: 'centerTextSmall'
			}]
		});
		var unansweredQuestionsToggle = Ext.create('Ext.field.Toggle', {
			cls: 'questionDetailsToggle',
			value: 1
		});
		var unansweredQuestions = Ext.create('Ext.Container', {
			items: [unansweredQuestionsToggle, {
				html: Messages.UNANSWERED_QUESTIONS,
				cls: 'centerTextSmall'
			}]
		});
		var secondRow = Ext.create('Ext.form.FormPanel', {
			cls	 : 'actionsForm',
			scrollable: null,
			
			style: {
				marginTop: '15px'
			},
			items: [flashcards, unansweredQuestions]
		});
		
		var learnButton = Ext.create('Ext.Button', {
			text: Messages.LEARN_WITH_SELECTION,
			cls: "forwardListButton",
			handler: comingSoon
		});
		var learn = Ext.create('Ext.Container', {
			cls : 'standardForm topPadding',
			items: [learnButton]
		});
		var resetButton = Ext.create('Ext.Button', {
			ui: 'decline',
			text: Messages.RESET_ALL_ANSWERS,
			handler: comingSoon
		});
		var reset = Ext.create('Ext.Container', {
			cls : 'standardForm topPadding',
			items: [resetButton]
		});
		
		this.add([titlebar, firstRow, secondRow, learn, reset]);
	}
	
});
