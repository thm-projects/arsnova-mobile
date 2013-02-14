/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/views/freetextDetailAnswer.js
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

ARSnova.views.FreetextDetailAnswer = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	constructor: function(sTP, answer) {
		this.sTP = sTP;
		
		this.dockedItems = [new Ext.Toolbar({
			title: Messages.FREETEXT_DETAIL_HEADER,
			items: [
				new Ext.Button({
					text	: Messages.BACK,
					ui		: 'back',
					handler	: function() {
						sTP.items.items.pop(); // Remove this panel from view stack
						sTP.setActiveItem(
							sTP.items.items[sTP.items.items.length-1], // Switch back to top of view stack
							{
								type		: 'slide',
								direction	: 'right',
								duration	: 700,
								scope		: this,
								after: function() {
									answer.deselectItem();
									this.hide();
								}
							}
						);
					}
				})
			]
		})];
		
		this.items = [{
			xtype: 'form',
			items: [{
				xtype: 'fieldset',
				items: [
					{
						xtype: 'textfield',
						label: Messages.QUESTION_DATE,
						value: answer.formattedTime + " Uhr am " + answer.groupDate,
						disabled: true
					},
					{
						xtype: 'textfield',
						label: Messages.QUESTION_SUBJECT,
						value: answer.answerSubject,
						disabled: true
					},
					{
						xtype: 'textareafield',
						label: Messages.FREETEXT_DETAIL_ANSWER,
						value: answer.answerText,
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
			hidden: !answer.deletable,
			handler: function() {
				var me = this;
				var sheet = new Ext.ActionSheet({
					items: [
						{
							text: Messages.DELETE,
							ui: 'decline',
							handler: function () {
								ARSnova.questionModel.deleteFreetextAnswer(answer._id, answer._rev, {
									failure: function() {
										console.log('server-side error: deletion of freetext answer failed');
									}
								});
								
								sheet.destroy();
								sTP.setActiveItem(sTP.questionDetailsPanel, {
									type		: 'slide',
									direction	: 'right',
									duration	: 700,
									after: function() {
										answer.removeItem();
										me.destroy();
									}
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
				sheet.show();
			}
		}];
		
		ARSnova.views.FreetextDetailAnswer.superclass.constructor.call(this);
	}
});
