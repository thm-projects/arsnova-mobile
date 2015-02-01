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
                fields: ['text', 'itemCount', 'keyword', 'id', 'badgeCls', 'itemCls']
            }
        });

Ext.define('ARSnova.view.home.PublicPoolPanel', {
	extend: 'Ext.Panel',
	
	config: {
		sessions: null
	},
	
	initialize: function () {
		this.callParent(arguments);
		var config = ARSnova.app.globalConfig;
		var me = this;
		
		this.treeStore = Ext.create('Ext.data.TreeStore', {
            model: 'ARSnova.view.home.PPListItem',
            defaultRootProperty: 'items'
        });
		this.rootNode = this.treeStore.getRoot();
		
		// ensure that objects are empty (is not ensured, even if they're just created)
		this.treeStore.removeAll();
		this.rootNode.removeAll();
		
		if (this.getSessions() !== null) {
			// sort sessions by subject name
			this.getSessions().sort(function(a,b) {return a.ppSubject > b.ppSubject;});
			
			Object.keys(this.getSessions()).forEach(function(key, index) {
				var firstLevelId = '1_' + this[key].ppSubject;
				var secLevelId   = '2_' +  this[key].ppLevel + '_' + firstLevelId;
				var thirdLevelId = '3_' +  this[key].name + '_' + index + '_' + secLevelId;
				
				console.log('session', this[key]);
				
				var firstLevelNode = me.rootNode.findChild("id", firstLevelId, false);
				if (firstLevelNode == null) {
					var firstLevelEntry = Ext.create('ARSnova.view.home.PPListItem', {
						text: this[key].ppSubject,
						itemCount: 1,
						keyword: 0,
						leaf: false,
						id: firstLevelId
					});
					firstLevelNode = me.rootNode.appendChild(firstLevelEntry);
					firstLevelNode.removeAll();
					
					// create all niveau entries
					switch (lang) {
					case 'en':case 'en-en':case 'en-us':case 'en-gb':
						var levels = config.publicPool.levelsEn.split(',');
						break;
					default:
						var levels = config.publicPool.levelsDe.split(',');
					}
					
					levels.forEach(function(entry){
						var secondLevelEntry = Ext.create('ARSnova.view.home.PPListItem', {
							text: entry,
							itemCount: 0,
							keyword: 0,
							leaf: false,
							id: '2_' +  entry + '_' + firstLevelId,
							badgeCls: 'hidden', 
							itemCls: 'ppSingleItemBackground'
						});
						var thirdTemp = Ext.create('ARSnova.view.home.PPListItem');
						
						var secLevelNode = firstLevelNode.appendChild(secondLevelEntry);
						secLevelNode.removeAll();
						secLevelNode.appendChild(thirdTemp);
					});
					
				} else {
					firstLevelNode._data.itemCount++;
				}
				
				var secLevelNode = firstLevelNode.findChild("id", secLevelId, false);
				if (secLevelNode != null) {
					if (secLevelNode._data.itemCount == 0)
						secLevelNode.removeAll();
					secLevelNode._data.badgeCls = '';
					secLevelNode._data.itemCls = '';
					secLevelNode._data.itemCount++;
					
					secLevelNode.appendChild(Ext.create('ARSnova.view.home.PPListItem', {
						text: this[key].name,
						itemCount: this[key].numQuestions,
						keyword: this[key].keyword,
						leaf: true,
						id: thirdLevelId,
						badgeCls: 'hidden'
					}));
				}
			}, this.getSessions());
		}
		
		
		this.backButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			handler: function () {
				me.treeStore.removeAll();
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				var activeHTP;
			
				if(ARSnova.app.userRole == ARSnova.app.USER_ROLE_STUDENT)
					activeHTP = hTP.homePanel;
				else if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER)
					activeHTP = hTP.mySessionsPanel;
				
					hTP.animateActiveItem(activeHTP, {
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
		        activeitemchange: function(nestedList, value, oldValue, eOpts ) {
		        	var record = me.nestedList.getActiveItem().getStore().getNode();
		        	if (record._data.itemCount == 0) {
		        		Ext.create('Ext.MessageBox').show({
							title: Messages.SESSIONPOOL_TITLE,
							message: Messages.SESSIONPOOL_ERR_CAT_NOTFOUND,
							buttons: this.OK,
							hideOnMaskTap: false,
							fn: function(btn) {
								me.nestedList.onBackTap();
							}
						});
		        		return false;
		        	}
		        	return true;
		        },
		        leafitemtap: function(nestedList, list, index, node, record, e) {
		        	var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		        	console.log('record', record);
		        	ARSnova.app.restProxy.getSessionsByKeyword(record._data.keyword, {
		    			success: function(remoteSession) {
		    				remoteSession.numQuestions = record._data.itemCount;
		    				var singleView = Ext.create("ARSnova.view.home.PublicPoolSingleItemPanel", {
		    					session: remoteSession,
				        		backRef: me
				        	});
				    		hTP.animateActiveItem(singleView, 'slide');
		    			},
		    			empty: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
		    			},
		    			failure: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
		    			},
		    			unauthenticated: function() {
		    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_PPSESSION_RIGHTS);
		    			}
		    		});
		        },
				back: function(nestedList, node, lastActiveList, detailCardActive, eOpts) {
					if (node.internalId.indexOf("1_") == 0) {
						me.nestedList.getToolbar().setTitle(Messages.SESSIONPOOL_TITLE);
						me.backButton.show();
					}
		        }		        
		    },
		    getItemTextTpl: function(node) {
		    	return '<div class="x-unsized x-button forwardListButton x-hasbadge {itemCls}"><span class="x-button-label">{text}</span><span class="feedbackQuestionsBadgeIcon {badgeCls}">{itemCount}</span></div>';	
		    }
        });
		
		var nestedListToolbar = this.nestedList.getToolbar();
		nestedListToolbar.setTitle(Messages.SESSIONPOOL_TITLE);
		nestedListToolbar.add(this.backButton);
		me.backButton.setText(Messages.SESSIONS);
		me.nestedList.getBackButton().setText(Messages.BACK);
		
		this.add([
	          this.nestedList
	  	]);
	}
});