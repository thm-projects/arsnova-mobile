/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel zum Abgeben eines Feedbacks.
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
                 Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.namespace('ARSnova.views.feedback');

ARSnova.views.feedback.AskPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	constructor: function() {
		this.backButton = new Ext.Button({
			text	: Messages.BACK,
			ui		: 'back',
			handler : this.closePanel,
			scope	: this
		});
		
		this.saveButton = new Ext.Button({
			text	: Messages.SAVE,
			ui		: 'confirm',
			handler	: this.askQuestion,
			scope	: this
		});
		
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			title: Messages.QUESTION_TO_SPEAKER,
			items: [this.backButton, {xtype: 'spacer'}, this.saveButton]
		}],
		
		this.subject = new Ext.form.Text({
			label: Messages.QUESTION_SUBJECT,
			name: 'subject',
			maxLength: 140,
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER
		});
		
		this.text = new Ext.form.TextArea({
			xtype: 'textareafield',
			label: Messages.QUESTION_TEXT,
			name: 'text',
			maxLength: 2500,
			placeHolder: Messages.QUESTION_TEXT_PLACEHOLDER
		});
		
		this.items = [{
			cls: 'gravure',
			html: Messages.QUESTION_INSTRUCTION
		}, {
			xtype: 'form',
			submitOnAction: false,
			items: [{
				xtype: 'fieldset',
				items: [this.subject, this.text]
			}, {
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button noMargin',
				text: Messages.SAVE,
				handler: this.askQuestion,
				scope: this
			}]
		}];
		
		ARSnova.views.feedback.AskPanel.superclass.constructor.call(this, arguments);
	},
	
	askQuestion: function() {
		var me = this;
		var question = Ext.ModelMgr.create({
			type			: "interposed_question",
			sessionId		: localStorage.getItem("sessionId"),
			sessionKeyword	: localStorage.getItem("keyword"),
			subject			: this.subject.getValue().trim(),
			text 			: this.text.getValue().trim(),
			timestamp		: new Date().getTime()
		}, 'Question');
		
		var validation = question.validate();
		if (!validation.isValid()) {
			me.down('form').items.items.forEach(function(el) {
				if(el.xtype == 'textfield')
					el.removeCls("required");
			});
			validation.items.forEach(function(el) {
				me.down('textfield[name=' + el.field + ']').addCls("required");
			});
			return;
		}
		
		Ext.dispatch({
			controller: 'feedback',
			action: 'ask',
			question: question,
			success: function() {
				Ext.Msg.alert('', Messages.QUESTION_SAVED, function() {
					me.closePanel();
					me.subject.setValue('');
					me.text.setValue('');
				});
			},
			failure: function(records, operation) {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.TRANSMISSION_ERROR);
				Ext.Msg.doComponentLayout();
			}
		});
	},
	
	closePanel: function() {
		var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
		panel.setActiveItem(ARSnova.mainTabPanel.tabPanel.feedbackTabPanel.votePanel, {
			type		: 'slide',
			direction	: 'right',
			duration	: 700
		});
	}
});