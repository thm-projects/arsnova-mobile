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
Ext.namespace('ARSnova.views.feedbackQuestions');

ARSnova.views.feedbackQuestions.DetailsPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	isRendered: false,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	questionObj : null,
	
	constructor: function(question){
		this.questionObj = question;
		
		this.backButton = new Ext.Button({
			text	: Messages.QUESTIONS,
			ui		: 'back',
			scope	: this,
			handler	: function(){
				var sQP = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel; 
				sQP.setActiveItem(sQP.questionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
//				ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.getFeedbackQuestions();
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTION_DETAILS,
			items: [
		        this.backButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			xtype: 'form',
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
					xtype: "mathjaxfield",
					label: Messages.QUESTION_TEXT,
					content: this.questionObj.text
				}]
			}]
		},{
			xtype: 'button',
			ui	 : 'decline',
			cls  : 'centerButton',
			text : Messages.DELETE,
			scope: this,
			handler: function(){
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel;
				
				ARSnova.questionModel.deleteInterposed(this.questionObj, {
					failure: function(response){
						console.log('server-side error delete question');
					}
				});
				panel.setActiveItem(panel.questionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		}];
		
		ARSnova.views.feedbackQuestions.DetailsPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('deactivate', this.onDeactivate);
		
		ARSnova.views.feedbackQuestions.DetailsPanel.superclass.initComponent.call(this);
	},
	
	onDeactivate: function(){
		this.destroy();
		ARSnova.mainTabPanel.tabPanel.feedbackQuestionsPanel.questionsPanel.checkFeedbackQuestions();
	}
});