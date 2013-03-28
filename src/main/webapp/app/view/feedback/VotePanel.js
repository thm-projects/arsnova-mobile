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
			text	: Messages.FEEDBACK_OKAY,
			value	: 'Kann folgen'
		}, {
			iconCls	: 'feedbackMedium',
			text	: Messages.FEEDBACK_GOOD,
			value	: 'Bitte schneller'
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
				var panel = ARSnova.mainTabPanel.tabPanel.feedbackTabPanel;
				panel.setActiveItem(panel.askPanel, 'slide');
			}
		}, {
			xtype: 'panel',
			cls: 'gravure',
			html: Messages.FEEDBACK_INSTRUCTION
		}];
		
		ARSnova.views.feedback.VotePanel.superclass.constructor.call(this);
	}
});