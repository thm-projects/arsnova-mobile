/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2018 The ARSnova Team and Contributors
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

Ext.define('ARSnova.view.AnswerPreviewBox', {
	extend: 'Ext.MessageBox',

	config: {
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		maxWidth: 360,
		maxHeight: 640,
		hideOnMaskTap: true,
		layout: 'vbox'
	},

	initialize: function (args) {
		this.callParent(args);

		this.setStyle({
			'font-size': '110%',
			'border-color': 'black',
			'margin-bottom': '18px',
			'height': '79%',
			'width': '95%'
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE,
			docked: 'top',
			ui: 'light',
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				handler: this.hide,
				scope: this,
				style: {
					'height': '36px',
					'font-size': '0.9em',
					'padding': '0 0.4em'
				}
			}, {xtype: 'spacer'},
				this.statisticButton = Ext.create('Ext.Button', {
					iconCls: 'icon-chart',
					style: 'padding: 0 0.4em',
					handler: this.statisticsButtonHandler,
					scope: this
				})
			]
		});

		this.confirmButton = Ext.create('Ext.Container', {
			layout: {
				pack: 'center',
				type: 'hbox'
			},
			items: [
				Ext.create('Ext.Button', {
					text: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
					ui: 'confirm',
					style: 'width: 80%; maxWidth: 250px; margin-top: 10px;',
					scope: this,
					handler: function () {
						this.hide();
					}
				})
			]
		});

		// Create standard panel with framework support
		this.titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: ""
		});

		this.bodyPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: ""
		});

		this.questionPanel = Ext.create('Ext.Panel', {
			cls: "roundedBox",
			style: 'min-height: 82px;'
		});

		this.questionPanel.add([this.titlePanel, this.bodyPanel]);

		// answer preview box content panel
		this.mainPanel = Ext.create('Ext.Container', {
			layout: 'vbox',
			style: 'margin-bottom: 10px;',
			styleHtmlContent: true,
			items: [this.questionPanel]
		});

		// remove padding around mainPanel
		this.mainPanel.bodyElement.dom.style.padding = "0";

		this.on('hide', function () {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.activePreviewPanel = false;
			this.destroy();
		});

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			ARSnova.app.activePreviewPanel = this;
		});

		this.add([
			this.toolbar,
			this.mainPanel
		]);
	},

	showPreview: function (options) {
		this.answers = options.answers;
		this.content = options.content;
		this.questionType = options.questionType;
		this.titlePanel.setContent(options.title, false, false);
		this.bodyPanel.setContent(options.content, true, true);

		if (options.image) {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				itemId: 'previewGridImageContainer',
				customWindowWidth: this.getMaxWidth(),
				gridIsHidden: true,
				editable: false
			});

			this.grid.setImage(options.image);
			this.mainPanel.add(this.grid);
		}

		this.statisticButton.setHidden(
			options.questionType === 'grid' ||
			options.questionType === 'flashcard'
		);

		if (options.questionType === 'grid') {
			if (options.image) {
				this.grid.setGridIsHidden(false);
				this.grid.setEditable(true);
			}
		} else if (options.questionType === 'flashcard') {
			this.prepareFlashcardQuestion(options);
		} else {
			this.answerList = Ext.create('ARSnova.view.components.List', {
				store: Ext.create('Ext.data.Store', {
					model: 'ARSnova.model.Answer'
				}),

				cls: 'roundedBox',
				itemHeight: '32px',
				itemCls: 'arsnova-mathdown x-html answerListButton noPadding',
				itemTpl: new Ext.XTemplate(
					"<tpl if='this.isFormattedStringEmpty(formattedText) === true'>",
						"&nbsp;",
					"<tpl else>",
						'<tpl if="correct === true">',
							'<span class="answerOptionItem answerOptionCorrectItem">&nbsp;</span>',
						'<tpl else>',
							'<span class="answerOptionItem">&nbsp;</span>',
						'</tpl>',
						'<span class="answerOptionText">{formattedText}</span>',
					"</tpl>",
					{
						isFormattedStringEmpty: function (formattedString) {
							if (formattedString === "") {
								return true;
							} else {
								return false;
							}
						}
					}
				)
			});

			this.answerList.getStore().add(this.answers);
			this.answerList.getStore().each(function (item) {
				if (ARSnova.app.globalConfig.parseAnswerOptionFormatting) {
					var md = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
					md.setContent(item.get('text'), true, true, function (html) {
						item.set('formattedText', html.getHtml());
						md.destroy();
					});
				} else {
					item.set('formattedText', Ext.util.Format.htmlEncode(item.get('text')));
				}
			});

			this.mainPanel.add([this.answerList]);
		}

		this.show();

		if (options.questionType === 'flashcard') {
			var me = this;
			this.resizeFlashcardContainer();
			setTimeout(function () { me.resizeFlashcardContainer.call(me); }, 750);
		} else {
			this.mainPanel.add([
				this.confirmButton
			]);
		}

		// for IE: unblock input fields
		Ext.util.InputBlocker.unblockInputs();
	},

	prepareFlashcardQuestion: function (options) {
		this.remove(this.mainPanel, false);
		this.mainPanel.remove(this.confirmButton, false);
		this.questionPanel.remove(this.titlePanel);
		this.answerPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			style: 'word-wrap: break-word;'
		});

		this.questionContainer = Ext.create('Ext.Container', {
			cls: "questionPanel flashcard",
			items: [this.questionPanel, this.answerPanel]
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			cls: 'flashcardContainer',
			items: [this.questionContainer]
		});

		// add css classes for 3d flip animation
		this.questionPanel.addCls('front');
		this.answerPanel.addCls('back');
		this.answerPanel.setContent(options.answers[0].text, true, true);
		this.answerPanel.setHidden(true);

		this.formPanel.add([{
			xtype: 'button',
			cls: 'saveButton centered',
			ui: 'confirm',
			text: Messages.SHOW_FLASHCARD_ANSWER,
			handler: function (button) {
				if (!this.questionContainer.isFlipped) {
					this.questionContainer.isFlipped = true;
					this.questionPanel.setHidden(true);
					this.answerPanel.setHidden(false);
					button.setText(Messages.HIDE_FLASHCARD_ANSWER);
				} else {
					this.questionContainer.isFlipped = false;
					this.questionPanel.setHidden(false);
					this.answerPanel.setHidden(true);
					button.setText(Messages.SHOW_FLASHCARD_ANSWER);
				}
			},
			scope: this
		}, this.confirmButton]);

		this.add(this.formPanel);
	},

	resizeFlashcardContainer: function () {
		var back = this.answerPanel;
		var front = this.questionPanel;
		var container = this.questionContainer;
		var hiddenEl = container.isFlipped ? front : back;
		var shownEl = !container.isFlipped ? front : back;
		var heightBack, heightFront;

		back.setHeight('initial');
		front.setHeight('initial');
		hiddenEl.setHidden(true);
		shownEl.setHidden(false);
		heightBack = back.element.dom.getBoundingClientRect().height;
		heightFront = front.element.dom.getBoundingClientRect().height;

		if (!heightFront || !heightBack) {
			return;
		}

		if (heightBack > heightFront) {
			container.setHeight(heightBack + 20);
			front.setHeight(heightBack);
			back.setHeight(heightBack);
		} else {
			container.setHeight(heightFront + 20);
			front.setHeight(heightFront);
			back.setHeight(heightFront);
		}
	},

	statisticsButtonHandler: function () {
		var questionObj = {};
		questionObj.possibleAnswers = this.answers;
		questionObj.text = this.content;

		this.questionStatisticChart = Ext.create('ARSnova.view.AnswerPreviewStatisticChart', {
			question: questionObj,
			lastPanel: this
		});

		this.remove(this.toolbar, false);
		this.remove(this.mainPanel, false);
		this.setScrollable(false);

		this.add([
			this.questionStatisticChart
		]);
	},

	showEmbeddedPagePreview: function (embeddedPage) {
		var controller = ARSnova.app.getController('Application'),
			me = this;

		this.setHideOnMaskTap(false);

		// remove default elements from preview
		this.remove(this.toolbar, false);
		this.remove(this.mainPanel, false);

		if (this.questionType === 'flashcard') {
			this.remove(this.formPanel, false);
		}

		embeddedPage.setBackHandler(function () {
			me.setHideOnMaskTap(true);

			// toggle hrefPanelActive();
			controller.toggleHrefPanelActive();

			// remove & destroy embeddedPage and delete reference
			me.remove(embeddedPage, true);
			delete controller.embeddedPage;

			// add default elements to preview
			me.add(me.toolbar);

			if (me.questionType === 'flashcard') {
				me.add(me.formPanel, me.mainPanel);
			} else {
				me.add(me.mainPanel);
			}
		});

		// add embeddedPage to preview
		this.add(embeddedPage);
	}
});
