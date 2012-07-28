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
Ext.regController("sessions", {
    model: 'Session',
    
    login: function(options){
    	if(options.keyword.length != 8){
    		Ext.Msg.alert("Hinweis", "Die Session-ID muss 8-stellig sein.");
    		Ext.Msg.doComponentLayout();
    		return;
    	}
    	/* do login stuff */
    	var res = ARSnova.sessionModel.checkSessionLogin(options.keyword, {
    		success: function(response){
    			var responseObj = Ext.decode(response.responseText);
    			
    			//check if session exists
    			if(responseObj.rows.length == 0){
    				Ext.Msg.alert("Hinweis", "Diese Session existiert nicht.");
    				Ext.Msg.doComponentLayout();
    				return;
    			}
    			
    			var obj = responseObj.rows[0].value;
    			
    			//check if user is creator of this session
    			if (obj.creator == localStorage.getItem('login') && ARSnova.userRole == ARSnova.USER_ROLE_SPEAKER){
    				ARSnova.isSessionOwner = true;
    			} else {
    				//check if session is open
    				if(obj.active == 0){
    					Ext.Msg.alert("Hinweis", "Die Session \"" + obj.name +"\” ist momentan geschlossen.");
    					Ext.Msg.doComponentLayout();
    					return;
    				}
    				ARSnova.isSessionOwner = false;
    				
    			}
    			
    			//save session as one of five lastVisitedSessions in localStorage
    			ARSnova.saveLastVisitedSession(obj);
    			
    			//set local variables
    			localStorage.setItem('sessionId', obj._id);
    	    	localStorage.setItem('name', obj.name);
    	    	localStorage.setItem('keyword', obj.keyword);
    	    	localStorage.setItem('shortName', obj.shortName);
    	    	localStorage.setItem('active', obj.active);
    	    	
    	    	//save that i am logged in this session
    	    	restProxy.loggedInTask();
    	    	//start feedback-votes-cleaning-up-task
    	    	taskManager.start(ARSnova.cleanFeedbackVotes);
    	    	//start task to update the feedback tab in tabBar
    	    	taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
    	    	
    	    	Ext.dispatch({
	    			controller	: 'sessions',
	    			action		: 'reloadData',
	    		});
    		},
    		failure: function(records, operation){
    			console.log(operation);
    			Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    			Ext.Msg.doComponentLayout();
    		}
    	});
    },

	logout: function(){
		//remove "user has voted"-flag
		if (localStorage.getItem('user has voted'))
			localStorage.removeItem('user has voted');
		
		//stop feedback-votes-cleaning-up-task
    	taskManager.stop(ARSnova.cleanFeedbackVotes);
    	//stop task to update the feedback tab in tabBar
    	taskManager.stop(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
    	
		localStorage.removeItem("sessionId");
		localStorage.removeItem("name");
		localStorage.removeItem("keyword");
		localStorage.removeItem("short_name");
		localStorage.removeItem("active");
		
		//save that user is not in this session anymore
		restProxy.loggedInTask();
		
		var tabPanel = ARSnova.mainTabPanel.tabPanel;
		/* show home Panel */
		tabPanel.homeTabPanel.tab.show();
		tabPanel.setActiveItem(tabPanel.homeTabPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});

		if(ARSnova.isSessionOwner){
			/* hide speaker tab panel and destroy listeners */
			tabPanel.speakerTabPanel.tab.hide();
			tabPanel.speakerTabPanel.inClassPanel.destroyListeners();
			
			/* hide feedback statistic panel */
			tabPanel.feedbackTabPanel.tab.hide();
			
			/* hide feedback questions panel */
			tabPanel.feedbackQuestionsPanel.tab.hide();
			
			/* refresh mySessionsPanel */
			tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
		} else {
			/* hide user tab panel and destroy listeners */
			tabPanel.userTabPanel.tab.hide();
			tabPanel.userTabPanel.inClassPanel.destroyListeners();
			
			/* hide feedback statistic panel */
			tabPanel.feedbackTabPanel.tab.hide();
			
			/* hide feedback questions panel */
			tabPanel.userQuestionsPanel.tab.hide();
		}
		
		ARSnova.mainTabPanel.tabPanel.doComponentLayout();
	},
	
	reloadData: function(){
		/* hide homeTabPanel and archivePanel */
		var tabPanel = ARSnova.mainTabPanel.tabPanel;
		tabPanel.homeTabPanel.tab.hide();
//		tabPanel.archiveTabPanel.tab.hide();
		
		if(ARSnova.isSessionOwner){
			/* add speaker in class panel */
				if(!tabPanel.speakerTabPanel){
					tabPanel.speakerTabPanel = new ARSnova.views.speaker.TabPanel();
					tabPanel.insert(1, tabPanel.speakerTabPanel);
				} else {
					ARSnova.showLoadMask("Login...");
					tabPanel.speakerTabPanel.tab.show();
					tabPanel.speakerTabPanel.renew();
					
					/* don't know what's going on here, try to fix it */
					setTimeout("ARSnova.mainTabPanel.tabPanel.speakerTabPanel.doComponentLayout();", 1000);
					setTimeout("ARSnova.mainTabPanel.tabPanel.layout.layout();", 2000);
					setTimeout("ARSnova.hideLoadMask();", 3000);
				}
				tabPanel.setActiveItem(tabPanel.speakerTabPanel, {
					type: 'slide',
					duration: 700
				});
				tabPanel.speakerTabPanel.inClassPanel.registerListeners();

			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = new ARSnova.views.feedback.TabPanel();
					tabPanel.insert(2, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
			
			/* add feedback questions panel*/
				if(!tabPanel.feedbackQuestionsPanel){
					tabPanel.feedbackQuestionsPanel = new ARSnova.views.feedbackQuestions.TabPanel();
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
					tabPanel.userTabPanel = new ARSnova.views.user.TabPanel();
					tabPanel.insert(0, tabPanel.userTabPanel);
				} else {
					ARSnova.showLoadMask("Login...");
					tabPanel.userTabPanel.tab.show();
					tabPanel.userTabPanel.renew();
					setTimeout("ARSnova.mainTabPanel.tabPanel.userTabPanel.inClassPanel.doComponentLayout()", 1000);
					setTimeout("ARSnova.hideLoadMask();", 1500);
				}
//				tabPanel.setActiveItem(tabPanel.userTabPanel, {
//					type: 'slide',
//					duration: 700
//				});

				tabPanel.userTabPanel.inClassPanel.registerListeners();
				
			/* add feedback statistic panel*/
				if(!tabPanel.feedbackTabPanel){
					tabPanel.feedbackTabPanel = new ARSnova.views.feedback.TabPanel();
					tabPanel.insert(1, tabPanel.feedbackTabPanel);
				} else {
					tabPanel.feedbackTabPanel.tab.show();
					tabPanel.feedbackTabPanel.renew();
				}
				
			/* add skill questions panel*/
				var questionsPanel = new ARSnova.views.user.QuestionPanel();
				tabPanel.userQuestionsPanel = questionsPanel;
				if(!tabPanel.speakerTabPanel)
					tabPanel.insert(3, questionsPanel);
				else
					tabPanel.insert(4, questionsPanel);
				
			tabPanel.setActiveItem(tabPanel.feedbackTabPanel, {
				type: 'slide',
				duration: 700
			});
			tabPanel.feedbackTabPanel.setActiveItem(tabPanel.feedbackTabPanel.votePanel, {
				type: 'slide',
				duration: 700
			});
		}
	},
	
	create: function(options){
		var session = Ext.ModelMgr.create({
			type	 : 'session',
			name	 : options.name, 
			shortName: options.shortName,
			keyword	 : options.keyword,
			creator	 : localStorage.getItem('login'),
			active	 : 1,
		}, 'Session');
		
		var validation = session.validate();
		if (!validation.isValid()) {
			Ext.Msg.alert('Hinweis', 'Bitte alle markierten Felder ausfüllen.');
			Ext.Msg.doComponentLayout();
			var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel.newSessionPanel;
			panel.down('fieldset').items.items.forEach(function(el){
				if(el.xtype == 'textfield')
					el.removeCls("required");
			});
			validation.items.forEach(function(el){
				panel.down('textfield[name=' + el.field + ']').addCls("required")
			});
			return;
		}
		
		session.save({
			success: function(response){
    	  		localStorage.setItem('sessionId', response.id);
    	    	localStorage.setItem('name', session.data.name);
    	    	localStorage.setItem('keyword', session.data.keyword);
    	    	localStorage.setItem('shortName', session.data.shortName);
    	    	localStorage.setItem('active', session.data.active);
				ARSnova.isSessionOwner = true;
    	    	
    	    	//start feedback-votes-cleaning-up-task
    	    	taskManager.start(ARSnova.cleanFeedbackVotes);
    	    	//start task to update the feedback tab in tabBar
    	    	taskManager.start(ARSnova.mainTabPanel.tabPanel.updateFeedbackTask);
    	    	
    	    	ARSnova.saveLastVisitedSession(session.data);
    	    	
    	    	var panel = ARSnova.mainTabPanel.tabPanel.homeTabPanel;
    	    	panel.setActiveItem(panel.mySessionsPanel);
    	    	
    	    	ARSnova.showLoadMask("Login");
    	    	Ext.dispatch({
    	    		controller	: 'sessions',
    	    		action		: 'reloadData'
    	    	});
			},
			failure: function(records, operation){
				console.log(operation);
				Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
				Ext.Msg.doComponentLayout();
			},
		});
	},
	
	setActive: function(options){
		var session = Ext.ModelMgr.getModel("Session").load(localStorage.getItem("sessionId"), {
			success: function(records, operation){
				var session = Ext.ModelMgr.create(Ext.decode(operation.response.responseText), 'Session');
				session.set('active', options.active);
				var validation = session.validate();
				if (!validation.isValid()){
					Ext.Msg.alert('Hinweis', 'Leider konnte die Session nicht gespeichert werden');
					Ext.Msg.doComponentLayout();					
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
						
		    	  		var sessionStatus = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.sessionStatusButton;
		    	  		
		    	  		if(options.active == 1){
		    	  			sessionStatus.sessionOpenedSuccessfully();
		    	  		} else {
		    	  			sessionStatus.sessionClosedSuccessfully();
		    	  		}
					},
					failure: function(records, operation){
						console.log(operation);
		    	  		Ext.Msg.alert("Hinweis!", "Session speichern war nicht erfolgreich");
		    	  		Ext.Msg.doComponentLayout();
					},
				});
			},
			failure: function(records, operation){
				console.log(operation);
    	  		Ext.Msg.alert("Hinweis!", "Die Verbindung zum Server konnte nicht hergestellt werden");
    	  		Ext.Msg.doComponentLayout();
			},
		});
    },
});