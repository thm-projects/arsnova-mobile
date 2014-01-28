Ext.define('ARSnova.view.speaker.form.AbstentionForm', {
	extend: 'Ext.form.FormPanel',
	
	config: {
		abstention: true,
		
		scrollable: null,
		cls: 'newQuestionOptions'
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.add([{
			xtype: 'fieldset',
			title: Messages.ABSTENTION_POSSIBLE,
			items: [{
				xtype: 'segmentedbutton',
				style: 'margin: auto',
				cls: 'yesnoOptions',
				items: [{
					text: Messages.YES,
					pressed: this.getAbstention(),
					scope: this,
					handler: function() {
						this.setAbstention(true);
					}
				}, {
					text: Messages.NO,
					pressed: !this.getAbstention(),
					scope: this,
					handler: function() {
						this.setAbstention(false);
					}
				}]
			}]
		}]);
	}
});
