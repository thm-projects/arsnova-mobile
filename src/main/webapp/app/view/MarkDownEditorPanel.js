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

	textarea: null,

	constructor: function (config) {
		this.callParent(config);
	},

	initialize: function () {

		this.boldButton = Ext.create('Ext.Button', {
            cls: 'markdownButton',
            iconCls: 'icon-editor-bold',
            tooltip: 'Bold',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 2, start) == "**" && this.textarea.getValue().substring(end, end + 2) == "**") {
                    preSel = this.textarea.getValue().substring(0, start - 2);
                    postSel = this.textarea.getValue().substring(end + 2, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 2;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 2;
                } else {
                    this.textarea.setValue(preSel + "**" + sel + "**" + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 2;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 2;
                }
            }
        });

        this.headerButton = Ext.create('Ext.Button', {
            cls: 'markdownButton',
            iconCls: 'icon-editor-header',
            tooltip: 'Header 1-3',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 3, start) == "###" && this.textarea.getValue().substring(end, end + 3) == "###") {
                    preSel = this.textarea.getValue().substring(0, start - 3);
                    postSel = this.textarea.getValue().substring(end + 3, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 3;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 3;
                } else {
                    this.textarea.setValue(preSel + "#" + sel + "#" + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 1;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 1;
                }
            }
        });

        this.linkButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-hyperlink',
            cls: 'markdownButton',
            tooltip: 'HyperLink',
            scope: this,
            handler: function () {
                var me = this;
                var inputLink = Ext.create('ARSnova.view.Hyperlink', {
                    name: 'hyperlink',
                    height: '40%',
                    scope: me,
                    listeners: {
                        hide: function () {
                            console.log("hided");
                            var start = me.textarea.getComponent().input.dom.selectionStart;
                            var end = me.textarea.getComponent().input.dom.selectionEnd;
                            var formatUrl = this.getFormatUrl();
                            var preSel = me.textarea.getValue().substring(0, start);
                            var postSel = me.textarea.getValue().substring(end, me.textarea.getValue().length);
                            me.textarea.setValue(preSel + formatUrl + postSel);
                        }
                    }
                });
                inputLink.showPreview();
                this.textarea.focus();
            }
        });
        
        this.ulButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-ul',
            cls: 'markdownButton',
            tooltip: 'Unordered List',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 2, start) == "- ") {
                    preSel = this.textarea.getValue().substring(0, start - 2);
                    postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 2;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 2;
                } else {
                    this.textarea.setValue(preSel + "- " + sel + postSel);
                    document.getElementsByName("text")[0].selectionStart = start + 2;
                    document.getElementsByName("text")[0].selectionEnd = end + 2;
                }
            }
        });
        
        this.olButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-ol',
            cls: 'markdownButton',
            tooltip: 'Ordered List',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 3, start) == "1. ") {
                    preSel = this.textarea.getValue().substring(0, start - 3);
                    postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 3;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 3;
                } else {
                    this.textarea.setValue(preSel + "1. " + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 3;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 3;
                }
            }
        });
        
        this.latexButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-script',
            cls: 'markdownButton',
            tooltip: 'LaTeX-Formula',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 2, start) == "$$" && this.textarea.getValue().substring(end, end + 2) == "$$") {
                    preSel = this.textarea.getValue().substring(0, start - 2);
                    postSel = this.textarea.getValue().substring(end + 2, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 2;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 2;
                } else {
                    this.textarea.setValue(preSel + "$$" + sel + "$$" + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 2;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 2;
                }
            }
        });
        
        this.codeButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-code',
            cls: 'markdownButton',
            tooltip: 'Source Code Highlighter',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 1, start) == "`" && this.textarea.getValue().substring(end, end + 1) == "`") {
                    preSel = this.textarea.getValue().substring(0, start - 1);
                    postSel = this.textarea.getValue().substring(end + 1, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 1;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 1;
                } else {
                    this.textarea.setValue(preSel + "`" + sel + "`" + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 1;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 1;
                }
            }
        });
        
        this.quoteButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-quote',
            cls: 'markdownButton',
            tooltip: 'Quotation',
            scope: this,
            handler: function () {
                this.textarea.focus();
                var start = this.textarea.getComponent().input.dom.selectionStart;
                var end = this.textarea.getComponent().input.dom.selectionEnd;
                var sel = this.textarea.getValue().substring(start, end);
                var preSel = this.textarea.getValue().substring(0, start);
                var postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                if (this.textarea.getValue().substring(start - 1, start) == ">") {
                    preSel = this.textarea.getValue().substring(0, start - 1);
                    postSel = this.textarea.getValue().substring(end, this.textarea.getValue().length);
                    this.textarea.setValue(preSel + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start - 1;
                    this.textarea.getComponent().input.dom.selectionEnd = end - 1;
                } else {
                    this.textarea.setValue(preSel + ">" + sel + postSel);
                    this.textarea.getComponent().input.dom.selectionStart = start + 1;
                    this.textarea.getComponent().input.dom.selectionEnd = end + 1;
                }
            }
        });
        
        this.picButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-image',
            cls: 'markdownButton',
            tooltip: 'Picture Upload',
            scope: this,
            handler: function () {
                var me = this;
                var inputLink = Ext.create('ARSnova.view.AddPicturePanel', {
                    name: 'picupload',
                    height: '40%',
                    scope: me,
                    listeners: {
                        hide: function () {
                            console.log("hided");
                            var start = me.textarea.getComponent().input.dom.selectionStart;
                            var end = me.textarea.getComponent().input.dom.selectionEnd;
                            var formatUrl = this.getFormatUrl();
                            var preSel = me.textarea.getValue().substring(0, start);
                            var postSel = me.textarea.getValue().substring(end, me.textarea.getValue().length);
                            me.textarea.setValue(preSel + formatUrl + postSel);
                        }
                    }
                });
            inputLink.showPreview();
            this.textarea.focus();
            }
        });

        this.youtubeButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-youtube',
            cls: 'markdownButton',
            tooltip: 'Embed Video',
            scope: this,
            handler: function () {

            }
        });

        this.vimeoButton = Ext.create('Ext.Button', {
            iconCls: 'icon-editor-vimeo',
            cls: 'markdownButton',
            tooltip: 'Embed Video',
            scope: this,
            handler: function () {

            }
        });

        this.editorPanel = Ext.create('Ext.Panel',{
            padding: '5px 0px 0px 0px',
            minHeight: '60px',
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

	setAreas: function (text) {
		this.textarea=text;
	}
});
