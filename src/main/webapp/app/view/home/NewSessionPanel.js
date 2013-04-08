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
		scroll		: 'vertical',
		sessionKey	: null,
		
		/* toolbar items */
		toolbar		: null,
		backButton	: null,
		
		/* items */
		sessionIdField: null,
		
		unavailableSessionIds: [],
		mycourses	: [],
		mycoursesStore: null
	},
	
	initialize: function(responseText) {
		this.callParent(arguments);
		
		this.mycoursesStore = new Ext.data.JsonStore({
			model: ARSnova.model.Course
		});

		var itemTemplate = '<span class="course">{shortname}<span>';

		if (window.innerWidth > 321) {
			itemTemplate = '<span class="course">{fullname}<span>';
		}

		this.mycourses = Ext.create('Ext.List', {
			store: this.mycoursesStore,
			itemTpl: itemTemplate,
			listeners: {
				itemTap: Ext.bind(this.onCourseSubmit, this)
			}
		});
		
		this.mycourses.setScrollable(false);
		
		// check responseText
		if(typeof arguments.responseText === 'undefined') {
			var course = new Array();
		} else {
			var course = Ext.decode(arguments.responseText);
		}
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.SESSIONS,
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.mySessionsPanel, {
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
			items: [
		        this.backButton
			]
		});
		
		this.sessionIdField = Ext.create('Ext.form.Text', {
            name		: 'keyword',
            label		: 'Session-ID',
            disabled	: true
        });
		
		this.add([this.toolbar, {
			title: 'createSession',
			xtype: 'formpanel',
			scrollable: null,
			id: 'createSession',
			submitOnAction: false,
			items: [{
	            xtype: 'fieldset',
	            instructions: Messages.SESSIONID_WILL_BE_CREATED,
	            items: [{
	                xtype		: 'textfield',
	                name		: 'name',
	                label		: Messages.SESSION_NAME,
	                placeHolder	: Messages.SESSION_NAME_PLACEHOLDER,
	                maxLength	: 50,
	                clearIcon: true,
	                value		: course.name
	            }, {
	                xtype		: 'textfield',
	                name		: 'shortName',
	                label		: Messages.SESSION_SHORT_NAME,
	                placeHolder	: Messages.SESSION_SHORT_NAME_PLACEHOLDER,
	                maxLength	: 8,
	                clearIcon: true,
	                value		: course.shortName
	            }]
			}, {
            	xtype		: 'textfield',
            	name		: 'keyword',
            	hidden 		: true
            }, {
				xtype: 'button',
				cls  : 'centerButton',
				ui: 'confirm',
				text: Messages.SAVE,
				handler: this.onSubmit
			}, {
				xtype: 'fieldset',
				items: [this.mycourses]
			}]
		}]);
		
		this.on('activate', function() {
			this.getSessionIds;
			this.getMyCourses;
		}, this, null, 'before');
		
		this.on('activate', this.generateNewSessionId);
	},

	onSubmit: function() {
		var values = this.up('panel').getValues();
		
		ARSnova.app.getController('Sessions').create({
			name		: values.name,
			shortName	: values.shortName,
			keyword		: values.keyword
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
			courseType	: course.type,
			keyword		: this.sessionKey
		});
	},
	
	getSessionIds: function(){
		if(this.unavailableSessionIds.length == 0){
			ARSnova.app.sessionModel.getSessionIds({
				success: function(response){
					var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
					var res = Ext.decode(response.responseText).rows;
					res.forEach(function(el){
						panel.unavailableSessionIds.push(el.key);
					});
				},
				failure: function(){
					console.log('server-side error');
				}
			});
		}
	},
	
	generateNewSessionId: function(){
		var sessionIdInUse = false;
		/* don't use do-while-loop because of the risk of an endless loop */
		for ( var i = 0; i < 10000; i++) {
			var sessionId = Math.floor(Math.random()*100000001) + "";
			if (sessionId.length == 8) {
				var idx = this.unavailableSessionIds.indexOf(sessionId); // Find the index
				if(idx != -1) sessionIdInUse = true;
				else break;
			} else {
				sessionIdInUse = true; // accept only 8-digits sessionIds
			}
		}
		this.sessionKey = sessionId;
		this.down("textfield[name=keyword]").setValue(sessionId);
		this.down('fieldset').setInstructions("Session-ID: " + ARSnova.app.formatSessionID(sessionId));
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
				this.sessionsForm.hide();
				ARSnova.app.hideLoadMask();
			}, this),
			unauthenticated: function() {
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.loginMode
				});
			},
			failure: function() {
				console.log("my courses request failure");
			}
    	}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	}
});