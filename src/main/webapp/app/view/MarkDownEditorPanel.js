/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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
		cls: 'markDownEditorPanel x-field'
	},

	initialize: function (args) {
		this.callParent(args);

		this.boldButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-bold',
			escapeString: '**',
			biliteral: true,
			tooltip: 'Bold',
			handler: this.formatHandler
		});

		this.headerButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-header',
			applyString: '#',
			escapeString: '###',
			biliteral: true,
			tooltip: 'Header 1-3',
			handler: this.formatHandler
		});

		this.ulButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-ul',
			escapeString: '- ',
			biliteral: false,
			tooltip: 'Unordered List',
			handler: this.formatHandler
		});

		this.olButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-ol',
			escapeString: '1. ',
			biliteral: false,
			tooltip: 'Ordered List',
			handler: this.formatHandler
		});

		this.latexButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-script',
			escapeString: '$$',
			biliteral: true,
			tooltip: 'LaTeX-Formula',
			handler: this.formatHandler
		});

		this.codeButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-code',
			escapeString: '`',
			biliteral: true,
			tooltip: 'Source Code Highlighter',
			handler: this.formatHandler
		});

		this.quoteButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-quote',
			escapeString: '>',
			biliteral: false,
			tooltip: 'Quotation',
			handler: this.formatHandler
		});

		this.youtubeButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-youtube',
			tooltip: 'Embed Video',
			scope: this,
			handler: this.youtubeButtonHandler
		});

		this.vimeoButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-vimeo',
			tooltip: 'Embed Video',
			scope: this,
			handler: this.vimeoButtonHandler
		});

		this.picButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-image',
			tooltip: 'Picture Upload',
			scope: this,
			handler: function () {
				var me = this;
				this.showInputPanel("TEXT", "URL", "Pic", function (textValue, urlValue) {
					var processObj = me.getProcessVariables();
					var formattedUrl = "![" + textValue + "]" + "(" + urlValue + ")";
					processObj.element.setValue(processObj.preSel + formattedUrl + processObj.postSel);
					processObj.element.focus();
				});
			}
		});

		this.linkButton = Ext.create('Ext.Button', {
			cls: 'markdownButton',
			iconCls: 'icon-editor-hyperlink',
			tooltip: 'HyperLink',
			scope: this,
			handler: function () {
				var me = this;
				this.showInputPanel("TEXT", "URL", "Link", function (textValue, urlValue) {
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
				directionLock: 'true'
			},
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [
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

	applyFormatting: function (processObj, escapeString, biliteral) {
		var value, length = escapeString.length;
		var esc = biliteral ? escapeString : "";

		value = processObj.preSel + escapeString + processObj.sel + esc + processObj.postSel;

		processObj.element.setValue(value);
		processObj.component.input.dom.selectionStart = processObj.start + length;
		processObj.component.input.dom.selectionEnd = processObj.end + length;
	},

	removeFormatting: function (processObj, escapeString) {
		var length = escapeString.length;

		processObj.preSel = processObj.value.substring(0, processObj.start - length);
		processObj.postSel = processObj.value.substring(processObj.end + length, processObj.value.length);
		processObj.element.setValue(processObj.preSel + processObj.sel + processObj.postSel);
		processObj.component.input.dom.selectionStart = processObj.start - length;
		processObj.component.input.dom.selectionEnd = processObj.end - length;
	},

	formatHandler: function () {
		var parent = this.getParent().getParent();
		var escapeString = this.config.escapeString;
		var length = escapeString.length;
		var processObj = parent.getProcessVariables();
		var removal = processObj.value.substring(processObj.start - length, processObj.start) === escapeString;

		processObj.element.focus();

		if (this.config.biliteral) {
			removal = removal && processObj.value.substring(processObj.end, processObj.end + length) === escapeString;
		}

		if (removal) {
			parent.removeFormatting(processObj, escapeString);
		} else {
			applyString = this.config.applyString ? this.config.applyString : escapeString;
			parent.applyFormatting(processObj, applyString, this.config.biliteral);
		}
	},

	showInputPanel: function (firstFieldText, firstFieldPlaceholder, secondFieldText,
			secondFieldPlaceholder, title, returnFn) {
		var firstField = Ext.create('Ext.field.Text', {
			label: firstFieldText,
			placeholder: firstFieldPlaceholder
		});

		var secondField = Ext.create('Ext.field.Text', {
			label: secondFieldText,
			placeholder: secondFieldPlaceholder
		});

		var mainPart = Ext.create('Ext.form.FormPanel', {
			scrollable: null,

			items: [{
				xtype: 'fieldset',
				items: [firstField, secondField]
			}, {
				xtype: 'fieldset',
				items: [{
					xtype: 'button',
					ui: 'confirm',
					text: Messages.SAVE,
					handler: function () {
						returnFn(firstField.getValue(), secondField.getValue());
						this.getParent().getParent().getParent().hide();
					}
				}]
			}]
		});

		var toolbar = Ext.create('Ext.Toolbar', {
			title: title,
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
			layout: 'vbox',
			items: [
				toolbar,
				mainPart
			]
		});

		panel.show();
	},

	youtubeButtonHandler: function () {
		var me = this;

		this.showInputPanel("TEXT", "URL", "youtube", function (textValue, urlValue) {
			var processObj = me.getProcessVariables();
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
			var match = urlValue.match(regExp);

			if (match && match[7].length == 11) {
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

		this.showInputPanel("TEXT", "URL", "vimeo", function (textValue, urlValue) {
			var processObj = me.getProcessVariables();
			var regExp = /^.+vimeo.com\/(.*\/)?([^#\?]*)/;
			var match = urlValue.match(regExp);

			var onFailure = function () {
				Ext.toast('Incorrect URL', 2000);
			};

			if (match && match[2].length == 8) {
				ARSnova.app.restProxy.getVimeoThumbnailUrl(match[2], {
					success: function (thumbnailUrl) {
						var formatted = "[![" + textValue + "](" + thumbnailUrl
							+ ")](https://player.vimeo.com/video/" + match[2] + ")";

						processObj.element.setValue(processObj.preSel + formatted + processObj.postSel);
						processObj.element.focus();
					},
					failure: onFailure
				});
			} else {
				onFailure();
			}
		});
	}
 });
