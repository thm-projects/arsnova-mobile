/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/CustomMask.js
 - Beschreibung: Angepasste Maske, um Scrolling innerhalb eines Carousel zu ermoeglichen
 - Version:      1.0, 21/05/13
 - Autor(en):    Andreas Gaertner <andreas.gaertner@mni.thm.de>
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
Ext.define('ARSnova.view.CustomMask', {
    extend: 'Ext.Component',
    xtype: 'custom-mask',

    config: {
        baseCls: Ext.baseCSSPrefix + 'mask',
        transparent: false,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    initialize: function() {
        this.callSuper();
        this.element.on('*', 'onEvent', this);
    },

    updateTransparent: function(newTransparent) {
        this[newTransparent ? 'addCls' : 'removeCls'](this.getBaseCls() + '-transparent');
    }
});