Ext.define('ARSnova.override.viewport.Default', {
	override: 'Ext.viewport.Default',

	doBlurInput: function (e) {
		var target = e.target,
			focusedElement = this.focusedElement;
		// In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
		if (focusedElement && focusedElement.nodeName.toUpperCase() !== 'BODY' && !this.isInputRegex.test(target.tagName)) {
			delete this.focusedElement;
			if (focusedElement.blur) {
				/* focusedElement.blur might be undefined in FF */
				focusedElement.blur();
			}
		}
	}
});
