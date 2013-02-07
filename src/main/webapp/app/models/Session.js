/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/models/Session.js
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
ARSnova.models.Session = Ext.regModel('Session', {
	proxy: restProxy,
	
    fields: [
	  'type', 
	  'name', 
	  'shortName',  
	  'creator',
	  'keyword'
    ],
    
	validations: [
      {type: 'presence', field: 'type'},
      {type: 'presence', field: 'name', min: 1, max: 50},
      {type: 'length', field: 'shortName', min: 1, max: 8},
      {type: 'presence', field: 'creator'},
      {type: 'length', field: 'keyword', min: 8, max: 8}
    ],
    
    destroy: function(sessionId, creator, callbacks) {
    	return this.proxy.delSession(sessionId, creator, callbacks);
    },
    
    checkSessionLogin: function(keyword, callbacks){
    	return this.proxy.checkSessionLogin(keyword, callbacks);
    },
    
    getMySessions: function(callbacks){
    	return this.proxy.getMySessions(callbacks);
    },
    
    getSessionIds: function(callbacks){
    	return this.proxy.getSessionIds(callbacks);
    },
    
    getSession: function(sessionId, callbacks){
    	return this.proxy.getSession(sessionId, callbacks);
    },
    
    isActive: function(sessionKeyword, callbacks){
    	return this.proxy.isActive(sessionKeyword, callbacks);
    } 
});