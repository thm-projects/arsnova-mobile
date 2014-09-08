/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/utils/Ext.util.TaksRunner.js
 - Beschreibung: TaskRunner für periodische Aufgaben
 - Version:      1.0, 01/05/12
 - Autor(en):    Entnommen aus ExtJS
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
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA	02111-1307, USA.
 +--------------------------------------------------------------------------*/
var TaskRunner = function(interval) {
	interval = interval || 10;
	var tasks = [],
	removeQueue = [],
	id = 0,
	running = false,
	debug = false,

	// private
	stopThread = function() {
		running = false;
		clearInterval(id);
		id = 0;
	},

	// private
	startThread = function() {
		if (!running) {
			running = true;
			id = setInterval(runTasks, interval);
		}
	},

	// private
	removeTask = function(t) {
		/*
		 * removeQueue.push(t);
		 */
		Ext.Array.remove(tasks, t);

		if (t.onStop) {
				t.onStop.apply(t.scope || t);
		}
	},

	// private
	runTasks = function() {
		var rqLen = removeQueue.length,
				now = new Date().getTime(),
				i;

		if (rqLen > 0) {
			for (i = 0; i < rqLen; i++) {
				Ext.Array.remove(tasks, removeQueue[i]);
			}
			removeQueue = [];
			if (tasks.length < 1) {
				stopThread();
				return;
			}
		}
		i = 0;
		var t,
				itime,
				rt,
				len = tasks.length;
		for (; i < len; ++i) {
			t = tasks[i];
			itime = now - t.taskRunTime;
			if (t.interval <= itime) {
				rt = t.run.apply(t.scope || t, t.args || [++t.taskRunCount]);
				t.taskRunTime = now;
				if (rt === false || t.taskRunCount === t.repeat) {
					removeTask(t);
					return;
				}
			}
			if (t.duration && t.duration <= (now - t.taskStartTime)) {
				removeTask(t);
			}
		}
	};

	this.start = function(task) {
		if (debug) console.log("starting task: " + task.name);
		if (Ext.Array.contains(tasks, task)) return false;
		tasks.push(task);
		task.taskStartTime = new Date().getTime();
		task.taskRunTime = 0;
		task.taskRunCount = 0;
		startThread();
		return task;
	};

	this.stop = function(task) {
		if (debug) console.log("stopping task: " + task.name);
		removeTask(task);
		return task;
	};

	this.stopAll = function() {
		stopThread();
		for (var i = 0, len = tasks.length; i < len; i++) {
			if (tasks[i].onStop) {
				tasks[i].onStop();
			}
		}
		tasks = [];
		removeQueue = [];
	};

	this.getTasks = function() {
		console.log(tasks);
	};
};
