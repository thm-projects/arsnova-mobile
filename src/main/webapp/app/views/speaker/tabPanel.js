/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/tabPanel.js
 - Beschreibung: TabPanel für Session-Inhaber.
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
ARSnova.views.speaker.TabPanel = Ext.extend(Ext.TabPanel, {
	title	: Messages.SESSION,
	iconCls	: 'tabBarIconHome',
	
	tabBar: {
    	hidden: true,
    },
	
	constructor: function(){
		this.inClassPanel 			= new ARSnova.views.speaker.InClass();
		this.audienceQuestionPanel 	= new ARSnova.views.speaker.AudienceQuestionPanel();
		this.newQuestionPanel 		= new ARSnova.views.speaker.NewQuestionPanel();
		this.showcaseQuestionPanel	= new ARSnova.views.speaker.ShowcaseQuestionPanel();
		
		this.items = [
	        this.inClassPanel,
	        this.audienceQuestionPanel,
	        this.newQuestionPanel,
        ];
		ARSnova.views.speaker.TabPanel.superclass.constructor.call(this);
	},
	
	initComponent: function(){
		setTimeout("ARSnova.hideLoadMask();", 1000);
		
		ARSnova.views.speaker.TabPanel.superclass.initComponent.call(this);
	},
	
	renew: function(){
		this.remove(this.inClassPanel);
		this.inClassPanel = new ARSnova.views.speaker.InClass();
		this.insert(0, this.inClassPanel);
		this.setActiveItem(this.inClassPanel);
		this.inClassPanel.registerListeners();
	}
});