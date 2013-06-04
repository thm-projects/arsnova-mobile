/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/model/Session.js
 - Beschreibung: Session-Model
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
Ext.define('ARSnova.model.Session', {
	extend: 'Ext.data.Model',
	
	config: {
		proxy: { type: 'restProxy' },
		idProperty: "_id",
        
		fields: [
		      '_rev',
		   	  'type', 
		   	  'name', 
		   	  'active',
		   	  'shortName',  
		   	  'creator',
		   	  'keyword',
		   	  'courseId',
		   	  'courseType'
		       ],
		
		validations: [
             {type: 'presence', field: 'type'},
             {type: 'presence', field: 'name', min: 1, max: 50},
             {type: 'length', field: 'shortName', min: 1, max: 12},
             {type: 'presence', field: 'creator'}
           ]
	},
	
    destroy: function(sessionId, creator, callbacks) {
    	return this.getProxy().delSession(sessionId, creator, callbacks);
    },
    
    create: function(callbacks) {
    	return this.getProxy().createSession(this, callbacks);
    },
    
    checkSessionLogin: function(keyword, callbacks) {
    	return this.getProxy().checkSessionLogin(keyword, callbacks);
    },
    
    getMySessions: function(callbacks, sortby) {
    	return this.getProxy().getMySessions(callbacks, sortby);
    },
    
    getSessionIds: function(callbacks) {
    	return this.getProxy().getSessionIds(callbacks);
    },
    
    getSession: function(sessionId, callbacks) {
    	return this.getProxy().getSession(sessionId, callbacks);
    },
    
    isActive: function(sessionKeyword, callbacks) {
    	return this.getProxy().isActive(sessionKeyword, callbacks);
    } 
});