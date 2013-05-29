/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/FreetextDetailAnswer.js
 - Beschreibung: Darstellung von Freitext-Antworten
 - Version:      1.0, 11/06/12
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.FreetextDetailAnswer', {
	extend: 'Ext.Panel',
	
	config: {
		title : 'FreetextDetailAnswer',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical',
	},
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.answer = arguments.answer;
		this.sTP = arguments.sTP;

		var self = this;
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.FREETEXT_DETAIL_HEADER,
			items: [
				Ext.create('Ext.Button', {
					text	: Messages.BACK,
					ui		: 'back',
					handler	: function() {
						self.sTP.items.items.pop(); // Remove this panel from view stack
						self.sTP.animateActiveItem(
							self.sTP.items.items[self.sTP.items.items.length-1], // Switch back to top of view stack
							{
								type		: 'slide',
								direction	: 'right',
								duration	: 700,
								scope		: this,
					    		listeners: { animationend: function() { 
									self.answer.deselectItem();
									self.hide();
					    		}, scope: this }
							}
						);
					}
				})
			]
		});

		this.add([this.toolbar, {
			xtype: 'formpanel',
			scrollable: null,
			style: "margin: 20px",
			items: [{
				xtype: 'fieldset',
				items: [
					{
						xtype: 'textfield',
						label: Messages.QUESTION_DATE,
						value: this.answer.formattedTime + " Uhr am " + this.answer.groupDate,
						disabled: true
					},
					{
						xtype: 'textfield',
						label: Messages.QUESTION_SUBJECT,
						value: this.answer.answerSubject,
						disabled: true
					},
					{
						xtype: 'textareafield',
						label: Messages.FREETEXT_DETAIL_ANSWER,
						value: this.answer.answerText,
						disabled: true,
						maxRows: 8
					}
				]
			}]
		}, {
			xtype: 'button',
			ui	 : 'decline',
			cls  : 'centerButton',
			text : Messages.DELETE,
			scope: this,
			hidden: !this.answer.deletable,
			handler: function() {
				var me = this;
				var sheet = Ext.create('Ext.ActionSheet', {
					items: [
						{
							text: Messages.DELETE,
							ui: 'decline',
							handler: function () {
								ARSnova.app.questionModel.deleteAnswer(self.answer.questionId, self.answer._id, {
									failure: function() {
										console.log('server-side error: deletion of freetext answer failed');
									}
								});
								
								sheet.destroy();
								self.sTP.animateActiveItem(self.sTP.questionDetailsPanel, {
									type		: 'slide',
									direction	: 'right',
									duration	: 700,
						    		listeners: { 
						    			animationend: function() { 
						    				self.sTP.questionDetailsPanel.freetextAnswerList.hide();
						    				self.sTP.questionDetailsPanel.noFreetextAnswers.show();
											self.answer.removeItem();
											me.destroy();
						    		}, scope: this }
								});
							}
						},
						{
							text: Messages.CANCEL,
							handler: function() {
								sheet.hide();
							}
						}
					]
				});
				Ext.Viewport.add(sheet);
				sheet.show();
			}
		}]);
	}
});
