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
Ext.define('ARSnova.view.feedback.VotePanel', {
	extend: 'Ext.Panel',
	
	config: {
		title: 'VotePanel',
		fullscreen: true,
		scrollable: true,
		scroll: 'vertical',
	},
	
	/* toolbar items */
	toolbar			: null,
	backButton		: null,
	questionButton	: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			hidden	: false,
			handler	: function() {
				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.userTabPanel, {
		    		type		: 'slide',
		    		direction	: 'right',
		    		duration	: 700,
		    		scope		: this,
		    		listeners: { animationend: function() { 
		    			this.hide();
		    		}, scope: this }
		    	});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.MY_FEEDBACK,
			docked: 'top',
			ui: 'light',
			cls: 'titlePaddingLeft',
			items: [
		        this.backButton
	        ]
		});
		
		if (Ext.os.is.Phone) {
			this.arsLogo = {
					xtype	: 'panel',
					style	: { marginTop: '35px' }
				};
		}
		
		this.buttonPanelTop = Ext.create('Ext.Panel', {
			xtype	: 'container',
			style	: 'margin-top:20px',
			layout	: {
				type: 'hbox',
				pack: 'center'
			},
			items	: [
				{
					xtype	: 'matrixbutton',
					text	: Messages.FEEDBACK_OKAY,
					cls		: 'noPadding noBackground noBorder feedbackOkBackground',
					value	: 'Kann folgen',
					image	: "icons/48x48/smiley_happy",
					handler	: function(button) {
						ARSnova.app.getController('Feedback').vote({
							value		: button.config.value
						});
					}
				},
				{
					xtype	: 'matrixbutton',
					text	: Messages.FEEDBACK_GOOD,
					cls		: 'noPadding noBackground noBorder feedbackGoodBackground',
					value	: 'Bitte schneller',
					image	: "icons/48x48/smiley_wink",
					handler	: function(button) {
						ARSnova.app.getController('Feedback').vote({
							value		: button.config.value
						});
					},
					style: "margin-left:20px"
				}
			]
		});
		
		this.buttonPanelBottom = Ext.create('Ext.Panel', {
			xtype	: 'container',
			layout	: {
				type: 'hbox',
				pack: 'center'
			},
			items	: [
				{
					xtype	: 'matrixbutton',
					text	: Messages.FEEDBACK_BAD,
					cls		: 'noPadding noBackground noBorder feedbackBadBackground',
					value	: 'Zu schnell',
					image	: "icons/48x48/smiley_frown",
					handler	: function(button) {
						ARSnova.app.getController('Feedback').vote({
							value		: button.config.value
						});
					}
				},
				{
					xtype	: 'matrixbutton',
					text	: Messages.FEEDBACK_NONE,
					cls		: 'noPadding noBackground noBorder feedbackNoneBackground', 
					value	: 'Nicht mehr dabei',
					image	: "icons/48x48/smiley_angry",
					handler	: function(button) {
						ARSnova.app.getController('Feedback').vote({
							value		: button.config.value
						});
					},
					style: "margin-left:20px"
				}
			]
		});
		
		this.add([
		    this.toolbar,
		    this.buttonPanelTop,
		    this.buttonPanelBottom, 
			{
		    	xtype	: 'button',
				text	: Messages.QUESTION_REQUEST,
				iconCls	: 'tabBarIconQuestion',
				cls		: 'questionRequestButton',
				ui		: 'action',
				width	: '235px',
				handler : function() {
					var panel = ARSnova.app.mainTabPanel.tabPanel.feedbackTabPanel;
					panel.animateActiveItem(panel.askPanel, 'slide');
				}
			}, {
				xtype: 'panel',
				cls: 'gravure',
				style: { 'font-size':'1.0em' },
				html: Messages.FEEDBACK_INSTRUCTION
			}
		]);
	}
});
