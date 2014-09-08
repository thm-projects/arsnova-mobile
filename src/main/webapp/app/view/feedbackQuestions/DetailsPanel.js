/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedbackQuestions/detailsPanel.js
 - Beschreibung: Panel für die Details einer Zwischenfrage (für Dozenten).
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
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
Ext.define('ARSnova.view.feedbackQuestions.DetailsPanel', {
	extend: 'Ext.Panel',

	config: {
		title: 'DetailsPanel',
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		isRendered: false
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,
	questionObj: null,

	constructor: function (args) {
		this.callParent(arguments);

		this.questionObj = args.question;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.QUESTIONS,
			ui: 'back',
			scope: this,
			handler: function () {
				var sQP = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				sQP.animateActiveItem(sQP.questionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
//				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getFeedbackQuestions();
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


		// Preview button
		this.previewButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_PREVIEW_BUTTON_TITLE,
			ui: 'confirm',
			cls: 'previewButton',
			scope: this,
			handler: function () {
					this.previewHandler();
				}
		});

		// Preview panel with integrated button
		this.previewPart = Ext.create('Ext.form.FormPanel', {
			cls: 'newQuestion',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [this.previewButton]
			}]
		});

		this.add([this.toolbar, {
			xtype: 'formpanel',
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [{
					xtype: 'textfield',
					label: Messages.QUESTION_DATE,
					value: this.questionObj.fullDate,
					disabled: true
				}, {
					xtype: 'textfield',
					label: Messages.QUESTION_SUBJECT,
					value: this.questionObj.subject,
					disabled: true
				}, {
					xtype: "textareafield",
					label: Messages.QUESTION_TEXT,
					value: this.questionObj.text,
					disabled: true
				}]
			}]
		},

		this.previewPart,

		{
			xtype: 'button',
			ui: 'decline',
			cls: 'centerButton',
			text: Messages.DELETE,
			scope: this,
			handler: function () {
				var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel;

				ARSnova.app.questionModel.deleteInterposed(this.questionObj, {
					failure: function (response) {
						console.log('server-side error delete question');
					}
				});

				panel.animateActiveItem(panel.questionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		}]);

		this.on('deactivate', this.onDeactivate);

		this.on('painted', function () {
			var textarea = this.element.down('textarea');
			textarea.setHeight(textarea.dom.scrollHeight);
		});
	},

	previewHandler: function () {
		var questionPreview = Ext.create('ARSnova.view.QuestionPreviewBox', {
			xtype: 'questionPreview'
		});
		questionPreview.showPreview(this.questionObj.subject,this.questionObj.text);
	},

	onDeactivate: function () {
		setTimeout("ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();", 500);
	}
});
