/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: MessageBox mit Mathjax-Unterstützung
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
ARSnova.views.MathjaxMessageBox = Ext.extend(Ext.MessageBox, {
	
	initComponent: function() {
		//this.on("afterrender", this.afterRender);
		
		ARSnova.views.MathjaxMessageBox.superclass.initComponent.apply(this, arguments);
	},
	
	afterRender: function() {
		ARSnova.views.MathjaxMessageBox.superclass.afterRender.apply(this, arguments);
		
		if (typeof this.titleBar.getEl() !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.msgEl.id]);
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.titleBar.id]);
			MathJax.Hub.Queue(Ext.createDelegate(function() {
				this.titleBar.doComponentLayout();
				this.doComponentLayout();
			}, this));
		} else {
			Ext.defer(this.afterRender, 100, this, arguments);
		}
	}
});

Ext.Msg = new ARSnova.views.MathjaxMessageBox();