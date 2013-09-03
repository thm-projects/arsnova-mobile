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
Ext.define('ARSnova.view.speaker.TabPanel', {
	extend: 'Ext.tab.Panel',
	
	requires: ['ARSnova.view.speaker.FlashcardPanel', 'ARSnova.view.speaker.PreparationQuestionPanel'],
	
	config: {
		title	: Messages.SESSION,
		iconCls	: 'tabBarIconHome',
		
		tabBar: {
	    	hidden: true
		}  
	},
	    
	initialize: function() {
		this.callParent(arguments);
		
		this.inClassPanel 				= Ext.create('ARSnova.view.speaker.InClass');
		this.audienceQuestionPanel 		= Ext.create('ARSnova.view.speaker.AudienceQuestionPanel');
		this.flashcardPanel 			= Ext.create('ARSnova.view.speaker.FlashcardPanel');
		this.preparationQuestionPanel	= Ext.create('ARSnova.view.speaker.PreparationQuestionPanel');
		this.newQuestionPanel 			= Ext.create('ARSnova.view.speaker.NewQuestionPanel');
		this.showcaseQuestionPanel		= Ext.create('ARSnova.view.speaker.ShowcaseQuestionPanel');
		
		this.add([
	        this.inClassPanel,
	        this.audienceQuestionPanel,
	        this.newQuestionPanel
        ]);
	},
	
	renew: function(){
		this.remove(this.inClassPanel);
		this.inClassPanel = Ext.create('ARSnova.view.speaker.InClass');
		this.insert(0, this.inClassPanel);
		this.setActiveItem(this.inClassPanel);
		this.inClassPanel.registerListeners();
	}
});