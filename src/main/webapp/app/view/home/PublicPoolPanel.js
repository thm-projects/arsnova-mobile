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
                fields: ['text', 'itemCount']
            }
        });

Ext.define('ARSnova.view.home.PublicPoolPanel', {
	extend: 'Ext.Panel',
	
	
	initialize: function () {
		this.callParent(arguments);
		
		var me = this;
		
		this.treeStore = Ext.create('Ext.data.TreeStore', {
            model: 'ARSnova.view.home.PPListItem',
            defaultRootProperty: 'items',
            root: {
                items: [{
                    text: 'BWL',
                    itemCount: '1',
                    items: [{
                        text: 'Makroökonomie',
                        itemCount: '1',
                        items: [{
                            text: 'Super BWL Session',
                            itemCount: '12',
                            leaf: true
                        }]
                    }]
                },
                {
                    text: 'Informatik',
                    itemCount: '2',
                    items: [{
                        text: 'Softwaretechnik',
                        itemCount: '1',
                        items: [{
                            text: 'Geniale Fragen für SWT',
                            itemCount: '8',
                            leaf: true
                        }]
                    }, {
                        text: 'Compilerbau',
                        itemCount: '2',
                        items: [{
                            text: 'Einführung Compilerbau',
                            itemCount: '13',
                            leaf: true
                        },
                        {
                            text: 'Compileroptimierung',
                            itemCount: '7',
                            leaf: true
                        }]
                    }]
                }]
            }
        });
		
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
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Session Pool',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				{xtype:'spacer'}
			]
		});
		
		this.nestedList = Ext.create('Ext.dataview.NestedList', {
			store: this.treeStore,
			fullscreen: true,
			style: 'width:100%; height:100%;',
			scrollable: {
				direction: 'vertical',
				directionLock: true
			},
			listeners: {
		        itemtap: function(nestedList, list, index, target, record) {
		        	me.backButton.hide();
		        },
		        leafitemtap: function(nestedList, list, index, node, record, e) {
		        	var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		        	var node = me.treeStore.getNodeById(record.getId())
		        	var singleView = Ext.create("ARSnova.view.home.PublicPoolSingleItemPanel", {
		        		title: node._data.text,
		        		questionCount: node._data.itemCount,
		        		backRef: me
		        	});
		    		hTP.animateActiveItem(singleView, 'slide');
		        },
				back: function(a1, a2, a3) {
					if (me.nestedList.getActiveItem().getId() == "ext-list-1" ) {
						var toolbar = me.nestedList.getToolbar();
						toolbar.setTitle("Session Pool");
						me.backButton.show();
					}
					else {
						me.backButton.hide();
					}
		        }
		    },
		    getItemTextTpl: function(node) {
		    	return '<span>{text}<div class="x-hasbadge"><span class="x-badge ">{itemCount}</span></div></span>';
		    	//return '<span><img src="image_url" alt="alternative_text">{text}</span>';
		    }
        });
		
		
		
		var toolbar = this.nestedList.getToolbar();
		toolbar.setTitle("Session Pool");
		toolbar.add(this.backButton);
		
		console.log(toolbar);
		
		this.add([
	          this.toolbar,
	          this.nestedList
	  	]);
		
		this.toolbar.hide();
	},
});