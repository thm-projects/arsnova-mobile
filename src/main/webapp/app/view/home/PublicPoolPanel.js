/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
Ext.define('ARSnova.view.home.PPListItem', {
            extend: 'Ext.data.Model',
            config: {
                fields: ['text', 'itemCount', 'keyword']
            }
        });

Ext.define('ARSnova.view.home.PublicPoolPanel', {
	extend: 'Ext.Panel',
	
	config: {
		sessions: null
	},
	
	initialize: function () {
		this.callParent(arguments);
		
		var me = this;
		
		this.treeStore = Ext.create('Ext.data.TreeStore', {
            model: 'ARSnova.view.home.PPListItem',
            defaultRootProperty: 'items'
        });
		
		this.rootNode = this.treeStore.getRoot();
		
		if (this.getSessions() !== null) {
			Object.keys(this.getSessions()).forEach(function(key, index) {
				
				var node = me.rootNode.findChild("text", this[key].ppSubject, false);
				if (node == null) {
					var firstLevelEntry = Ext.create('ARSnova.view.home.PPListItem', {
						text: this[key].ppSubject,
						itemCount: 1,
						keyword: 0
					});
					node = me.rootNode.appendChild(firstLevelEntry);
				} else {
					node._data.itemCount++;
				}
				node.appendChild(Ext.create('ARSnova.view.home.PPListItem', {
					text: this[key].name,
					itemCount: 0,
					keyword: this[key].keyword,
					leaf: true
				}));
			}, this.getSessions());
		}
		
		
		this.backButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});
		
		this.nestedList = Ext.create('Ext.dataview.NestedList', {
			store: this.treeStore,
			fullscreen: true,
			style: 'width:100%; height:100%;',
			cls: 'standardFieldset',
			scrollable: {
				direction: 'vertical',
				directionLock: true
			},
			useTitleAsBackText: false,
			listeners: {
		        itemtap: function(nestedList, list, index, target, record) {
		        	// hide back button which just navigates to the mysession view
		        	me.backButton.hide();
		        },
		        leafitemtap: function(nestedList, list, index, node, record, e) {
		        	var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK);
		        	var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		        	ARSnova.app.restProxy.getSessionsByKeyword(record._data.keyword, {
		    			success: function(remoteSession) {
		    				var singleView = Ext.create("ARSnova.view.home.PublicPoolSingleItemPanel", {
		    					session: remoteSession,
				        		backRef: me
				        	});
				    		hTP.animateActiveItem(singleView, 'slide');
				    		hideLoadMask();
		    			},
		    			empty: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
		    				hideLoadMask();
		    			},
		    			failure: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
		    				hideLoadMask();
		    			},
		    			unauthenticated: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_PPSESSION_RIGHTS);
		    				hideLoadMask();
		    			}
		    		});
		        },
				back: function(a1, a2, a3, a4) {
					me.nestedList.getToolbar().setTitle(Messages.SESSIONPOOL_TITLE);
					me.backButton.show();
		        }		        
		    },
		    getItemTextTpl: function(node) {
		    	if(typeof node.data.itemCount == "undefined" || node.data.itemCount == 0)
		    		return '<div class="x-unsized x-button x-button-normal x-iconalign-left forwardListButton x-hasbadge"><span class="x-button-label" id="ext-element-495">{text}</span><span class="feedbackQuestionsBadgeIcon">{itemCount}</span></div>';
		    	else
		    		return '<div class="x-unsized x-button x-button-normal x-iconalign-left forwardListButton x-hasbadge"><span class="x-button-label" id="ext-element-495">{text}</span></div>';
		    }
        });
		
		var nestedListToolbar = this.nestedList.getToolbar();
		nestedListToolbar.setTitle(Messages.SESSIONPOOL_TITLE);
		nestedListToolbar.add(this.backButton);
		me.backButton.setText(Messages.BACK);
		me.nestedList.getBackButton().setText(Messages.BACK);
		
		this.add([
	          this.nestedList
	  	]);
	}
});