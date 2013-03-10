/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Darstellung von MathJax im Stile einer TextArea
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
ARSnova.views.MathJaxField = Ext.extend(Ext.form.Field, {
	
	/**
     * @cfg {Object} layoutObject The object to layout after MathJax finished typesetting.
     */
	layoutObject: null,
	
	content: "",
	
	renderTpl: [
            '<tpl if="label">',
                '<div class="x-form-label"><span>{label}</span></div>',
            '</tpl>',
            '<tpl if="fieldEl">',
                '<div class="x-form-field-container"><div id="{inputId}" class="{fieldCls} x-field-slider"',
                    '<tpl if="style">style="{style}" </tpl> >{content}</div>',
                '</div>',
            '</tpl>'
        ],
	
	initRenderData: function() {
		ARSnova.views.MathJaxField.superclass.initRenderData.apply(this, arguments);
		
		Ext.applyIf(this.renderData, {
			content: this.content
		});
		
		return this.renderData;
	},
	
	afterRender: function() {
		ARSnova.views.MathJaxField.superclass.afterRender.apply(this, arguments);
		
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.renderData.inputId], Ext.createDelegate(function() {
			var containerObject = this.layoutObject || this.up("form");
			containerObject.doComponentLayout();
		}, this));
	}
});

Ext.reg('mathjaxfield', ARSnova.views.MathJaxField);
