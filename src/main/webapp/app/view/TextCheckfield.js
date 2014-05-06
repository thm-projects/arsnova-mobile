/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 /app/view/TextCheckfield.js
 - Description	: Textfield with a checkfield instead of the default label.
 - Version		: 1.0, 15/06/2013
 - Autor(en)	: Andreas Gaertner <andreas.gaertner@mni.thm.de>
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

Ext.define('ARSnova.view.TextCheckfield', {
	extend: 'Ext.field.Text',
	alias: 'x-textcheckfield',
	xtype: 'textcheckfield',
	
	config: {
		checked:		null,
		checkedCls:		'checked',
		uncheckedCls:	'unchecked',
		
		/**
		 * Overwriting label of textfield in order to place a checkbox instead of the label.
		 * Label value '3' is the checkbox icon (check css cls checkItem).
		 */
		label:			'3',	
		labelAlign:		'right',
		labelWidth:		'2.0em',
		labelCls:		'checkItem',
		
		/**
		 * listener for tap event on label element (toggleChecked())
		 */		
		listeners: {			
			'tap': {
				element: 'label',
	        	fn: function() {
	        		var parent = this.config.container;
	        		if(parent.config.singleChoice) {
	        			var parent = this.config.container;
	        			for (var i=0; i < parent.selectAnswerCount.getValue(); i++) {
	        				parent.answerComponents[i].uncheck();
	        			}
	        		} 
	        		this.toggleChecked();
	        	}
	        }
		}
	},

	initialize: function() {
		this.callParent(arguments);
		/**
		 * If checked is set true, the class of the label will be set to this.config.checkedCls,
		 * otherwise to this.config.uncheckedCls.
		 */
		this.label.addCls(
			(this.isChecked() ? this.config.checkedCls : this.config.uncheckedCls)
		);
		
		/**
		 * initialize checked as false by default. If this step is not done, the framework
		 * don't initialize 'checked' and let it undefined.
		 */
		this.onAfter('initialize', function() {
			if(this.config.checked == null) {
				this.config.checked = false;
			}
		});
	},
		
	/**
	 * @return: Returns the value of this.config.checked (boolean).
	 */
	isChecked: function() {
		return this.config.checked;
	},
	
	/**
	 * unchecks the checkfield
	 */
	uncheck: function() {
		this.config.checked = false; 
		this.label.replaceCls(this.config.checkedCls, this.config.uncheckedCls);
	},
	
	/**
     * Toggles labelCls between this.config.uncheckedCls and this.config.checkedCls and
     * the this.config.checked attribute between true and false.
	*/
	toggleChecked: function() {
		if (this.config.checked) {
			this.label.replaceCls(this.config.checkedCls, this.config.uncheckedCls);
		} else {
			this.label.replaceCls(this.config.uncheckedCls, this.config.checkedCls);
		}
        
		this.config.checked = !this.config.checked;
	}
});
