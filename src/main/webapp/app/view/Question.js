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
/**
 * We need to override this class in order to allow custom itemHeights on list elements
 */
Ext.define('ARSnova.view.PositionMap', {
	override: 'Ext.util.PositionMap',
	config: {
		minimumHeight: 0
	}
});

Ext.define('ARSnova.view.Question', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.model.Answer',
		'ARSnova.view.CustomMask',
		'ARSnova.view.MathJaxMarkDownPanel',
		'ARSnova.view.speaker.ShowcaseEditButtons',
		'ARSnova.view.components.MarkdownMessageBox'
	],

	config: {
		padding: '0 0 20 0',

		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	abstentionInternalId: 'ARSnova_Abstention',
	abstentionAnswer: null,

	initialize: function () {
		this.callParent(arguments);

		var me = this;
		this.viewOnly = this.config.viewOnly;
		this.questionObj = this.config.questionObj;
		var isAnswerable = !this.viewOnly && ['mc', 'flashcard'].indexOf(this.questionObj.questionType) === -1;

		this.customMask = Ext.create('ARSnova.view.CustomMask', {
			mainPanel: this
		});

		this.questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel');

		this.hintIcon = Ext.create('Ext.Button', {
			cls: 'sessionInfoButton maskClickable',
			iconCls: 'info',
			scope: this,
			style: 'float: right',
			hidden: !(this.questionObj.hint),
			handler: function (button) {
				me.hintPanel.show();
			}
		});

		this.questionContainer = Ext.create('Ext.Container', {
			cls: "roundedBox questionPanel",
			items: [this.hintIcon, this.questionPanel]
		});

		this.hintPanel = Ext.create('ARSnova.view.components.MarkdownMessageBox', {
			content: this.questionObj.hint
		});

		this.solutionPanel = Ext.create('ARSnova.view.components.MarkdownMessageBox', {
			content: this.questionObj.solution
		});

		this.abstentionButton = !this.questionObj.abstention ? {hidden: true} : Ext.create('Ext.Button', {
			flex: 1,
			ui: 'action',
			xtype: 'button',
			cls: 'saveButton noMargin',
			text: Messages.ABSTENTION,
			handler: this.mcAbstentionHandler,
			scope: this
		});

		this.buttonContainer = Ext.create('Ext.Container', {
			layout: {
				type: 'hbox',
				align: 'stretch',
				pack: 'center'
			},
			defaults: {
				style: "margin: 10px;"
			},
			hidden: !!this.questionObj.userAnswered ||
				this.questionObj.isAbstentionAnswer
		});

		this.formPanel = Ext.create('Ext.form.Panel', {
			scrollable: null,
			items: [this.questionContainer]
		});

		this.initializeAnswerStore();
		this.prepareQuestionContent(isAnswerable);
		this.prepareAbstentionAnswer();

		if (this.questionObj.image && this.questionObj.questionType !== "grid") {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				editable: false,
				gridIsHidden: true
			});
			me.grid.prepareRemoteImage(me.questionObj._id);
			this.formPanel.insert(1, this.grid);
		}

		this.countdownTimer = Ext.create('ARSnova.view.components.CountdownTimer', {
			docked: 'top',
			hidden: true,
			viewOnly: true,
			viewOnlyOpacity: ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER ?
				0.9 : 0.75
		});

		this.updateQuestionText();

		/* update disabled state on initialize */
		if (this.questionObj.votingDisabled) {
			this.disableQuestion();
		}

		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.editButtons = Ext.create('ARSnova.view.speaker.ShowcaseEditButtons', {
				questionObj: this.questionObj,
				buttonClass: 'smallerActionButton'
			});

			this.on('painted', function () {
				this.updateEditButtons();
			});
		}

		this.add([
			this.formPanel, this.countdownTimer,
			this.editButtons ? this.editButtons : {}
		]);

		this.on('activate', function () {
			this.checkPiRoundActivation();

			if (this.viewOnly) {
				this.setAnswerCount();
			}

			if (this.isDisabled() || this.questionObj.votingDisabled) {
				this.disableQuestion();

				if (this.questionObj.userAnswered && this.questionObj.showAnswer) {
					this.getScrollable().getScroller().scrollToEnd(true);
				}
			}

			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.editButtons.changeHiddenState();
			}
		});

		this.on('deactivate', function () {
			this.countdownTimer.stop();
		});

		this.on('preparestatisticsbutton', function (button) {
			var scope = me;
			button.scope = this;
			button.setHandler(function () {
				scope.statisticButtonHandler(scope);
			});
		});
	},

	getQuestionTypeMessage: function () {
		return this.questionObj.subject;
	},

	updateEditButtons: function () {
		this.editButtons.questionObj = this.questionObj;
		this.editButtons.updateData(this.questionObj);
	},

	checkPiRoundActivation: function () {
		if (this.questionObj.piRoundActive) {
			this.countdownTimer.show();
			this.countdownTimer.start(this.questionObj.piRoundStartTime, this.questionObj.piRoundEndTime);
		} else {
			this.countdownTimer.hide();
			this.countdownTimer.stop();
		}
	},

	updateQuestionText: function () {
		var questionString = '\n' + this.questionObj.text + '\n';
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if (screenWidth < 520 && this.viewOnly) {
			this.questionPanel.addCls('allCapsHeader');
			questionString = this.questionObj.subject.replace(/\./, "\\.")
			+ '\n\n' + this.questionObj.text;
		} else {
			this.questionPanel.removeCls('allCapsHeader');
		}
		this.questionPanel.setContent(questionString, true, true);
	},

	initializeAnswerStore: function () {
		this.answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		this.answerStore.add(this.questionObj.possibleAnswers);
		this.answerStore.each(function (item) {
			if (ARSnova.app.globalConfig.parseAnswerOptionFormatting) {
				var md = Ext.create('ARSnova.view.MathJaxMarkDownPanel');
				md.setContent(item.get('text'), true, false, function (html) {
					item.set('formattedText', '<p>' + html.getHtml() + '</p>');
					md.destroy();
				});
			} else {
				item.set('formattedText', '<p>' + Ext.util.Format.htmlEncode(item.get('text')) + '</p>');
			}
		});
	},

	markCorrectAnswers: function () {
		if (this.questionObj.showAnswer) {
			if (this.questionObj.questionType === 'grid') {
				this.setGridAnswer(this.questionObj.userAnswered);
			} else {
				this.answerList.getStore().each(function (item) {
					item.set("questionAnswered", true);
				});
			}
		}
	},

	getQuestionListener: function (list, index, target, record) {
		var me = list.getParent().getParent();
		var confirm = function (answer, handler) {
			Ext.Msg.confirm(Messages.ANSWER + ' "' + answer + '"', Messages.SUBMIT_ANSWER, handler);
		};

		if (record.get('id') === me.abstentionInternalId) {
			return confirm(Messages.ABSTENTION, function (button) {
				if (button === 'yes') {
					me.getUserAnswer().then(function (answer) {
						answer.set('abstention', true);
						me.saveAnswer(answer);
					});
				}
			});
		}

		/* for use in Ext.Msg.confirm */
		var answerObj = me.questionObj.possibleAnswers[index];
		var theAnswer = answerObj.id || answerObj.text;
		answerObj.selModel = list;
		answerObj.target = target;

		confirm(theAnswer, function (button) {
			if (button === 'yes') {
				me.markCorrectAnswers();
				me.getUserAnswer().then(function (answer) {
					answer.set('answerText', answerObj.text);
					me.saveAnswer(answer);
				});
			} else {
				answerObj.selModel.deselect(answerObj.selModel.selected.items[0]);
			}
		});
	},

	prepareAbstentionAnswer: function () {
		if (this.questionObj.abstention &&
				(this.questionObj.questionType === 'school'
				|| this.questionObj.questionType === 'vote'
				|| this.questionObj.questionType === 'abcd'
				|| this.questionObj.questionType === 'yesno'
				|| (this.questionObj.questionType === 'mc' && this.viewOnly))) {
			this.abstentionAnswer = this.answerList.getStore().add({
				id: this.abstentionInternalId,
				text: Messages.ABSTENTION,
				correct: false
			})[0];
			// has to be set this way as it does not conform to the model
			this.abstentionAnswer.set('formattedText', '<p>' + Messages.ABSTENTION + '</p>');
		}
	},

	prepareQuestionContent: function (isAnswerable) {
		switch (this.questionObj.questionType) {
			case "flashcard":
				this.prepareFreetextQuestion();
				break;

			case "grid":
				this.prepareGridQuestion();
				break;

			case "mc":
				this.prepareMcQuestion();
				this.prepareStandardQuestion(isAnswerable);
				break;

			default:
				this.prepareStandardQuestion(isAnswerable);
		}
	},

	prepareStandardQuestion: function (isAnswerable) {
		var me = this;
		this.answerList = Ext.create('ARSnova.view.components.List', {
			store: this.answerStore,

			itemHeight: 32,
			cls: 'roundedBox',
			itemCls: 'arsnova-mathdown x-html answerListButton noPadding',
			itemTpl: new Ext.XTemplate(
				'<tpl if="correct === true && this.isQuestionAnswered(values)">',
				'<span class="answerOptionItem answerOptionCorrectItem">&nbsp;</span>',
				'<tpl else><span class="answerOptionItem">&nbsp;</span></tpl>',
				'<span class="answerOptionText">{formattedText}</span>',
				{
					isQuestionAnswered: function (values) {
						return values.questionAnswered;
					}
				}
			),
			listeners: {
				scope: me,
				itemtap: isAnswerable ? me.getQuestionListener : Ext.emptyFn,
				selectionchange: function (list, records, eOpts) {
					if (me.mcSaveButton) {
						if (list.getSelectionCount() > 0) {
							me.mcSaveButton.enable();
						} else {
							me.mcSaveButton.disable();
						}
					}
				}
			},
			mode: me.questionObj.questionType === "mc" ? 'MULTI' : 'SINGLE'
		});

		me.formPanel.insert(1, me.answerList);
	},

	prepareMcQuestion: function () {
		this.mcSaveButton = Ext.create('Ext.Button', {
			flex: 1,
			ui: 'confirm',
			cls: 'saveButton noMargin',
			text: Messages.SAVE,
			handler: !this.viewOnly ? this.saveMcQuestionHandler : function () {},
			scope: this,
			disabled: true
		});

		this.buttonContainer.add([
			this.mcSaveButton,
			this.abstentionButton
		]);

		this.formPanel.add(!this.viewOnly ? this.buttonContainer : {});
	},

	prepareGridQuestion: function () {
		var me = this;
		var panel = {};

		if (this.questionObj.gridType === 'moderation') {
			this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
				handlerScope: me,
				onClickHandler: function () {
					var remainingDots = me.grid.getNumberOfDots() - me.grid.getChosenFields().length;
					Ext.get('remainingDotsLabel' + me.getId()).setText(
						Messages.GRID_LABEL_REMAINING_DOTS + remainingDots);
				}
			});

			panel = new Ext.Panel({
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'center'
				},
				style: "margin-top: 15px",
				items: [{
					xtype: 'label',
					id: 'remainingDotsLabel' + this.getId(),
					html: Messages.GRID_LABEL_REMAINING_DOTS + this.grid.getNumberOfDots()
				}]
			});
		} else {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer');
		}

		this.grid.update(this.questionObj, false);
		this.grid.setPossibleAnswers(me.questionObj.possibleAnswers);
		this.grid.prepareRemoteImage(
			me.questionObj._id, false, false, function (dataUrl) {
				me.questionObj.image = dataUrl;
				me.setGridAnswer(me.questionObj.userAnswered);

				if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
					me.editButtons.questionObj.image = dataUrl;
				}
			}
		);

		this.gridButton = Ext.create('Ext.Button', {
			flex: 1,
			ui: 'confirm',
			text: Messages.SAVE,
			cls: 'saveButton noMargin',
			handler: !this.viewOnly ? this.saveGridQuestionHandler : function () {},
			disabled: false,
			scope: this
		});

		this.formPanel.add([this.grid, panel]);

		if (!this.viewOnly) {
			this.buttonContainer.add([this.gridButton, this.abstentionButton]);
			this.formPanel.add([this.buttonContainer]);
		}
	},

	prepareFreetextQuestion: function () {
		var me = this;

		var answerPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			style: 'word-wrap: break-word;',
			cls: ''
		});

		this.answerList = Ext.create('Ext.Container', {
			layout: 'vbox',
			cls: 'roundedBox',
			style: 'margin-bottom: 10px;',
			styleHtmlContent: true,
			hidden: true
		});

		if (this.questionObj.fcImage) {
			this.flashcardGrid = Ext.create('ARSnova.view.components.GridImageContainer', {
				editable: false,
				gridIsHidden: true,
				style: 'margin-bottom: 20px'
			});

			me.flashcardGrid.prepareRemoteImage(me.questionObj._id, true);
			this.answerList.add(this.flashcardGrid);
		}

		this.answerList.add(answerPanel);
		this.answerList.bodyElement.dom.style.padding = "0";
		answerPanel.setContent(this.questionObj.possibleAnswers[0].text, true, true);

		this.flashcardContainer = {
			xtype: 'button',
			cls: 'saveButton centered',
			ui: 'confirm',
			text: Messages.SHOW_FLASHCARD_ANSWER,
			handler: function (button) {
				if (this.answerList.isHidden()) {
					this.answerList.show(true);
					button.setText(Messages.HIDE_FLASHCARD_ANSWER);
					me.getUserAnswer().then(function (answer) {
						var answerObj = me.questionObj.possibleAnswers[0];
						answer.set('answerText', answerObj.text);
						if (!me.viewOnly) {
							me.saveAnswer(answer);
						}
					});
				} else {
					this.answerList.hide(true);
					button.setText(Messages.SHOW_FLASHCARD_ANSWER);

					if (!this.viewOnly) {
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.next();
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
					}
				}
			},
			scope: this
		};

		this.formPanel.add([this.answerList, this.flashcardContainer]);
	},

	saveAnswer: function (answer) {
		var me = this;

		answer.saveAnswer(me.questionObj._id, {
			success: function () {
				var questionsArr = Ext.decode(localStorage.getItem(me.questionObj.questionVariant + 'QuestionIds'));
				if (questionsArr.indexOf(me.questionObj._id) === -1) {
					questionsArr.push(me.questionObj._id);
				}
				localStorage.setItem(me.questionObj.questionVariant + 'QuestionIds', Ext.encode(questionsArr));

				if (me.questionObj.questionType !== 'flashcard') {
					if (answer.get('abstention')) {
						me.questionObj.isAbstentionAnswer = true;
					} else {
						me.questionObj.userAnswered = true;
					}

					me.disableQuestion();
					if (!me.questionObj.piRoundActive && !me.questionObj.showAnswer) {
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
					} else {
						me.getScrollable().getScroller().scrollToEnd(true);
						ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkStatisticsRelease();
					}
				}
			},
			failure: function (response, opts) {
				console.log('server-side error');
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
			}
		});
	},

	statisticButtonHandler: function (scope) {
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			this.questionObj = this.editButtons.questionObj;
		}

		ARSnova.app.getController('Statistics').prepareStatistics(scope);
	},

	saveMcQuestionHandler: function () {
		var me = this;

		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button !== 'yes') {
				return;
			}

			var selectedIndexes = [];
			this.answerList.getSelection().forEach(function (node) {
				selectedIndexes.push(this.answerList.getStore().indexOf(node));
			}, this);
			this.markCorrectAnswers();

			var answerValues = [];
			for (var i = 0; i < this.answerList.getStore().getCount(); i++) {
				answerValues.push(selectedIndexes.indexOf(i) !== -1 ? "1" : "0");
			}

			me.getUserAnswer().then(function (answer) {
				answer.set('answerText', answerValues.join(","));
				me.saveAnswer(answer);
			});

			this.buttonContainer.setHidden(true);
		}, this);
	},

	saveGridQuestionHandler: function (grid) {
		var me = this;

		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button !== 'yes') {
				return;
			}

			var selectedIndexes = [];
			this.grid.getChosenFields().forEach(function (node) {
				selectedIndexes.push(node[0] + ';' + node[1]);
			}, this);
			this.questionObj.userAnswered = selectedIndexes.join(",");
			this.markCorrectAnswers();

			me.getUserAnswer().then(function (answer) {
				answer.set('answerText', selectedIndexes.join(","));
				me.saveAnswer(answer);
			});

			this.buttonContainer.setHidden(true);
		}, this);
	},

	mcAbstentionHandler: function () {
		var me = this;

		me.answerList.deselectAll();
		Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
			if (button !== 'yes') {
				return;
			}

			me.getUserAnswer().then(function (answer) {
				answer.set('abstention', true);
				me.answerList.deselectAll();
				me.saveAnswer(answer);
			});

			this.buttonContainer.setHidden(true);
		}, this);
	},

	setAnswerCount: function () {
		var questionType = this.questionObj.questionType;
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		ARSnova.app.answerModel.getAnswerAndAbstentionCount(this.questionObj._id, {
			success: function (response) {
				var numAnswers = JSON.parse(response.responseText),
					answerCount = parseInt(numAnswers[0]),
					abstentionCount = parseInt(numAnswers[1]);

				if (questionType === 'flashcard') {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(answerCount, Messages.ANSWERS_SHOWN);
				} else if (answerCount === abstentionCount && answerCount !== 0) {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(abstentionCount, Messages.ABSTENTION);
				} else {
					sTP.showcaseQuestionPanel.toolbar.setAnswerCounter(answerCount);
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	/*
	 * function to set the users answers after setting the last answer.
	 */
	setGridAnswer: function (answerString) {
		if (!answerString) {
			return;
		}

		var grid = this.grid;
		var fields = answerString.split(",");

		if (this.questionObj.showAnswer) {
			var correctAnswers = [];
			var userAnswers = [];

			this.questionObj.possibleAnswers.forEach(function (node) {
				if (node.correct) {
					correctAnswers.push(1);
				} else {
					correctAnswers.push(0);
				}
				userAnswers.push(0);
			});


			fields.forEach(function (node) {
				var coord = grid.getChosenFieldFromPossibleAnswer(node);
				userAnswers[(coord[0] * grid.getGridSizeY()) + coord[1]] = 1;
			});

			grid.generateUserViewWithAnswers(userAnswers, correctAnswers);
		} else {
			fields.forEach(function (node) {
				var entry = grid.getChosenFieldFromPossibleAnswer(node);
				grid.getChosenFields().push(entry);
			});
		}
	},

	enableQuestion: function () {
		if (!this.questionObj.userAnswered) {
			this.setDisabled(false);
			this.setMasked(false);
		}
	},

	disableQuestion: function () {
		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			this.setDisabled(true);
			this.mask(this.customMask);

			if (this.questionObj.userAnswered) {
				var message = Messages.MASK_ALREADY_ANSWERED;

				if (this.questionObj.showAnswer) {
					message += "<br>" + Messages.MASK_CORRECT_ANSWER_IS;
				}

				this.customMask.setTextMessage(message, 'alreadyAnswered');
				// Display icon with sample solution popup
				if (this.questionObj.showAnswer) {
					this.hintIcon.setHidden(!this.questionObj.solution);
					this.hintIcon.setIconCls('icon-bullhorn');
					this.hintIcon.addCls('solution');
					this.hintIcon.setHandler(function (button) {
						this.solutionPanel.show();
					});
				} else {
					this.hintIcon.setHidden(true);
				}
			} else if (this.questionObj.isAbstentionAnswer) {
				this.customMask.setTextMessage(Messages.MASK_IS_ABSTENTION_ANSWER, 'alreadyAnswered');
			} else if (this.questionObj.votingDisabled) {
				this.customMask.setTextMessage(Messages.MASK_VOTE_CLOSED, 'voteClosed');
			}
		}
	},

	selectAbstentionAnswer: function () {
		var index = this.answerList.getStore().indexOf(this.abstentionAnswer);
		if (index !== -1) {
			this.answerList.select(this.abstentionAnswer);
		}
	},

	setZoomLevel: function (size) {
		this.formPanel.setStyle('font-size: ' + size + '%;');
		ARSnova.app.getController('Application').setGlobalZoomLevel(size);

		if (this.questionObj.questionType !== 'grid' &&
			this.questionObj.questionType !== 'flashcard' &&
			this.answerList && this.answerList.element) {
			this.answerList.updateListHeight();
		}
	},

	getUserAnswer: function () {
		var me = this;
		var promise = new RSVP.Promise();
		ARSnova.app.answerModel.getUserAnswer(me.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer');
				promise.resolve(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);
				var answer = Ext.create('ARSnova.model.Answer', theAnswer);
				promise.resolve(answer);
			},
			failure: function () {
				console.log('server-side error');
				promise.reject();
			}
		});
		return promise;
	}
});
