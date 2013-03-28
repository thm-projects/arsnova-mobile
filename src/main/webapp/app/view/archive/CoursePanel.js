/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/archive/coursePanel.js
 - Beschreibung: Panel zum Auswählen eines Archivs. TODO not yet in use
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
Ext.ns('ARSnova.views.archive');

ARSnova.views.archive.CoursePanel = Ext.extend(Ext.Panel, {
	selectField: null,
	
	/* toolbar items */
	toolbar				: null,
	backButton			: null,
	
	constructor: function(){
		this.toolbar = new Ext.Toolbar({
			title: 'Archiv'
		});
		
		this.dockedItems = [this.toolbar];
		
		this.courseForm = new Ext.form.FormPanel({
			cls: 'standardForm'
		});
		
		this.normalForm = new Ext.form.FormPanel({
			cls: 'standardForm',
			items: [{
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Alle Archiv-Fragen',
				cls			: 'forwardListButton',
				courseId	: 'all',
				handler		: function(obj){
					Ext.dispatch({
						controller: 'archive',
						action: 'showArchive',
						courseId: obj.courseId
					});
				}
			}, {
				xtype		: 'button',
				ui			: 'normal',
				text		: 'Fragen für THM-Mitglieder',
				cls			: 'forwardListButton',
				courseId	: 'thm',
				handler		: function(obj){
					Ext.dispatch({
						controller: 'archive',
						action: 'showArchive',
						courseId: obj.courseId
					});
				}
			}]
		});
		
		this.items = [{
			cls: 'gravure',
			html: 'Welche Fragen möchten Sie sehen:'
		}, this.normalForm, {
			cls: 'gravure',
			html: 'Fragen meiner eStudy-Kurse:'
		}, this.courseForm];
		
		ARSnova.views.archive.CoursePanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		this.on('activate', this.onActivate);

		ARSnova.views.archive.CoursePanel.superclass.initComponent.call(this);
	},
	
	getCourses: function(){
		ARSnova.showLoadMask("Suche Ihre Kurse...");
		if (ARSnova.loggedIn){
			Ext.Ajax.request({
	    		url: ARSnova.WEBSERVICE_URL + 'estudy/getUserCourses.php',
	    		params: {
	    			login: localStorage.getItem('login')
	    		},
	    		success: function(response, opts){
	    	  		var obj = Ext.decode(response.responseText).courselist;
	    	  		var panel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.coursePanel;
	    	  		
	    	  		/* Build new options array */
	    	  		var coursesObj = new Array();
	    	  		for ( var i = 0; i < obj.count; i++){
						var course = obj.course[i];
						panel.courseForm.add({
							xtype		: 'button',
							ui			: 'normal',
							text		: course.name,
							cls			: 'forwardListButton',
							courseId	: course.id,
							handler		: function(obj){
								Ext.dispatch({
									controller: 'archive',
									action: 'showArchive',
									courseId: obj.courseId
								});
							}
						});
					}
	    	  		panel.doComponentLayout();
	    	  		ARSnova.hideLoadMask();
	    		},
	    		failure: function(response, opts){
	    	  		console.log('getcourses server-side failure with status code ' + response.status);
	    	  		Ext.Msg.alert("Hinweis!", "Es konnten keine Kurse überprüft werden.");
	    	  		Ext.Msg.doComponentLayout();
	    		}
	    	});
		} else {
			Ext.Ajax.request({
	    		url: ARSnova.WEBSERVICE_URL + 'estudy/getAllCourses.php',
	    		success: function(response, opts){
	    	  		var obj = Ext.decode(response.responseText).courselist;
	    	  		
	    	  		/* Build new options array */
	    	  		var coursesObj = new Array();
	    	  		for ( var i = 0; i < obj.count; i++){
						var course = obj.course[i];
						coursesObj.push({
							text	: course.name,
							value	: course.id,
							name	: course.id
						});
					}
	    	  		/* get archivePanel and append (!) new options */
	    	  		var archivePanel = ARSnova.mainTabPanel.tabPanel.archiveTabPanel.archivePanel;
	    	  		archivePanel.selectField.setOptions(coursesObj, true);
	    	  		archivePanel.setLoading(false);
	    		},
	    		failure: function(response, opts){
	    	  		console.log('getcourses server-side failure with status code ' + response.status);
	    	  		Ext.Msg.alert("Hinweis!", "Es konnten keine Kurse überprüft werden.");
	    	  		Ext.Msg.doComponentLayout();
	    		}
	    	});
		}
	},
	
	onActivate: function(){
		this.courseForm.removeAll();
		this.getCourses();
	}
});