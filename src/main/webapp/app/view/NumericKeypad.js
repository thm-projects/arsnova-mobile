/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/view/NumericKeypad.js
 - Beschreibung: Textfeld, welches eine numerische Tastatur auf dem iPhone/iPod Touch öffnet.
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
Ext.define('ARSnova.view.NumericKeypad', {
	extend: 'Ext.form.Text',
	alias: 'widget.numericKeypad',

	config: {
		ui: 'number'
	},

	inputType: 'text',
	minValue : undefined,
	maxValue : undefined,
	stepValue : undefined,
	renderTpl: [
		'<tpl if="label"><div class="x-form-label"><span>{label}</span></div></tpl>',
		'<tpl if="fieldEl"><div class="x-form-field-container">',
			'<input id="{inputId}" type="{inputType}" name="{name}" pattern="[0-9]*" class="{fieldCls}"',
				'<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
				'<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
				'<tpl if="style">style="{style}" </tpl>',
				'<tpl if="minValue != undefined">min="{minValue}" </tpl>',
				'<tpl if="maxValue != undefined">max="{maxValue}" </tpl>',
				'<tpl if="maxLength != undefined">maxlength="{maxLength}" </tpl>',
				'<tpl if="stepValue != undefined">step="{stepValue}" </tpl>',
				'<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
				'<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
				'<tpl if="autoFocus">autofocus="{autoFocus}" </tpl>',
			'/>',
			'<tpl if="useMask"><div class="x-field-mask"></div></tpl>',
			'</div></tpl>',
		'<tpl if="clearIcon"><div class="x-field-clear-container"><div class="x-field-clear x-hidden-visibility">&#215;</div><div></tpl>'
	],

	// @private
	initialize : function() {
		Ext.apply(this.renderData, {
			maxValue	: this.maxValue,
			maxLength	: this.maxLength,
			minValue	: this.minValue,
			stepValue	: this.stepValue,
			placeHolder	: this.placeHolder
		});

		this.callParent(arguments);
	}
});
