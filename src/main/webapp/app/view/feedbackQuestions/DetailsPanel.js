/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.feedbackQuestions.DetailsPanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'DetailsPanel',
		fullscreen: true,
		lastPanel: null,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		},
		isRendered: false,
		question: null
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	questionObj: null,

	constructor: function (args) {
		this.callParent(arguments);
		var me = this;

		this.questionObj = this.getQuestion();

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.QUESTIONS,
			ui: 'back',
			scope: this,
			handler: function () {
				var feedbackQuestionsPanel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				var target = this.config.lastPanel || feedbackQuestionsPanel.questionsPanel;

				me.speakerUtilities.initializeZoomComponents();
				feedbackQuestionsPanel.animateActiveItem(target, {
					type: 'slide',
					direction: 'right'
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION_DETAILS,
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton
			]
		});

		// Setup question title and text to display in the same field; markdown handles HTML encoding
		var questionString = this.questionObj.getFormattedDateTime().replace(/\./, "\\.") + ": " + this.questionObj.get('subject')
			+ '\n\n' // inserts one blank line between subject and text
			+ this.questionObj.get('text');

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: "roundedBox allCapsHeader"
		});
		questionPanel.setContent(questionString, true, true);

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [questionPanel]
		});

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			autoApplyBottomPadding: false,
			showProjectorButton: true,
			hidden: true
		});

		this.add([
			this.toolbar,
			this.speakerUtilities,
			this.formPanel,
			{
				xtype: 'button',
				ui: 'decline',
				cls: 'centerButton',
				text: Messages.DELETE,
				scope: this,
				handler: function () {
					var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
					ARSnova.app.questionModel.deleteInterposed(this.questionObj, {
						success: function () {
							me.questionObj.destroy();
							me.speakerUtilities.initializeZoomComponents();
							panel.animateActiveItem(panel.questionsPanel, {
								type: 'slide',
								direction: 'right'
							});
						},
						failure: function (response) {
							console.log('server-side error delete question');
						}
					});
				}
			}
		]);

		this.on('activate', this.onActivate);
		this.on('painted', this.onPainted);
		this.on('deactivate', this.onDeactivate);
	},

	onActivate: function () {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if (screenWidth > 700 && ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.speakerUtilities.initializeZoomComponents();
			this.speakerUtilities.show();
		}
	},

	onPainted: function () {
		ARSnova.app.innerScrollPanel = this;
		this.speakerUtilities.setProjectorMode(this, ARSnova.app.projectorModeActive);
	},

	onDeactivate: function () {
		ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getCheckFeedbackQuestionsTask().taskRunTime = 0;
		ARSnova.app.innerScrollPanel = false;
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
		this.setZoomLevel(ARSnova.app.globalZoomLevel);
		this.zoomButton.isActive = false;
	},

	zoomButtonHandler: function () {
		if (this.zoomButton.isActive) {
			this.initializeZoomComponents();
		} else {
			this.zoomButton.setIconCls('icon-close');
			this.zoomButton.addCls('zoomSheetActive');
			this.zoomButton.isActive = true;
			this.actionSheet.show();
		}
	},

	setZoomLevel: function (size) {
		this.formPanel.setStyle('font-size: ' + size + '%;');
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);
	}
});
