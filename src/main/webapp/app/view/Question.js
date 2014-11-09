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

	requires: ['ARSnova.model.Answer', 'ARSnova.view.CustomMask', 'ARSnova.view.MathJaxMarkDownPanel'],

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

		var self = this; // for use inside callbacks
		this.viewOnly = this.config.viewOnly;
		this.questionObj = this.config.questionObj;

		this.customMask = Ext.create('ARSnova.view.CustomMask', {
			mainPanel: this
		});

		var answerStore = Ext.create('Ext.data.Store', {model: 'ARSnova.model.Answer'});
		answerStore.add(this.questionObj.possibleAnswers);
		answerStore.each(function (item) {
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

		this.on('preparestatisticsbutton', function (button) {
			button.scope = this;
			button.setHandler(function () {
				var panel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel || ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				panel.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question: self.questionObj,
					lastPanel: self
				});
				ARSnova.app.mainTabPanel.animateActiveItem(panel.questionStatisticChart, 'slide');
			});
		});

		var saveAnswer = function (answer) {
			answer.saveAnswer({
				success: function () {
					var questionsArr = Ext.decode(localStorage.getItem(self.questionObj.questionVariant + 'QuestionIds'));
					if (questionsArr.indexOf(self.questionObj._id) == -1) {
						questionsArr.push(self.questionObj._id);
					}
					localStorage.setItem(self.questionObj.questionVariant + 'QuestionIds', Ext.encode(questionsArr));

					self.disableQuestion();
					ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.showNextUnanswered();
					ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.checkIfLastAnswer();
				},
				failure: function (response, opts) {
					console.log('server-side error');
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.ANSWER_CREATION_ERROR);
				}
			});
		};

		this.markCorrectAnswers = function () {
			if (this.questionObj.showAnswer) {
				// Mark all possible answers as 'answered'. This will highlight
				// all correct answers.

				this.answerList.getStore().each(function (item) {
					item.set("questionAnswered", true);
				});

				if (this.questionObj.questionType === 'grid') {
					this.setGridAnswer(this.questionObj.userAnswered);
				}
			}
		};

		this.saveMcQuestionHandler = function () {
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
				var questionValue = 0;
				this.answerList.getSelection().forEach(function (node) {
					questionValue += (node.get('value') || 0);
				});

				self.getUserAnswer().then(function (answer) {
					answer.set('answerText', answerValues.join(","));
					answer.set('questionValue', questionValue);
					saveAnswer(answer);
				});
			}, this);
		};

		this.saveGridQuestionHandler = function (grid) {
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


				var questionValue = 0;
				this.questionObj.possibleAnswers.forEach(function (node) {
					if (selectedIndexes.indexOf(node.text) !== -1) {
						questionValue += (node.value || 0);
					}
				});


				self.getUserAnswer().then(function (answer) {
					answer.set('answerText', selectedIndexes.join(","));
					answer.set('questionValue', questionValue);
					saveAnswer(answer);
				});
			}, this);
		};

		this.mcAbstentionHandler = function () {
			Ext.Msg.confirm('', Messages.SUBMIT_ANSWER, function (button) {
				if (button !== 'yes') {
					return;
				}

				self.getUserAnswer().then(function (answer) {
					answer.set('abstention', true);
					self.answerList.deselectAll();
					saveAnswer(answer);
				});
			}, this);
		};

		var questionListener = this.viewOnly || this.questionObj.questionType === "mc" ? {}: {
			'itemtap': function (list, index, target, record) {
				var confirm = function (answer, handler) {
					Ext.Msg.confirm(Messages.ANSWER + ' "' + answer + '"', Messages.SUBMIT_ANSWER, handler);
				};
				if (record.get('id') === self.abstentionInternalId) {
					return confirm(Messages.ABSTENTION, function (button) {
						if (button !== 'yes') {
							return;
						}
						self.getUserAnswer().then(function (answer) {
							answer.set('abstention', true);
							saveAnswer(answer);
						});
					});
				}
				var answerObj = self.questionObj.possibleAnswers[index];

				/* for use in Ext.Msg.confirm */
				answerObj.selModel = list;
				answerObj.target = target;

				var theAnswer = answerObj.id || answerObj.text;

				confirm(theAnswer, function (button) {
					if (button == 'yes') {
						self.markCorrectAnswers();

						self.getUserAnswer().then(function (answer) {
							answer.set('answerText', answerObj.text);
							answer.set('questionValue', answerObj.value);
							saveAnswer(answer);
						});
					} else {
						answerObj.selModel.deselect(answerObj.selModel.selected.items[0]);
					}
				});
			}
		};

		// Setup question title and text to disply in the same field; markdown handles HTML encoding
		var questionString = this.questionObj.subject
			+ '\n\n' // inserts one blank line between subject and text
			+ this.questionObj.text;

		// Create standard panel with framework support
		var questionPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			cls: "roundedBox allCapsHeader"
		});
		questionPanel.setContent(questionString, true, true);

		this.answerList = Ext.create('Ext.List', {
			store: answerStore,

			cls: 'roundedBox',
			variableHeights: true,
			scrollable: {disabled: true},

			itemCls: 'arsnova-mathdown x-html',
			itemHeight: 32,
			itemTpl: new Ext.XTemplate(
				'{formattedText}',
				'<tpl if="correct === true && this.isQuestionAnswered(values)">',
					'&nbsp;<span style="padding: 0 0.2em 0 0.2em" class="x-list-item-correct">&#10003; </span>',
				'</tpl>',
				{
					isQuestionAnswered: function (values) {
						return values.questionAnswered === true;
					}
				}
			),
			listeners: {
				scope: this,
				selectionchange: function (list, records, eOpts) {
					if (list.getSelectionCount() > 0) {
						this.mcSaveButton.enable();
					} else {
						this.mcSaveButton.disable();
					}
				},
				/**
				 * The following events are used to get the computed height of
				 * all list items and finally to set this value to the list
				 * DataView. In order to ensure correct rendering it is also
				 * necessary to get the properties "padding-top" and
				 * "padding-bottom" and add them to the height of the list
				 * DataView.
				 */
				painted: function (list, eOpts) {
					this.answerList.fireEvent("resizeList", list);
				},
				resizeList: function (list) {
					var listItemsDom = list.select(".x-list .x-inner .x-inner").elements[0];

					this.answerList.setHeight(
						parseInt(window.getComputedStyle(listItemsDom, "").getPropertyValue("height")) +
						parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-top")) +
						parseInt(window.getComputedStyle(list.dom, "").getPropertyValue("padding-bottom"))
					);
				}
			},
			mode: this.questionObj.questionType === "mc" ? 'MULTI': 'SINGLE'
		});

		if (this.questionObj.abstention
				&& (this.questionObj.questionType === 'school'
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
			this.abstentionAnswer.set('formattedText', Messages.ABSTENTION);
		}

		this.mcSaveButton = Ext.create('Ext.Button', {
			flex: 1,
			ui: 'confirm',
			cls: 'login-button noMargin',
			text: Messages.SAVE,
			handler: !this.viewOnly ? this.saveMcQuestionHandler: function () {},
			scope: this,
			disabled: true
		});

		var mcContainer = {
			xtype: 'container',
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			defaults: {
				style: {
					margin: '10px'
				}
			},
			items: [this.mcSaveButton, !!!this.questionObj.abstention ? {hidden: true}: {
				flex: 1,
				ui: 'action',
				xtype: 'button',
				cls: 'login-button noMargin',
				text: Messages.ABSTENTION,
				handler: this.mcAbstentionHandler,
				scope: this
			}]
		};

		var flashcardContainer = {
			xtype: 'button',
			cls: 'login-button',
			ui: 'confirm',
			text: Messages.SHOW_FLASHCARD_ANSWER,
			handler: function (button) {
				if (this.answerList.isHidden()) {
					this.answerList.show(true);
					button.setText(Messages.HIDE_FLASHCARD_ANSWER);
				} else {
					this.answerList.hide(true);
					button.setText(Messages.SHOW_FLASHCARD_ANSWER);
				}
			},
			scope: this
		};

		this.add([questionPanel]);
		if (this.questionObj.image && this.questionObj.questionType !== "grid") {
			this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
				id: 'gridImageContainer' + this.questionObj._id,
				editable: false,
				gridIsHidden: true
			});
			this.grid.setImage(this.questionObj.image);
			this.add(this.grid);
		}
		if (this.questionObj.questionType === "flashcard") {
			this.add([flashcardContainer]);
			this.answerList.setHidden(true);
		} else if (this.questionObj.questionType === "grid") {
			if (this.questionObj.gridType === 'moderation') {
			
				this.grid = Ext.create('ARSnova.view.components.GridModerationContainer', {
					id: 'gridImageContainer' + this.questionObj._id,
					handlerScope: self,
					onClickHandler: function() {
						var remainingDots = self.grid.getNumberOfDots() - self.grid.getChosenFields().length;
						Ext.get('remainingDotsLabel' + self.getId()).setText(Messages.GRID_LABEL_REMAINING_DOTS + remainingDots);
					}
				});
			} else {
				this.grid = Ext.create('ARSnova.view.components.GridImageContainer', {
					id: 'gridImageContainer' + this.questionObj._id,
				});
			}

			this.grid.setPossibleAnswers(this.questionObj.possibleAnswers);
			var me = this;
			this.grid.setImage(this.questionObj.image, false, function () {
				me.setGridAnswer(me.questionObj.userAnswered);
			});

			/*
			 * update function for align the grids picture
			 */
			this.grid.update(this.questionObj, false);
			
			/*
			 *   gridbutton and container for the grid button to add into the layout if necessary
			 */
			this.gridButton = Ext.create('Ext.Button', {
				flex: 1,
				ui: 'confirm',
				cls: 'login-button noMargin',
				text: Messages.SAVE,
				handler: !this.viewOnly ? this.saveGridQuestionHandler: function () {},
				scope: this,
				disabled: false
			});

			this.gridImageContainer = {
				xtype: 'container',
				layout: {
					type: 'hbox',
					align: 'stretch'
				},
				defaults: {
					style: {
						margin: '10px'
					}
				},
				items: [this.gridButton, !!!this.questionObj.abstention ? {hidden: true}: {
					flex: 1,
					ui: 'action',
					xtype: 'button',
					cls: 'login-button noMargin',
					text: Messages.ABSTENTION,
					handler: this.mcAbstentionHandler,
					scope: this
				}]
			};
			this.add([this.grid]);
			
			if (this.questionObj.gridType === 'moderation') {
				
				var panel = new Ext.Panel({
				    layout: {
		                type: 'vbox',
		                align: 'center',
		                pack: 'center'
				    },
				    style: "margin-top: 15px",
			        items:[{
			        	xtype: 'label',
						id: 'remainingDotsLabel' + this.getId(),
						html: Messages.GRID_LABEL_REMAINING_DOTS + this.grid.getNumberOfDots(),
			        }]
				});
				
				this.add(panel);
			}
			
			if (!this.viewOnly) {
				this.add([this.gridImageContainer]);
			}
			this.answerList.setHidden(true);
		} else {
			this.answerList.setHidden(false);
		}
		this.add([this.answerList].concat(
			this.questionObj.questionType === "mc" && !this.viewOnly ? mcContainer: {}
		));

		this.on('activate', function () {
			this.answerList.addListener('itemtap', questionListener.itemtap);

			if (this.isDisabled()) {
				this.disableQuestion();
			}
		});
	},

	/*
	 * function to set the users answers after setting the last answer.
	 */
	setGridAnswer: function (answerString) {

		if (answerString == undefined)
			return;


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

	disableQuestion: function () {
		this.setDisabled(true);
		this.mask(this.customMask);
	},

	selectAbstentionAnswer: function () {
		var index = this.answerList.getStore().indexOf(this.abstentionAnswer);
		if (index !== -1) {
			this.answerList.select(this.abstentionAnswer);
		}
	},

//	doTypeset: function (parent) {
//		if (typeof this.questionTitle.element !== "undefined") {
//			var panel = this;
//			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.questionTitle.element.dom]);
//			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.answerList.element.dom]);
//
//			MathJax.Hub.Queue(
//				["Delay", MathJax.Callback, 700], function () {
//					panel.answerList.fireEvent("resizeList", panel.answerList.element);
//				}
//			);
//		} else {
// // If the element has not been drawn yet, we need to retry later
//			Ext.defer(Ext.bind(this.doTypeset, this), 100);
//		}
//	},

	getUserAnswer: function () {
		var self = this;
		var promise = new RSVP.Promise();
		ARSnova.app.answerModel.getUserAnswer(self.questionObj._id, {
			empty: function () {
				var answer = Ext.create('ARSnova.model.Answer', {
					type: "skill_question_answer",
					sessionId: localStorage.getItem("sessionId"),
					questionId: self.questionObj._id,
					user: localStorage.getItem("login"),
					timestamp: Date.now(),
					questionVariant: self.questionObj.questionVariant
				});
				promise.resolve(answer);
			},
			success: function (response) {
				var theAnswer = Ext.decode(response.responseText);
				// update
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
