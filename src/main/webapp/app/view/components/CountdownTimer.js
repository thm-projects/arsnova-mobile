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

Ext.define('ARSnova.view.components.CountdownTimer', {
	extend: 'Ext.Component',
	xtype: 'countdown',

	template: [{
		reference: 'canvas',
		tag: 'canvas',
		id: 'countdown-timer',
		classList: [Ext.baseCSSPrefix + 'countdown-timer']
	}, {
		reference: 'sliderContainer',
		tag: 'div'
	}],

	config: {
		title: 'timer',
		cls: 'countdownTimerContainer',
		scrollable: false,
		width: 260,
		height: 260,

		viewOnly: false,
		onTimerStart: Ext.emptyFn,
		onTimerStop: Ext.emptyFn,
		startStopScope: this,

		defaultMinutes: 2,
		defaultSeconds: 60,
		sliderDefaultValue: 2,
		sliderMinValue: 1,
		sliderMaxValue: 10,

		showAnimation: {
			type: "pop"
		},

		hideAnimation: {
			type: "fadeOut"
		}
	},

	milliseconds: 1000,
	msTillUpdate: 100,
	running: false,

	initialize: function () {
		this.callParent(arguments);
		this.viewOnly = this.config.viewOnly;

		this.on('painted', function () {
			if (!this.starttime && !this.endtime) {
				this.initializeTimeValues();
			}
		});

		this.on('hide', function () {
			this.stop();
		});

		if (!this.viewOnly) {
			this.initializeSlider();
		} else {
			this.setStyle({
				position: 'absolute',
				right: 0,
				top: 0,
				opacity: 0.75,
				pointerEvents: 'none'
			});

			this.canvas.setStyle({
				opacity: 0.75
			});
		}
	},

	initializeSlider: function () {
		this.slider = Ext.create('Ext.field.Slider', {
			width: this.getWidth() - 25,
			value: this.getSliderDefaultValue(),
			minValue: this.getSliderMinValue(),
			maxValue: this.getSliderMaxValue(),
			renderTo: this.sliderContainer
		});

		this.slider.getComponent().on({
			scope: this,
			change: 'onSliderChange',
			dragstart: 'onSliderDragStart',
			drag: 'onSliderDrag',
			dragend: 'onSliderDragEnd'
		});
	},

	onSliderChange: function (me, thumb, newValue, oldValue) {
		this.initializeTimeValues(newValue);
		this.fireEvent('change', this, thumb, newValue, oldValue);
	},

	onSliderDragStart: function (me, thumb, newValue, oldValue) {
		this.fireEvent('dragstart', this, thumb, newValue, oldValue);
	},

	onSliderDrag: function (me, thumb, newValue, oldValue) {
		this.initializeTimeValues(newValue);
		this.fireEvent('drag', this, thumb, newValue, oldValue);
	},

	onSliderDragEnd: function (me, thumb, newValue, oldValue) {
		this.fireEvent('dragend', this, thumb, newValue, oldValue);
	},

	initializeTimeValues: function (mins, secs) {
		if (!this.viewOnly) {
			this.setDefaultMinutes(this.slider.getValue());
		}

		if (!mins) {
			mins = this.getDefaultMinutes();
		}

		if (!secs) {
			secs = this.getDefaultSeconds();
		}

		this.maxSeconds = this.seconds = secs * this.milliseconds;
		this.maxMinutes = this.minutes = mins * this.maxSeconds;
		this.showTimer();
	},

	start: function (startTime, endTime) {
		var me = this;

		me.setHidden(false);
		startTime = parseInt(startTime);
		endTime = parseInt(endTime);

		if (!this.viewOnly) {
			this.slider.hide();
			this.slider.disable();
		}

		if (startTime && endTime) {
			var minutes = ((endTime - startTime) / 60) / 1000;
			this.initializeTimeValues(minutes);
			this.starttime = startTime - parseInt(sessionStorage.getItem("serverTimeDiff"));
		} else {
			this.starttime = new Date().getTime();
		}

		this.endtime = this.starttime + this.minutes;

		if (this.minutes > 0) {
			this.showTimer();
			this.running = true;
			setTimeout(function () {
				me.update(me);
			}, this.msTillUpdate);

			this.getOnTimerStart().call(this.getStartStopScope());
		}
	},

	stop: function () {
		clearTimeout(this.update);
		this.running = false;

		this.initializeTimeValues();
		this.showTimer();

		if (!this.viewOnly) {
			this.slider.show();
			this.slider.enable();
		}

		this.getOnTimerStop().call(this.getStartStopScope());
	},

	update: function (panel) {
		var me = panel;

		if (!me.running) {
			return;
		}

		var time = new Date().getTime();

		me.minutes = me.endtime - time;
		me.seconds = me.minutes - Math.floor(me.minutes / me.maxSeconds) * me.maxSeconds;

		if (me.seconds === 0) {
			if (me.minutes > 0) {
				me.seconds = me.maxSeconds;
			}
		}

		me.showTimer();

		if (me.running) {
			if (me.minutes > 0) {
				setTimeout(function () {
					me.update(me);
				}, me.msTillUpdate);
			} else {
				me.stop();
			}
		}
	},

	showTimer: function () {
		if (this.canvas) {
			var canvas = this.canvas.dom;
			var context = canvas.getContext("2d");
			var counterClockwise = false;

			canvas.width = this.getWidth();
			canvas.height = this.getHeight() - 40;

			var x = canvas.width / 2;
			var y = canvas.height / 2;
			var radius = 85;

			var startAngle = 0 * Math.PI;
			var endAngle = (2 * Math.PI) / (this.maxMinutes / this.minutes);
			var minutes = Math.ceil(this.minutes / this.maxSeconds);

			context.save();
			context.clearRect(0, 0, 600, 600);

			context.fillStyle = "#4a5c66";
			context.font = "50px Segoe UI";
			context.textAlign = "center";
			context.textBaseline = "middle";

			if (minutes > 1) {
				context.fillText(minutes.toString(), x, y - 10);
				context.font = "20px Segoe UI";
				context.fillText(Messages.MINUTES, x, y + 20);
			} else if (minutes > 0) {
				var seconds = Math.ceil(this.seconds / this.milliseconds);
				context.fillText(seconds.toString(), x, y - 10);
				context.font = "20px Segoe UI";
				context.fillText(Messages.SECONDS, x, y + 20);
			} else {
				context.fillText(0, x, y - 10);
				context.font = "20px Segoe UI";
				context.fillText(Messages.SECONDS, x, y + 20);
			}

			context.translate(x, y);
			context.rotate(-Math.PI / 2);
			context.translate(-x, -y);

			if (this.minutes > 0) {
				context.beginPath();
				context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
				context.lineWidth = 20;
				context.strokeStyle = "#4A5C66";
				context.stroke();
			} else {
				context.beginPath();
				context.arc(x, y, radius, 0 * Math.PI, 2 * Math.PI, counterClockwise);
				context.lineWidth = 25;
				context.strokeStyle = "#971B2F";
				context.stroke();
			}

			radius = 66;
			startAngle = 0 * Math.PI;
			endAngle = ((2 * Math.PI) / (this.maxSeconds / this.seconds));

			if (this.minutes > 0) {
				context.beginPath();
				context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
				context.lineWidth = 20;
				context.strokeStyle = "#F2A900";
				context.stroke();
			}

			context.restore();
		}
	}
});
