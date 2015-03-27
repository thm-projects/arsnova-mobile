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
Ext.define('ARSnova.view.LearningProgressPanel', {
	extend: 'Ext.Panel',

	requires: ['Ext.field.Radio'],

	config: {
		title: 'LearningProgressPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				// store the learning progress type when we leave this panel
				ARSnova.app.getController('Sessions').setLearningProgressType(this.learningProgressChooser.getValues());
				ARSnova.app.getController('Questions').leaveLearningProgress();
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.COURSES_LEARNING_PROGRESS_SHORT,
			cls: 'speakerTitleText',
			ui: 'light',
			docked: 'top',
			items: [
				this.backButton
			]
		});

		this.courseLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			itemId: 'courseLearningProgressExample',
			text: Messages.CURRENT_VALUE,
			cls: 'standardListButton roundedBox x-html',
			disabledCls: '',
			disabled: true
		});

		this.pointBasedExplanation = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			hidden: true
		});
		this.pointBasedExplanation.setContent(Messages.SCORE_BASED_PROGRESS_EXPLANATION, true, true);


		this.questionBasedExplanation = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			hidden: false
		});
		this.questionBasedExplanation.setContent(Messages.QUESTION_BASED_PROGRESS_EXPLANATION, true, true);

		var initializer = function (field) {
			if (field.getValue() === ARSnova.app.getController('Sessions').getLearningProgressType()) {
				field.check();
			}
			if (field.isChecked()) {
				this.showRealProgressValue(field.getValue());
			}
		};

		this.learningProgressChooser = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				cls: 'learningprogress-title',
				title: Messages.HOW_TO_CALCULATE_LEARNING_PROGRESS,
				items: [{
					xtype: 'radiofield',
					name: 'progressType',
					value: 'questions',
					label: Messages.QUESTION_BASED_PROGRESS,
					checked: true,
					labelWidth: '50%',
					listeners: {
						scope: this,
						check: function (field) {
							this.showQuestionBasedCalculation();
							this.showRealProgressValue(field.getValue());
						},
						initialize: initializer
					}
				}, {
					xtype: 'radiofield',
					name: 'progressType',
					value: 'points',
					label: Messages.SCORE_BASED_PROGRESS,
					labelWidth: '50%',
					listeners: {
						scope: this,
						check: function (field) {
							this.showPointBasedCalculation();
							this.showRealProgressValue(field.getValue());
						},
						initialize: initializer
					}
				}]
			}, this.courseLearningProgressButton, this.pointBasedExplanation, this.questionBasedExplanation]
		});

		this.on('show', function () {
			this.showRealProgressValue(ARSnova.app.getController('Sessions').getLearningProgressType());
		}, this);

		this.add([this.toolbar, this.learningProgressChooser]);
	},

	showPointBasedCalculation: function () {
		this.questionBasedExplanation.hide();
		this.pointBasedExplanation.show('fade');
	},

	showQuestionBasedCalculation: function () {
		this.questionBasedExplanation.show('fade');
		this.pointBasedExplanation.hide();
	},

	showRealProgressValue: function (type) {
		ARSnova.app.getController('Sessions').getCourseLearningProgressByType({
			progressType: type,
			callbacks: {
				scope: this,
				success: function (text, color, progress, progressType) {
					this.courseLearningProgressButton.setBadge([{badgeText: text, badgeCls: color + "badgeicon"}]);
				},
				failure: Ext.emptyFn
			}
		});
	}
});
