/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('ARSnova.view.MarkDownEditorPanel', {
	extend: 'Ext.Panel',

	config: {
		processElement: null,
		cls: 'markDownEditorPanel x-field',
		listeners: {
			painted: function (e) {
				/* Disable touch scrolling of view in textarea */
				this.getProcessElement().innerElement.on('touchmove', function (e) {
					e.stopPropagation();
				});
			}
		}
	},

	initialize: function (args) {
		this.callParent(args);
		var me = this;

		this.infoButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'info',
			tooltip: Messages.EDITOR_INFO_TOOLTIP,
			handler: this.openInfoMessage
		});

		this.boldButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-bold',
			escapeString: '**',
			biliteral: true,
			handler: this.formatHandler,
			tooltip: Messages.EDITOR_BOLD_TOOLTIP
		});

		this.headerButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-header',
			applyString: '#',
			escapeString: '###',
			biliteral: true,
			handler: this.formatHandler,
			tooltip: Messages.EDITOR_HEADER_TOOLTIP
		});

		this.ulButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-ul',
			escapeString: '- ',
			biliteral: false,
			handler: this.formatHandler,
			tooltip: Messages.EDITOR_ULIST_TOOLTIP
		});

		this.olButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-ol',
			escapeString: '1. ',
			biliteral: false,
			handler: this.formatHandler,
			tooltip: Messages.EDITOR_OLIST_TOOLTIP
		});

		this.latexButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-script',
			applyStrings: ['\\(', '\\)'],
			escapeString: '$$',
			biliteral: true,
			handler: this.latexHandler,
			tooltip: Messages.EDITOR_LATEX_TOOLTIP
		});

		this.codeButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-code',
			applyString: '<hlcode>',
			escapeString: '</hlcode>',
			biliteral: true,
			handler: this.codeHandler,
			tooltip: Messages.EDITOR_CODE_TOOLTIP
		});

		this.quoteButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-quote',
			escapeString: '>',
			biliteral: false,
			handler: this.formatHandler,
			tooltip: Messages.EDITOR_QUOTE_TOOLTIP
		});

		this.youtubeButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-youtube',
			scope: this,
			handler: this.youtubeButtonHandler,
			tooltip: Messages.EDITOR_YOUTUBE_TOOLTIP
		});

		this.vimeoButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-vimeo',
			scope: this,
			handler: this.vimeoButtonHandler,
			tooltip: Messages.EDITOR_VIMEO_TOOLTIP
		});

		this.picButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-image',
			scope: this,
			tooltip: Messages.EDITOR_PICTURE_TOOLTIP,
			handler: function () {
				var me = this;
				this.showInputPanel({
					firstFieldText: Messages.EDITOR_TITLE,
					secondFieldText: Messages.EDITOR_URL,
					firstFieldPlaceholder: Messages.EDITOR_TITLE_PLACEHOLDER,
					secondFieldPlaceholder: Messages.EDITOR_URL_PLACEHOLDER,
					title: Messages.EDITOR_PICTURE,
					type: 'image'
				}, function (textValue, urlValue, maxWidth, maxHeight, alignment) {
					var processObj = me.getProcessVariables();
					alignment = alignment || 'center';
					maxHeight = maxHeight || 'auto';
					maxWidth = maxWidth || 'auto';

					var dimensions = ' "' + maxWidth + 'x' + maxHeight + 'x' + alignment + '"';
					var formattedUrl = "![" + textValue + "]" + "(" + urlValue + dimensions + ")";
					processObj.element.setValue(processObj.preSel + formattedUrl + processObj.postSel);
					processObj.element.focus();
				});
			}
		});

		this.linkButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-hyperlink',
			scope: this,
			tooltip: Messages.EDITOR_HYPERLINK_TOOLTIP,
			handler: function () {
				var me = this;
				this.showInputPanel({
					firstFieldText: Messages.EDITOR_TITLE,
					secondFieldText: Messages.EDITOR_URL,
					firstFieldPlaceholder: Messages.EDITOR_TITLE_PLACEHOLDER,
					secondFieldPlaceholder: Messages.EDITOR_URL_PLACEHOLDER,
					title: Messages.EDITOR_HYPERLINK
				}, function (textValue, urlValue) {
					var processObj = me.getProcessVariables();
					var formattedUrl = "[" + textValue + "]" + "(" + urlValue + ")";
					processObj.element.setValue(processObj.preSel + formattedUrl + processObj.postSel);
					processObj.element.focus();
				});
			}
		});

		this.editorPanel = Ext.create('Ext.Panel', {
			padding: '5px 0px 0px 0px',
			minHeight: '50px',
			scrollable: {
				direction: 'horizontal',
				directionLock: true
			},
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [
				this.infoButton,
				this.boldButton,
				this.headerButton,
				this.linkButton,
				this.ulButton,
				this.olButton,
				this.latexButton,
				this.codeButton,
				this.quoteButton,
				this.picButton,
				this.youtubeButton,
				this.vimeoButton
			]
		});
		this.add(this.editorPanel);

		if (Ext.os.is.Desktop) {
			this.editorPanel.innerItems.forEach(function (button) {
				button.element.dom.setAttribute('data-tooltip', button.config.tooltip);
				button.element.addCls('buttonTooltip');
			});

			this.on('painted', function () {
				this.getParent().addCls('activateTooltip');
			});
		}
	},

	getProcessVariables: function () {
		var processElement = this.getProcessElement();
		var component = processElement.getComponent();
		var value = processElement.getValue();
		var start = component.input.dom.selectionStart;
		var end = component.input.dom.selectionEnd;

		return {
			end: end,
			start: start,
			sel: value.substring(start, end),
			preSel: value.substring(0, start),
			postSel: value.substring(end, value.length),
			element: processElement,
			component: component,
			value: value
		};
	},

	checkNewLineRequire: function (processObj, escapeString, esc) {
		var lastChar = processObj.preSel[processObj.preSel.length - 1];
		var lineBeginning = !lastChar || lastChar.match(/\n/g) !== null;

		var requireNewLine = [
			this.headerButton.config.applyString,
			this.ulButton.config.escapeString,
			this.olButton.config.escapeString,
			this.quoteButton.config.escapeString
		];

		return Ext.Array.contains(requireNewLine, escapeString) && !lineBeginning && lastChar !== esc;
	},

	applyFormatting: function (processObj, escapeString, biliteral) {
		var value, length = escapeString.length;
		var esc = biliteral ? escapeString : "";

		if (this.checkNewLineRequire(processObj, escapeString, esc)) {
			processObj.element.setValue(processObj.element.getValue() + '\n');
			processObj = this.getProcessVariables();
		}

		value = !Array.isArray(escapeString) ?
			processObj.preSel + escapeString + processObj.sel + esc + processObj.postSel :
			processObj.preSel + escapeString[0] + processObj.sel + escapeString[1] + processObj.postSel;

		processObj.element.setValue(value);
		processObj.component.input.dom.selectionStart = processObj.start + length;
		processObj.component.input.dom.selectionEnd = processObj.end + length;
	},

	removeFormatting: function (processObj, length) {
		processObj.preSel = processObj.value.substring(0, processObj.start - length);
		processObj.postSel = processObj.value.substring(processObj.end + length, processObj.value.length);
		processObj.element.setValue(processObj.preSel + processObj.sel + processObj.postSel);
		processObj.component.input.dom.selectionStart = processObj.start - length;
		processObj.component.input.dom.selectionEnd = processObj.end - length;
	},

	formatHandler: function () {
		var processObj, removal;
		var parent = this.getParent().getParent();
		var escapeString = this.config.escapeString;
		var length = escapeString.length;

		parent.getProcessElement().focus();
		processObj = parent.getProcessVariables();
		removal = processObj.value.substring(processObj.start - length, processObj.start) === escapeString;

		if (this.config.biliteral) {
			removal = removal && processObj.value.substring(processObj.end, processObj.end + length) === escapeString;
		}

		if (removal) {
			parent.removeFormatting(processObj, escapeString.length);
		} else {
			var applyString = this.config.applyString || escapeString;
			parent.applyFormatting(processObj, applyString, this.config.biliteral);
		}
	},

	showInputPanel: function (textConfig, returnFn) {
		var heightField = {}, widthField = {}, selectField = {},
			extendedFieldset = {}, extendedToggle = {};

		var firstField = Ext.create('Ext.field.Text', {
			label: textConfig.firstFieldText,
			placeHolder: textConfig.firstFieldPlaceholder
		});

		var secondField = Ext.create('Ext.field.Text', {
			label: textConfig.secondFieldText,
			placeHolder: textConfig.secondFieldPlaceholder
		});

		if (textConfig.type === 'image') {
			widthField = Ext.create('Ext.field.Number', {
				labelWidth: '60%',
				label: Messages.EDITOR_IMAGE_WIDTH_LABEL,
				placeHolder: 'auto'
			});

			heightField = Ext.create('Ext.field.Number', {
				labelWidth: '60%',
				label: Messages.EDITOR_IMAGE_HEIGHT_LABEL,
				placeHolder: 'auto'
			});

			selectField = Ext.create('Ext.field.Select', {
				labelWidth: '60%',
				label: Messages.EDITOR_IMAGE_POSITION,
				defaultTabletPickerConfig: {
					height: '8.5em',
					zIndex: '10000'
				},
				options: [
					{text: Messages.EDITOR_LEFT,  value: 'left'},
					{text: Messages.EDITOR_CENTER, value: 'center'},
					{text: Messages.EDITOR_RIGHT,  value: 'right'}
				]
			});

			extendedFieldset = Ext.create('Ext.form.FieldSet', {
				hidden: true,
				items: [widthField, heightField, selectField]
			});

			extendedToggle = Ext.create('Ext.field.Toggle', {
				label: Messages.EDITOR_EXTENDED_OPTIONS,
				hidden: textConfig.type !== 'image',
				labelWidth: '65%',
				listeners: {
					change: function (field, newValue, oldValue) {
						extendedFieldset.setHidden(!newValue);
					}
				}
			});
		}

		var mainPart = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			cls: 'inputPanel',

			items: [{
				xtype: 'fieldset',
				items: [firstField, secondField, extendedToggle]
			}, extendedFieldset, {
				xtype: 'fieldset',
				items: [{
					xtype: 'button',
					ui: 'confirm',
					text: Messages.SAVE,
					handler: function () {
						if (textConfig.type === 'image') {
							returnFn(firstField.getValue(), secondField.getValue(),
								widthField.getValue(), heightField.getValue(), selectField.getValue());
						} else {
							returnFn(firstField.getValue(), secondField.getValue());
						}

						this.getParent().getParent().getParent().hide();
					}
				}]
			}]
		});

		var toolbar = Ext.create('Ext.Toolbar', {
			title: textConfig.title,
			docked: 'top',
			ui: 'light',
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				handler: function () {
					this.getParent().getParent().hide();
				},
				style: {
					'height': '36px',
					'font-size': '0.9em',
					'padding': '0 0.4em'
				}
			}]
		});

		var panel = Ext.create('Ext.MessageBox', {
			hideOnMaskTap: true,
			zIndex: '23',
			layout: 'vbox',
			items: [
				toolbar,
				mainPart
			]
		});

		panel.show();
	},

	codeHandler: function () {
		var value = "";
		var parent = this.getParent().getParent();
		var applyString = this.config.applyString;
		var escapeString = this.config.escapeString;
		var applyLength = applyString.length;
		var escapeLength = escapeString.length;
		var processObj = parent.getProcessVariables();
		var removal = processObj.value.substring(processObj.start - applyLength, processObj.start) === applyString &&
			processObj.value.substring(processObj.end, processObj.end + escapeLength) === escapeString;
		processObj.element.focus();

		if (removal) {
			processObj.preSel = processObj.value.substring(0, processObj.start - applyLength);
			processObj.postSel = processObj.value.substring(processObj.end + escapeLength, processObj.value.length);
			processObj.element.setValue(processObj.preSel + processObj.sel + processObj.postSel);
			processObj.component.input.dom.selectionStart = processObj.start - applyLength;
			processObj.component.input.dom.selectionEnd = processObj.end - applyLength;
		} else {
			value = processObj.preSel + applyString + processObj.sel + escapeString + processObj.postSel;
			processObj.element.setValue(value);
			processObj.component.input.dom.selectionStart = processObj.start + applyLength;
			processObj.component.input.dom.selectionEnd = processObj.end + applyLength;
		}
	},

	latexHandler: function () {
		var parent = this.getParent().getParent();
		var applyStrings = this.config.applyStrings;
		var escapeString = this.config.escapeString;
		var processObj = parent.getProcessVariables();
		var length = escapeString.length;
		var start = processObj.start;
		var end = processObj.end;

		var isTex = processObj.value.substring(end, end + length) === escapeString &&
			processObj.value.substring(start - length, start) === escapeString;

		var isInlineTex = processObj.value.substring(start - length, start) === applyStrings[0] &&
			processObj.value.substring(end, end + length) === applyStrings[1];

		processObj.element.focus();
		if (isTex || isInlineTex) {
			parent.removeFormatting(processObj, length);

			if (isInlineTex) {
				parent.applyFormatting(processObj, escapeString, true);
				processObj.component.input.dom.selectionStart = start;
				processObj.component.input.dom.selectionEnd = end;
			}
		} else {
			parent.applyFormatting(processObj, applyStrings, true);
		}
	},

	youtubeButtonHandler: function () {
		var me = this;

		this.showInputPanel({
			firstFieldText: Messages.EDITOR_TITLE,
			secondFieldText: Messages.EDITOR_URL,
			firstFieldPlaceholder: Messages.EDITOR_TITLE_PLACEHOLDER,
			secondFieldPlaceholder: Messages.EDITOR_URL_PLACEHOLDER,
			title: Messages.EDITOR_YOUTUBE
		}, function (textValue, urlValue) {
			var processObj = me.getProcessVariables();
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var match = urlValue.match(regExp);

			if (match && match[7].length === 11) {
				var videoId = match[7];
				var formatted = "[![" + textValue + "](https://img.youtube.com/vi/" + videoId
					+ "/0.jpg)](https://www.youtube.com/watch?v=" + videoId + ")";

				processObj.element.setValue(processObj.preSel + formatted + processObj.postSel);
				processObj.element.focus();
			} else {
				Ext.toast('Incorrect URL', 2000);
			}
		});
	},

	vimeoButtonHandler: function () {
		var me = this;

		this.showInputPanel({
			firstFieldText: Messages.EDITOR_TITLE,
			secondFieldText: Messages.EDITOR_URL,
			firstFieldPlaceholder: Messages.EDITOR_TITLE_PLACEHOLDER,
			secondFieldPlaceholder: Messages.EDITOR_URL_PLACEHOLDER,
			title: Messages.EDITOR_VIMEO
		}, function (textValue, urlValue) {
			var processObj = me.getProcessVariables();
			var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
			var match = urlValue.match(regExp);

			var onFailure = function () {
				Ext.toast('Incorrect URL', 2000);
			};

			if (match && match.length > 5 && !isNaN(match[5])) {
				ARSnova.app.restProxy.getVimeoThumbnailUrl(match[5], {
					success: function (thumbnailUrl) {
						var formatted = "[![" + textValue + "](" + thumbnailUrl
							+ ")](https://player.vimeo.com/video/" + match[5] + ")";

						processObj.element.setValue(processObj.preSel + formatted + processObj.postSel);
						processObj.element.focus();
					},
					failure: onFailure
				});
			} else {
				onFailure();
			}
		});
	},

	openInfoMessage: function () {
		var infoMessageBox = Ext.create('ARSnova.view.components.MarkdownMessageBox', {
			content: Messages.EDITOR_INFO_HINT,
			destroyOnHide: true
		});

		infoMessageBox.show();
	}
 });
