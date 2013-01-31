/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/feedback/votePanel.js
 - Beschreibung: Panel zum Abgeben eines Feedbacks.
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
ARSnova.views.feedback.VotePanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar			: null,
	backButton		: null,
	questionButton	: null,
	
	constructor: function(){
		this.toolbar = new Ext.Toolbar({
			title: Messages.MY_FEEDBACK,
			cls: 'titlePaddingLeft'
		});
		
		this.dockedItems = [this.toolbar];
		
		this.defaults = {
			xtype	: 'button',
			cls		: 'option-button',
			handler	: function(button) {
				Ext.dispatch({
					controller	: 'feedback',
					action		: 'vote',
					value		: button.value
				});
			}
		};
		this.items = [{
			iconCls	: 'feedbackGood',
			text	: Messages.FEEDBACK_GOOD,
			value	: 'Bitte schneller'
		}, {
			iconCls	: 'feedbackMedium',
			text	: Messages.FEEDBACK_OKAY,
			value	: 'Kann folgen'
		}, {
			iconCls	: 'feedbackBad',
			text	: Messages.FEEDBACK_BAD,
			value	: 'Zu schnell'
		}, {
			iconCls	: 'feedbackNone',
			text	: Messages.FEEDBACK_NONE,
			value	: 'Nicht mehr dabei'
		}, {
			text	: Messages.QUESTION_REQUEST,
			iconCls	: 'tabBarIconQuestion',
			ui		: 'action',
			handler : function() {
				var panel = new Ext.Panel({
					width: 300,
					floating: true,
					modal: true,
					centered: true,
					cls: 'feedbackQuestion',
					dockedItems: [{
						xtype: 'toolbar',
						dock: 'top',
						title: Messages.QUESTION_TO_SPEAKER
					}],
					items: [{
						cls: 'gravure noMargin',
						html: Messages.QUESTION_INSTRUCTION
					}, {
						xtype: 'form',
						submitOnAction: false,
						items: [{
							xtype: 'fieldset',
							items: [{
								xtype: 'textfield',
								label: Messages.QUESTION_SUBJECT,
								name: 'subject',
								maxLength: 20,
								placeHolder: Messages.QUESTION_SUBJECT_PLACEHOLDER
							}, {
								xtype: 'textareafield',
								label: Messages.QUESTION_TEXT,
								name: 'text',
								maxLength: 140,
								placeHolder: Messages.QUESTION_TEXT_PLACEHOLDER
							}]
						}, {
							xtype: 'button',
							ui: 'confirm',
							cls: 'login-button noMargin',
							text: Messages.SAVE,
							handler: function(){
								var me = this.up('panel[modal]');
								var values = this.up('form').getValues();
								time = new Date().getTime();
						    	var question = Ext.ModelMgr.create({
									type			: "interposed_question",
									sessionId		: localStorage.getItem("sessionId"),
									sessionKeyword	: localStorage.getItem("keyword"),
									subject			: values.subject.trim(),
									text 			: values.text.trim(),
									timestamp		: time
								}, 'Question');
						    	
						    	var validation = question.validate();
						    	if (!validation.isValid()) {
									me.down('form').items.items.forEach(function(el){
										if(el.xtype == 'textfield')
											el.removeCls("required");
									});
									validation.items.forEach(function(el){
										me.down('textfield[name=' + el.field + ']').addCls("required");
									});
									return;
								}
						    	
						    	me.hide();
						    	
						    	Ext.dispatch({
									controller: 'feedback',
									action: 'ask',
									question: question,
									success: function(){
						    			new Ext.Panel({
						    				cls: 'notificationBox',
						    				name: 'notificationBox',
						    				showAnimation: 'pop',
						    				floating: true,
					    					modal: true,
					    					centered: true,
					    					width: 300,
					    					styleHtmlContent: true,
						    				html: Messages.QUESTION_SAVED,
						    				listeners: {
						    					hide: function(){
						    						this.destroy();
						    					},
						    					show: function(){
						    						delayedFn = function(){
						    							var cmp = Ext.ComponentQuery.query('panel[name=notificationBox]');
						    							if(cmp.length > 0)
						    								cmp[0].hide();
						    						};
						    						setTimeout("delayedFn()", 2000);
						    					}
						    				}
					    				}).show();
						    		},
									failure: function(records, operation){
						    			console.log(records);
						    			console.log(operation);
						    			Ext.Msg.alert(Messages.NOTIFICATION, Messages.TRANSMISSION_ERROR);
						    			Ext.Msg.doComponentLayout();
						    		}
								});
							}
						}]
					}],
					
					listeners: {
						hide: function(){
							this.destroy();
						}
					}
				}).show();
			}
		}, {
			xtype: 'panel',
			cls: 'gravure',
			html: Messages.FEEDBACK_INSTRUCTION
		}];
		
		ARSnova.views.feedback.VotePanel.superclass.constructor.call(this);
	}
});