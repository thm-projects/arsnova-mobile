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
Ext.define('ARSnova.view.feedback.AskPanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'AskPanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical'	
	},
	
	/* toolbar items */
	toolbar		: null,
	saveButton	: null,
	backButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.BACK,
			ui		: 'back',
			handler : this.closePanel,
			scope	: this
		});
		
		this.saveButton = Ext.create('Ext.Button', {
			text	: Messages.SEND,
			ui		: 'confirm',
			handler	: this.askQuestion,
			scope	: this
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			ui: 'light',
			title: Messages.QUESTION_TO_SPEAKER,
			items: [this.backButton, {xtype: 'spacer'}, this.saveButton]
		}),
		
		this.subject = Ext.create('Ext.form.Text', {
			label: Messages.QUESTION_SUBJECT,
			name: 'subject',
			maxLength: 140,
			placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER
		});
		
		this.text = Ext.create('Ext.form.TextArea', {
			xtype: 'textareafield',
			label: Messages.QUESTION_TEXT,
			name: 'text',
			maxLength: 2500,
			placeHolder: Messages.QUESTION_TEXT_PLACEHOLDER
		});
		
		this.add([this.toolbar, {
			cls: 'gravure',
			html: Messages.QUESTION_INSTRUCTION
		}, {
			xtype: 'formpanel',
			submitOnAction: false,
			scrollable: null,
			
			style: { margin: '20px' },
			
			items: [{
				xtype: 'fieldset',
				items: [this.subject, this.text]
			}, {
				xtype: 'button',
				ui: 'confirm',
				cls: 'login-button noMargin',
				text: Messages.SEND,
				handler: this.askQuestion,
				scope: this
			}]
		}]);
	},
	
	askQuestion: function() {
		var me = this;
		var question = Ext.create('ARSnova.model.Question', {
			type			: "interposed_question",
			sessionId		: localStorage.getItem("sessionId"),
			sessionKeyword	: localStorage.getItem("keyword"),
			subject			: this.subject.getValue().trim(),
			text 			: this.text.getValue().trim(),
			timestamp		: new Date().getTime()
		});
		question.set('_id', undefined);
		
		var validation = question.validate();
		if (!validation.isValid()) {
			me.down('fieldset').items.items.forEach(function(el) {
				if(el.xtype == 'textfield')
					el.removeCls("required");
			});
			
			validation.items.forEach(function(el) {
				me.down('textfield[name=' + el.getField() + ']').addCls("required");
			});
			return;
		}
		
		ARSnova.app.getController('Feedback').ask({
			question: question,
			success: function() {
				var theNotificationBox = {};
				theNotificationBox = Ext.create('Ext.Panel', {
					cls: 'notificationBox',
					name: 'notificationBox',
					showAnimation: 'pop',
					modal: true,
					centered: true,
					width: 300,
					styleHtmlContent: true,
					styleHtmlCls: 'notificationBoxText',
					html: Messages.QUESTION_SAVED,
					listeners: {
						hide: function() {
							this.destroy();
						},
						show: function() {
							Ext.defer(function(){
								theNotificationBox.hide();
								me.closePanel();
								me.subject.setValue('');
								me.text.setValue('');
							}, 3000);
						}
					}
				});
				Ext.Viewport.add(theNotificationBox);
				theNotificationBox.show();
			},
			failure: function(records, operation) {
				Ext.Msg.alert(Messages.NOTIFICATION, Messages.TRANSMISSION_ERROR);
			}
		});
	},
	
	closePanel: function() {
		var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
		panel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel.votePanel, {
			type		: 'slide',
			direction	: 'right',
			duration	: 700
		});
	}
});
