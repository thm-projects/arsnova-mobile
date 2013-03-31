/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/archive/tabPanel.js
 - Beschreibung: TabPanel für das Archiv. TODO not yet in use
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
Ext.define('ARSnova.view.archive.TabPanel', {
	extend: 'Ext.tab.Panel',

	config: {
		title	: 'Archiv',
		iconCls	: 'time',
		
		tabBar: {
	    	hidden: true
	    }
	},
	
	constructor: function(){
		this.coursePanel = new ARSnova.view.archive.CoursePanel();
		this.questionPanel = new ARSnova.view.archive.QuestionPanel();
		
		this.items = [
            this.coursePanel,
            this.questionPanel
        ];
		ARSnova.view.archive.TabPanel.superclass.constructor.call(this);
	},
	
	initialize: function(){		
		ARSnova.view.archive.TabPanel.superclass.initialize.call(this);
	}
});