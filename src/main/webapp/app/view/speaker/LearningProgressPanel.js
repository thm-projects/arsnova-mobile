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
Ext.define('ARSnova.view.speaker.LearningProgressPanel', {
	extend: 'Ext.Panel',

	requires: ['Ext.field.Radio'],

	config: {
		title: 'AudienceQuestionPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: 'vbox',
		defaults: {
			flex: 1
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.animateActiveItem(sTP.inClassPanel, {
					type: 'slide',
					direction: 'right'
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.COURSES_LEARNING_PROGRESS,
			cls: 'speakerTitleText',
			ui: 'light',
			docked: 'top',
			items: [
				this.backButton
			]
		});


		this.pointBasedExplanation = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			hidden: true
		});
		this.pointBasedExplanation.setContent([
			'Der punktbasierte Lernstand gewichtet Fragen mit vielen richtigen Antwortoptionen stärker als Fragen mit nur einer richtigen Option. Der Lernstand berechnet sich beispielhaft wie folgt:\n',
			'Es sind 3 Fragen vorhanden, die jeweils eine maximalmögliche Punktzahl haben. Die Punkte seien 10, 20 und 30.',
			'Das bedeutet, dass ein Studierender für die Beantwortung der 3 Fragen insgesamt 60 Punkte erreichen kann.',
			'Bei Auswahl von falschen Antwortmöglichkeiten reduziert sich die erreichte Punktzahl, z.B. auf 30.',
			'Der individuelle Lernstand berechnet sich also nach der Formel: \\[ l_{\\text{Stud}} = \\frac{\\text{Erreichte Punkte}}{\\text{Mögliche Punkte}} = \\frac{30}{60} \\hat{=}\\, 50\\%\\]\n',
			'Für den Kurs ergibt sich der Lernstand über die Anzahl der Studierenden: \\[l_{\\text{Kurs}} = \\frac{\\text{Erreichte Punkte aller Studierender}}{\\text{Mögliche Punkte} \\cdot \\text{Anzahl Studierende}}\\]'
		].join('\n'), true, true);


		this.questionBasedExplanation = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			hidden: false
		});
		this.questionBasedExplanation.setContent([
			'Mit dem fragenbasierten Lernstand sind alle Fragen gleich gewichtet, selbst wenn es für sie unterschiedliche Höchstpunktzahlen gibt. Der Lernstand berechnet sich beispielhaft wie folgt:\n',
			'Es sind 3 Fragen vorhanden, die jeweils eine maximalmögliche Punktzahl haben. Die Punkte seien 10, 20 und 30.',
			'Eine Frage gilt als korrekt beantwortet, wenn die jeweilige Maximalpunktzahl erreicht ist. Das heißt, wenn eine',
			'falsche Antwortoption gewählt wurde, werden Punkte abgezogen und die Maximalpunktzahl kann nicht mehr erreicht werden.',
			'Erreicht ein Studierender für die drei Fragen eine Punktzahl von 10, 20 und 20 wurde demnach die letzte Frage falsch beantwortet.',
			'Der individuelle Lernstand berechnet sich nach der Formel: \\[ l_{\\text{Stud}} = \\frac{\\text{Anzahl richtiger Antworten}}{\\text{Anzahl Fragen}} = \\frac{2}{3} \\hat{=}\\, 67\\%\\]\n',
			'Für den Kurs ergibt sich der Lernstand über die Anzahl der Studierenden: \\[l_{\\text{Kurs}} = \\frac{\\text{Richtige Antworten aller Studierender}}{\\text{Anzahl Fragen} \\cdot \\text{Anzahl Studierende}}\\]'
		].join('\n'), true, true);

		this.learningProgressChooser = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				title: "Wie soll der Lernstand berechnet werden?",
				items: [{
					xtype: 'radiofield',
					name : 'learningProgressChooser',
					value: 'questions',
					label: 'Fragenbasiert',
					checked: true,
					listeners: {
						scope: this,
						check: function (field) {
							this.showQuestionBasedCalculation();
						},
						uncheck: function (field) {
							this.showPointBasedCalculation();
						}
					}
				}, {
					xtype: 'radiofield',
					name : 'learningProgressChooser',
					value: 'points',
					label: 'Punktbasiert'
				}]
			}, this.pointBasedExplanation, this.questionBasedExplanation]
		});

		this.add([this.toolbar, this.learningProgressChooser]);
	},

	showPointBasedCalculation: function () {
		this.questionBasedExplanation.hide();
		this.pointBasedExplanation.show('fade');
	},

	showQuestionBasedCalculation: function () {
		this.questionBasedExplanation.show('fade');
		this.pointBasedExplanation.hide();
	}
});
