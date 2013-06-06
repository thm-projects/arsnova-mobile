/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/newSessionPanel.js
 - Beschreibung: Panel zum Erzeugen einer neuen Session (Zuhörer).
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
Ext.define('ARSnova.view.home.NewSessionPanel', {
	extend: 'Ext.Panel',
	
	config: {
		fullscreen: true,
		scrollable: true,
		scroll	: 'vertical'
	},
	
	sessionKey	: null,
	
	/* items */
	sessionIdField: null,
	unavailableSessionIds: [],
	mycourses	: [],
	mycoursesStore: null,
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	constructor: function(arguments) {
		this.callParent(arguments);
		
		this.mycoursesStore = new Ext.data.JsonStore({
			model: 'ARSnova.model.Course'
		});

		this.mycourses = Ext.create('Ext.List', {
			store: this.mycoursesStore,
			itemTpl: window.innerWidth > 321
						? '<span class="course">{fullname}<span>'
						: '<span class="course">{shortname}<span>',
			listeners: {
				itemTap: Ext.bind(this.onCourseSubmit, this)
			}
		});
		
		this.mycourses.setScrollable(null);
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.SESSIONS,
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.NEW_SESSION,
			cls	 : 'titlePaddingLeft',
			docked: 'top',
			ui: 'light',
			items: [
		        this.backButton
			]
		});
		
		this.add([this.toolbar, {
			title: 'createSession',
			style: { margin: '15px' },
			xtype: 'formpanel',
			scrollable: null,
			id: 'createSession',
			submitOnAction: false,
			
			items: [{
	            xtype: 'fieldset',
	            items: [{
	                xtype		: 'textfield',
	                name		: 'name',
	                label		: Messages.SESSION_NAME,
	                placeHolder	: Messages.SESSION_NAME_PLACEHOLDER,
	                maxLength	: 50,
	                clearIcon	: true
	            }, {
	                xtype		: 'textfield',
	                name		: 'shortName',
	                label		: Messages.SESSION_SHORT_NAME,
	                placeHolder	: Messages.SESSION_SHORT_NAME_PLACEHOLDER,
	                maxLength	: 8,
	                clearIcon	: true
	            }]
			}, {
				xtype: 'button',
				cls  : 'centerButton',
				ui: 'confirm',
				text: Messages.SESSION_SAVE,
				handler: this.onSubmit
			}, {
				xtype: 'fieldset',
				items: [this.mycourses]
			}]
		}]);
		
		this.onBefore('activate', function() {
			this.getMyCourses();
		}, this);
	},

	onSubmit: function() {
		var values = this.up('panel').getValues();
		
		ARSnova.app.getController('Sessions').create({
			name		: values.name,
			shortName	: values.shortName
		});
	},

	onCourseSubmit: function(list, index, element, e) {
		var course = list.store.getAt(index).data;
		
		var shortName = course.shortname;
		
		if (course.shortname.length > 12) {
			shortName = course.shortname.cut(11,shortName.length-1);
		}

		ARSnova.app.getController('Sessions').create({
			name		: course.fullname,
			shortName	: shortName,
			courseId	: course.id,
			courseType	: course.type
		});
	},

	getMyCourses: function() {
		if (ARSnova.app.loginMode != ARSnova.app.LOGIN_THM) return;
		//ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH_COURSES);
		ARSnova.app.courseModel.getMyCourses({
			success: Ext.bind(function(response) {
				this.mycoursesStore.removeAll();
				this.mycoursesStore.add(Ext.decode(response.responseText));
				if (window.innerWidth > 321) {
					this.mycoursesStore.sort('fullname');
				} else {
					this.mycoursesStore.sort('shortname');
				}
			}, this),
			empty: Ext.bind(function() {
				ARSnova.app.hideLoadMask();
			}, this),
			unauthenticated: function() {
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function() {
				console.log("my courses request failure");
			}
    	}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	}
});
