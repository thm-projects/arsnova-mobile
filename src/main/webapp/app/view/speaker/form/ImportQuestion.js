Ext.define('ARSnova.view.speaker.form.ImportQuestion', {
	extend: 'Ext.Container',

	requires: ['Ext.field.Select', 'Ext.form.Checkbox', 'Ext.form.*'],

	sessions: null,
	questions: null,
	currentQuestions: null,

	sessionSelect: null,
	subjectSelect: null,
	questionFieldSet: null,
	selectedQuestions: null,
	saveButton: null,


	initialize: function () {
		this.callParent(arguments);
		var me = this;
		
		this.saveButton = Ext.create('Ext.Button', {
			ui: 'confirm',
			cls: 'saveButton centered',
			text: Messages.IMPORT_AND_ASK_NEW_QUESTION,
			style: 'margin-top: 20px; margin-bottom: 20px;',
			handler: function (button) {
				me.importSelectedQuestions();
			},
			scope: me,
			hidden: true
		});
		
		me.selectedQuestions = [];
		this.sessionSelect = Ext.create('Ext.field.Select', {
			label: Messages.IMPORT_SELECT_SESSION,
			placeHolder: 'Session',
			listeners: {
				change: function (field, newValue) {
					me.subjectSelect.setOptions([]);
					me.saveButton.setHidden(true);
					ARSnova.app.questionModel.getLectureQuestions(me.sessions[newValue].keyword, {
						success: function (response){
							if (response.status === 200){
								me.questions = Ext.decode(response.responseText);
								var subjectArray = [];
								var tmp = [];
								me.questions.forEach(function (element, index, array) {
									if (!Ext.Array.contains(tmp, element.subject)){
										subjectArray.push({
											text: element.subject,
											value: element.subject
										});
										tmp.push(element.subject);
									}
								});
								me.subjectSelect.setOptions(subjectArray);
								me.saveButton.setHidden(false);
							}
						}
					}, -1, -1, false);
				}
			}
		});

		me.questionFieldSet = Ext.create('Ext.form.FieldSet', {

		});

		this.subjectSelect = Ext.create('Ext.field.Select', {
			label: Messages.IMPORT_SELECT_SUBJECT,
			placeHolder: Messages.QUESTION_SUBJECT,
			listeners: {
				change: function (field, newValue) {
					me.questionFieldSet.removeAll();
					me.selectedQuestions = [];
					me.questions.forEach(function (element, index, array) {
						if (element.subject === newValue){
							var cb = new Ext.form.Checkbox({
								name: 'question-cb-' + index,
								label: element.text,
								fieldLabel: element.text,
								value: index,
								listeners: {
									check: function (checkbox){
										me.selectedQuestions.push(this.getSubmitValue());
									},
									uncheck: function (checkbox){
										var indx = -1;
										for (var i = 0; i < me.selectedQuestions.length;i++){
											if (me.selectedQuestions[i] === this._value){
												indx = i;
												break;
											}
										}
										if (indx > -1){
											me.selectedQuestions.splice(indx, 1);
										}
									}
								}
							});
							me.questionFieldSet.add(cb);
						}
					});
				}
			}
		});

		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [{
				xtype: 'fieldset',
				items: [me.sessionSelect, me.subjectSelect]
			},
			me.questionFieldSet,
			me.saveButton]
		}]);
	},

	importSelectedQuestions: function () {
		var me = this;
		var countImported = 0;
		var countFailed = 0;
		var numSelected = me.selectedQuestions.length;
		if (numSelected === 0)
		{
			Ext.toast(Messages.IMPORT_NO_QUESTIONS_SELECTED, 3000);
			return;
		}
		var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SAVE);
		me.selectedQuestions.forEach(function (element) {
			var ques = me.questions[element];
			delete ques._rev;
			var question = Ext.create('ARSnova.model.Question', ques);
			question.set('_id', undefined);
			question.set('sessionKeyword', sessionStorage.getItem('keyword'));
			question.saveSkillQuestion({
				success: function (response, eOpts) {
					countImported += 1;
					if (countImported + countFailed === numSelected){
						Ext.toast(countImported + Messages.QUESTIONS_IMPORTED, 3000);
						hideLoadMask();
					}
				},
				failure: function (response, eOpts) {
					countFailed++;
					Ext.Msg.alert(Messages.NOTICE, Messages.QUESTION_CREATION_ERROR);
					if (countImported + countFailed === numSelected){
						Ext.toast(countImported + Messages.QUESTIONS_IMPORTED, 3000);
						hideLoadMask();
					}
				}
			});
		});
		me.questionFieldSet._items.items.forEach(function (element){
			element.setChecked(false);
		});
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.newQuestionPanel;
		panel.getScrollable().getScroller().scrollTo(0, 0, true);
	},

	onShow: function () {
		var me = this;
		ARSnova.app.sessionModel.getMySessions(-1, -1, {
			success: function (response) {
				me.sessions = Ext.decode(response.responseText);
				var sessionArray = [];
				var currSession=sessionStorage.getItem("keyword");
				me.sessions.forEach(function (element, index, array) {
					if(element.keyword!=currSession)
					{
						sessionArray.push({
							text: element.name + " (" + element.keyword + ")",
							value: index
						});
					}
				});
				me.sessionSelect.setOptions(sessionArray);
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},

	onHide: function () {
		this.questionFieldSet.removeAll();
		this.sessionSelect.setOptions([]);
		this.subjectSelect.setOptions([]);
	}
});
