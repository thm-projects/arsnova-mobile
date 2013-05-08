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
ARSnova.views.home.NewSessionPanel = Ext.extend(Ext.Panel, {
	scroll		: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	mycourses: [],
	mycoursesStore: null,
	
	constructor: function(responseText){
		this.mycoursesStore = new Ext.data.JsonStore({
			model: ARSnova.models.Course
		});

		this.mycourses = new Ext.List({
			store: this.mycoursesStore,
			itemTpl: window.innerWidth > 321
						? '<span class="course">{fullname}<span>'
						: '<span class="course">{shortname}<span>',
			listeners: {
				itemTap: Ext.createDelegate(this.onCourseSubmit,this)
			}
		});
		
		this.mycourses.setScrollable(false);

		this.backButton = new Ext.Button({
			text	: Messages.SESSIONS,
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
				hTP.setActiveItem(hTP.mySessionsPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.NEW_SESSION,
			cls	 : 'titlePaddingLeft',
			items: [
		        this.backButton
			]
		});
		
		this.dockedItems = [this.toolbar];
		
		this.items = [{
			title: 'createSession',
			xtype: 'form',
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
	                useClearIcon: true
	            }, {
	                xtype		: 'textfield',
	                name		: 'shortName',
	                label		: Messages.SESSION_SHORT_NAME,
	                placeHolder	: Messages.SESSION_SHORT_NAME_PLACEHOLDER,
	                maxLength	: 8,
	                useClearIcon: true
	            }]
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
		}];
		
		ARSnova.views.home.NewSessionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('beforeactivate', this.getMyCourses);
		
		ARSnova.views.home.NewSessionPanel.superclass.initComponent.call(this);
	},
	
	onSubmit: function() {
		var values = this.up('panel').getValues();
		
		Ext.dispatch({
			controller	: 'sessions',
			action		: 'create',
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

		Ext.dispatch({
			controller	: 'sessions',
			action		: 'create',
			name		: course.fullname,
			shortName	: shortName,
			courseId	: course.id,
			courseType	: course.type
		});
	},

	getMyCourses: function() {
		if (ARSnova.loginMode != ARSnova.LOGIN_THM) return;
		//ARSnova.showLoadMask(Messages.LOAD_MASK_SEARCH_COURSES);
		ARSnova.courseModel.getMyCourses({
			success: Ext.createDelegate(function(response) {
				this.mycoursesStore.removeAll();
				this.mycoursesStore.add(Ext.decode(response.responseText));
				if (window.innerWidth > 321) {
					this.mycoursesStore.sort('fullname');
				} else {
					this.mycoursesStore.sort('shortname');
				}
			}, this),
			empty: Ext.createDelegate(function() {
				ARSnova.hideLoadMask();
			}, this),
			unauthenticated: function() {
				Ext.dispatch({
					controller: "auth",
					action: "login",
					mode: ARSnova.loginMode
				});
			},
			failure: function() {
				console.log("my courses request failure");
			}
    	}, (window.innerWidth > 321 ? 'name' : 'shortname'));
	}
});