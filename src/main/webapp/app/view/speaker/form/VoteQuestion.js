/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.form.VoteQuestion', {
	extend: 'ARSnova.view.speaker.form.SchoolQuestion',

	config: {
		maxAnswers: 5,
		wording: [
			Messages.EVALUATION_PLUSPLUS,
			Messages.EVALUATION_PLUS,
			Messages.EVALUATION_NEUTRAL,
			Messages.EVALUATION_MINUS,
			Messages.EVALUATION_MINUSMINUS
		]
	},

	constructor: function () {
		this.callParent(arguments);
		this.sliderComponents = [];
		var questionValueFieldset = null;

		questionValueFieldset = Ext.create('Ext.form.FieldSet', {
			title: Messages.ANSWER_POINTS,
			hidden: true
		});

		var questionValueOptions = {
			minValue: -10,
			maxValue: 10,
			value: 0,
			increment: 1
		};

		for (var i = 0; i < this.getMaxAnswers(); i++) {
			this.sliderComponents.push(Ext.create("ARSnova.view.CustomSliderField", Ext.apply(questionValueOptions, {
				label: (i + 1) + '. '
			})));
		}

		questionValueFieldset.add(this.sliderComponents);

		this.on('painted', function () {
			var features = ARSnova.app.getController('Feature').getActiveFeatures();
			questionValueFieldset.setHidden(!features.learningProgress);
		});

		this.add([{
			xtype: 'formpanel',
			scrollable: null,
			items: [questionValueFieldset]
		}]);
	},

	initWithQuestion: function (question) {
		this.callParent(arguments);

		for (var i = 0; i < question.possibleAnswers.length; i++) {
			this.sliderComponents[i].setSliderValue(question.possibleAnswers[i].value);
		}
	},

	getValues: function () {
		return this.fields.map(function (item, index) {
			return {
				text: item.getValue(),
				correct: false,
				value: this.sliderComponents[index].getSliderValue()
			};
		}, this);
	}
});
