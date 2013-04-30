/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/model/Course.js
 - Beschreibung: Course-Model
 - Autor(en):    Paul-Christian Volkmer <paul-christian.volkmer@mni.thm.de>
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
Ext.define('ARSnova.model.Course', {
	extend: 'Ext.data.Model',
	
	config: {
		proxy: { type: 'restProxy' },
		
		fields: [
		   	  'id',
		   	  'fullname',
		   	  'shortname',
		   	  'type'
		       ],
	},
	
    getMyCourses: function(callbacks, sortby){
    	return this.getProxy().getMyCourses(callbacks, sortby);
    },
});