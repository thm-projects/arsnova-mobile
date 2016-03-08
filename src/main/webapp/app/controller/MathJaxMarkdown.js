/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define("ARSnova.controller.MathJaxMarkdown", {
	extend: 'Ext.app.Controller',

	launch: function () {
		var me = this;
		me.initializeMarkdown();
	},

	/**
	 * initializes mathjax if feature is activated in configuration
	 */
	initializeMathJax: function () {
		var config = ARSnova.app.globalConfig;

		if (config.features.mathJax && !window.MathJax) {
			var head = document.getElementsByTagName("head")[0], script;
			var mathJaxSrc = config.mathJaxSrc || "//cdn.mathjax.org/mathjax/2.4-latest/MathJax.js";

			window.MathJax = {
				jax: ["input/TeX", "output/HTML-CSS"],
				extensions: ["tex2jax.js", "Safe.js"],
				TeX: {
					extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"]
				},
				tex2jax: {
					inlineMath: [['\\(', '\\)'], ['\[\[', '\]\]']],
					displayMath: [['$$', '$$'], ['\\[', '\\]']],
					processEscapes: true,
					preview: 'none'
				},
				messageStyle: 'none',
				showProcessingMessages: false,
				showMathMenu: false
			};

			script = document.createElement("script");
			script.type = "text/javascript";
			script.src = mathJaxSrc;
			head.appendChild(script);
		}
	},

	/**
	 * initializes markdown if feature is activated in configuration
	 */
	initializeMarkdown: function () {
		var markedRenderer = marked.Renderer;

		this.defaultHyperLinkRenderer = markedRenderer.prototype.link;
		this.defaultImageRenderer = markedRenderer.prototype.image;

		markedRenderer.prototype.link = this.hyperlinkRenderer;
		markedRenderer.prototype.image = this.imageRenderer;

		marked.setOptions({
			highlight: this.highlightRenderer,
			sanitize: true
		});

		this.lexer = new marked.Lexer();
		this.lexer.rules.heading = /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/;
	},

	/**
	 * parse markdown content to html
	 */
	markdownToHtml: function (content) {
		return marked.parser(this.lexer.lex(content));
	},

	/**
	 * customized highlight function for markdown renderer
	 */
	highlightRenderer: function (code) {
		var controller = ARSnova.app.getController('MathJaxMarkdown');

		if (hljs && !controller.hideMediaElements) {
			return "<pre class='hljs-pre'><code class='hljs-highlight'>" +
				hljs.highlightAuto(code).value + "</code></pre>";
		} else {
			var dummy = controller.hideMediaDummy.replace(/@@@/, 'code');
			return dummy.replace(/###/, 'codeListingIcon');
		}
	},

	/**
	 * customized image function for markdown renderer
	 */
	imageRenderer: function (href, title, text) {
		var controller = ARSnova.app.getController('MathJaxMarkdown');
		var isVideoElement = href.indexOf('://i.vimeocdn') > -1 || href.indexOf('://img.youtube') > -1;
		var size = '', alignment = 'center';

		if (title && !isVideoElement && !controller.hideMediaElements) {
			size = title.split('x');
			size[0] = Ext.isNumber(parseInt(size[0])) ? size[0] + 'px;' : 'initial;';
			size[1] = Ext.isNumber(parseInt(size[1])) ? size[1] + 'px;' : 'initial;';
			alignment = size[2] ? size[2] : alignment;

			size = size[1] && size[1] !== 'inital;' ?
				'"max-width:' + size[0] + 'max-height:' + size[1] + '"' :
				'"max-width:' + size[0] + '"';

			return '<div style="text-align:' + alignment + '">' +
				'<img class="resizeableImage" title="' + text + '" src="' + href + '" alt="' + text + '" style=' + size + '>' +
			'</div>';
		}

		if (controller.hideMediaElements && !isVideoElement) {
			var dummy = controller.hideMediaDummy.replace(/@@@/, 'image');
			return dummy.replace(/###/, 'imageIcon');
		} else {
			return '<img class="resizeableImage" title="' + text + '" src="' + href + '" alt="' + text + '">';
		}
	},

	/**
	 * customized link function for markdown renderer
	 */
	hyperlinkRenderer: function (href, title, text) {
		var controller = ARSnova.app.getController('MathJaxMarkdown');
		var titleDelimiter = /^.*alt="([^"]*)/;
		var content = text;

		var youtubeDelimiters = {
			accessKey: 'youtube',
			videoURI: 'https://www.youtube.com/embed/',
			elementDel: /<img[^<>]*(img.youtube\.com\/vi)[^<>]*>/,
			videoIdDel: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/,
			titleDel: titleDelimiter
		};

		var vimeoDelimiters = {
			accessKey: 'vimeo',
			videoURI: 'https://player.vimeo.com/video/',
			elementDel: /<img[^<>]*(vimeo)[^<>]*>/,
			videoIdDel: /^.*(vimeo\.com\/video)\/?([0-9]+)/,
			titleDel: titleDelimiter
		};

		var videoElementReplace = function (content, delimiters) {
			return content.replace(delimiters.elementDel, function (element) {
				var videoId = delimiters.accessKey === 'youtube' ?
					href.match(delimiters.videoIdDel)[7] :
					href.match(delimiters.videoIdDel)[2];

				if (controller.hideMediaElements) {
					var dummy = controller.hideMediaDummy.replace(/@@@/, delimiters.accessKey);
					return dummy.replace(/###/, delimiters.accessKey + 'Icon');
				} else {
					var title = element.match(delimiters.titleDel)[1];
					return '<p class="videoImageParagraph"><a class="hyperlink" href="' + delimiters.videoURI
						+ videoId + '"><span class="videoImageContainer" id="' + videoId + '" accesskey="'
						+ delimiters.accessKey + '" title="' + title + '">' + text + '</span></a></p>';
				}
			});
		};

		content = videoElementReplace(content, youtubeDelimiters);
		content = videoElementReplace(content, vimeoDelimiters);

		if (text === content) {
			if (controller.hideMediaElements) {
				content = controller.hideMediaDummy.replace(/@@@/, 'hyperlink');
				content.replace(/###/, 'hyperlinkIcon');
			} else {
				content = controller.defaultHyperLinkRenderer.call(marked, href, title, text);
				content = content.slice(0, 3) + 'class="hyperlink" ' + content.slice(3, content.length);
			}
		}

		return content;
	}
});
