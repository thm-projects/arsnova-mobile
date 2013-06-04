/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/controllers/sessions.js
 - Beschreibung: Session-Controller
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
Ext.define("ARSnova.controller.Sessions", {
	extend: 'Ext.app.Controller',
    
    login: function(options){
    	if(options.keyword.length != 8){
    		Ext.Msg.alert("Hinweis", "Die Session-ID muss 8-stellig sein.");
    		return;
    	}
    	/* do login stuff */
    	var res = ARSnova.app.sessionModel.checkSessionLogin(options.keyword, {
    		success: function(response){
    			var obj = Ext.decode(response.responseText);
    			
    			//check if user is creator of this session
    			if (obj.creator == localStorage.getItem('login') && ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER){
    				ARSnova.app.isSessionOwner = true;
    				//start task: update that session owner is logeed in
    				taskManager.start(ARSnova.app.updateSessionActivityTask);
    			} else {
    				//check if session is open
    				if(!obj.active){
    					Ext.Msg.alert("Hinweis", "Die Session \"" + obj.name +"\” ist momentan geschlossen.");
    					return;
    				}
    				ARSnova.app.isSessionOwner = false;
    			}
    			
    			//set local variables
    			localStorage.setItem('sessionId', obj._id);
    	    	localStorage.setItem('name', obj.name);
    	    	localStorage.setItem('keyword', obj.keyword);
    	    	localStorage.setItem('shortName', obj.shortName);
				localStorage.setItem('courseId', obj.courseId === null ? "" : obj.courseId);
				localStorage.setItem('courseType', obj.courseType === null ? "" : obj.courseType);
				localStorage.setItem('active', obj.active ? 1 : 0);
    	    	
    	    	//start task to update the feedback tab in tabBar
    	    	taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateFeedbackTask);
    	    	taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
    	    	
    	    	ARSnova.app.hideLoadMask();
				ARSnova.app.getController('Sessions').reloadData();
    		},
    		notFound: function() {
    			Ext.Msg.alert("Hinweis", "Diese Session existiert nicht.");
    		},
    		failure: function(records, operation){
    			console.log(operation);
    			Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    		}
    	});
    },

	logout: function(){
		//remove "user has voted"-flag
		if (localStorage.getItem('user has voted'))
			localStorage.removeItem('user has voted');
		
    	//stop task to update the feedback tab in tabBar
    	taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateFeedbackTask);
    	//online counter badge
    	taskManager.stop(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
    	//stop task to update that session owner is logged-in
    	taskManager.stop(ARSnova.app.updateSessionActivityTask);
    	
		localStorage.removeItem("sessionId");
		localStorage.removeItem("name");
		localStorage.removeItem("keyword");
		localStorage.removeItem("shortName");
		localStorage.removeItem("active");
		localStorage.removeItem("session");
		localStorage.removeItem("courseId");
		localStorage.removeItem("courseType");
		ARSnova.app.isSessionOwner = false;
		
		//save that user is not in this session anymore
		ARSnova.app.restProxy.loggedInTask();
		ARSnova.app.hideLoadMask();
		
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		/* show home Panel */
		tabPanel.homeTabPanel.tab.show();
		tabPanel.animateActiveItem(tabPanel.homeTabPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});

		if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
			/* hide speaker tab panel and destroy listeners */
			tabPanel.speakerTabPanel.tab.hide();
			tabPanel.speakerTabPanel.inClassPanel.destroyListeners();
			
			/* hide feedback questions panel */
			tabPanel.feedbackQuestionsPanel.tab.hide();
			
			/* refresh mySessionsPanel */
			tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
		} else {
			/* hide user tab panel and destroy listeners */
			tabPanel.userQuestionsPanel.tab.hide();
			tabPanel.userTabPanel.tab.hide();
			tabPanel.userTabPanel.inClassPanel.destroyListeners();
		}
		
		/* hide feedback statistic panel */
		tabPanel.feedbackTabPanel.tab.hide();
	},
	
	reloadData: function(){
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		tabPanel.homeTabPanel.tab.hide();

		if(ARSnova.app.isSessionOwner){
			/* add speaker in class panel */
				if(!tabPanel.speakerTabPanel){
					tabPanel.speakerTabPanel = Ext.create('ARSnova.view.speaker.TabPanel');
					tabPanel.insert(1, tabPanel.speakerTabPanel);
				} else {
					ARSnova.app.showLoadMask("Login...");
					tabPanel.speakerTabPanel.tab.show();
					tabPanel.speakerTabPanel.renew();
					setTimeout("ARSnova.app.hideLoadMask();", 3000);
				}
				tabPanel.animateActiveItem(tabPanel.speakerTabPanel, {
					type: 'slide',
					duration: 700
				});
				tabPanel.speakerTabPanel.inClassPanel.registerListeners();

			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
					tabPanel.insert(2, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
			
			/* add feedback questions panel*/
				if(!tabPanel.feedbackQuestionsPanel){
					tabPanel.feedbackQuestionsPanel = Ext.create('ARSnova.view.feedbackQuestions.TabPanel');
					if(!tabPanel.userTabPanel)
						tabPanel.insert(3, tabPanel.feedbackQuestionsPanel);
					else
						tabPanel.insert(4, tabPanel.feedbackQuestionsPanel);
				} else {
					tabPanel.feedbackQuestionsPanel.tab.show();
				}
		} else {
			/* add user in class panel */
				if(!tabPanel.userTabPanel){
					tabPanel.userTabPanel = Ext.create('ARSnova.view.user.TabPanel');
					tabPanel.insert(0, tabPanel.userTabPanel);
				} else {
					tabPanel.userTabPanel.tab.show();
					tabPanel.userTabPanel.renew();
				}
//				tabPanel.animateActiveItem(tabPanel.userTabPanel, {
//					type: 'slide',
//					duration: 700
//				});
				
				ARSnova.app.hideLoadMask();
				tabPanel.userTabPanel.inClassPanel.registerListeners();
				
			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = Ext.create('ARSnova.view.feedback.TabPanel');
					tabPanel.insert(1, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
				
			/* add skill questions panel*/
				var questionsPanel = Ext.create('ARSnova.view.user.QuestionPanel');
				tabPanel.userQuestionsPanel = questionsPanel;
				if(!tabPanel.speakerTabPanel)
					tabPanel.insert(3, questionsPanel);
				else
					tabPanel.insert(4, questionsPanel);
				
			tabPanel.animateActiveItem(tabPanel.feedbackTabPanel, {
				type: 'slide',
				duration: 700
			});
			
			tabPanel.feedbackTabPanel.animateActiveItem(tabPanel.feedbackTabPanel.votePanel, {
				type: 'slide',
				duration: 700
			});
			if (localStorage.getItem("ARSnovaCon") === "true") {
				localStorage.removeItem("ARSnovaCon");
				tabPanel.setActiveItem(tabPanel.userQuestionsPanel, {
					type: 'slide',
					duration: 700
				});
			}
		}
	},
	
	create: function(options){
		var session = Ext.create('ARSnova.model.Session', {
			type	 : 'session',
			name	 : options.name, 
			shortName: options.shortName,
			creator	 : localStorage.getItem('login'),
			courseId : options.courseId,
			courseType:options.courseType 
		});
		session.set('_id', undefined);
		
		var validation = session.validate();
		if (!validation.isValid()) {
			Ext.Msg.alert('Hinweis', 'Bitte alle markierten Felder ausfüllen.');
			var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
			panel.down('fieldset').items.items.forEach(function(el){
				if(el.xtype == 'textfield')
					el.removeCls("required");
			});
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.getField() + ']').addCls("required");
			});
			return;
		}
		
		session.create({
			success: function(response){
				var fullSession = Ext.decode(response.responseText);
				localStorage.setItem('sessionId', fullSession._id);
				localStorage.setItem('name', fullSession.name);
				localStorage.setItem('keyword', fullSession.keyword);
				localStorage.setItem('shortName', fullSession.shortName);
				localStorage.setItem('active', fullSession.active ? 1 : 0);
				localStorage.setItem('courseId', fullSession.courseId === null ? "" : fullSession.courseId);
				localStorage.setItem('courseType', fullSession.courseType === null ? "" : fullSession.courseType);
				ARSnova.app.isSessionOwner = true;
    	    	
    	    	//start task to update the feedback tab in tabBar
    	    	taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateFeedbackTask);
    	    	taskManager.start(ARSnova.app.mainTabPanel.tabPanel.config.updateHomeTask);
    	    	
    	    	var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
    	    	panel.setActiveItem(panel.mySessionsPanel);
    	    	
				ARSnova.app.getController('Sessions').reloadData();
			},
			failure: function(records, operation){
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
			}
		});
	},
	
	setActive: function(options){
		var session = Ext.ModelMgr.getModel('ARSnova.model.Session').load(localStorage.getItem("sessionId"), {
			success: function(records, operation){
				var session = Ext.create('ARSnova.model.Session', Ext.decode(operation.getResponse().responseText));
				session.set('active', options.active);
				
				var validation = session.validate();
				if (!validation.isValid()){
					Ext.Msg.alert('Hinweis', 'Leider konnte die Session nicht gespeichert werden');
				}
				
				session.save({
					success: function(){
						//update this session in localStorage
						var sessions = Ext.decode(localStorage.getItem('lastVisitedSessions'));
						sessions.forEach(function(el){
							if(el._id == session.data._id)
								el.active = session.data.active;
						});
						localStorage.setItem('lastVisitedSessions', Ext.encode(sessions));
						
		    	  		var sessionStatus = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton;
		    	  		
		    	  		if(options.active == 1){
		    	  			sessionStatus.sessionOpenedSuccessfully();
		    	  		} else {
		    	  			sessionStatus.sessionClosedSuccessfully();
		    	  		}
					},
					failure: function(records, operation){
		    	  		Ext.Msg.alert("Hinweis!", "Session speichern war nicht erfolgreich");
					}
				});
			},
			failure: function(records, operation){
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
			}
		});
    }
});