/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Autor(en):    Christoph Thelen <christoph.thelen@mni.thm.de>
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
Ext.define('ARSnova.view.speaker.form.YesNoQuestion', {
	extend: 'Ext.Container',
	
	config: {
		textYes: Messages.YES,
		textNo: Messages.NO,
		textNone: Messages.NONE,
		
		/**
		 * Which button should be pressed initially? 'yes', 'no', or 'none'
		 */
		pressed: 'none'
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.yesButton = Ext.create('Ext.Button', {
			text: this.getTextYes(),
			pressed: this.getPressed() === 'yes'
		});
		
		this.noButton = Ext.create('Ext.Button', {
			text: this.getTextNo(),
			pressed: this.getPressed() === 'no'
		});
		
		this.noneButton = Ext.create('Ext.Button', {
			text: this.getTextNone(),
			pressed: this.getPressed() === 'none'
		});
		
		this.segmentedButton = Ext.create('Ext.SegmentedButton', {
			xtype: 'segmentedbutton',
			style: {
				maxWidth: '500px',
				width: '80%',
				margin: 'auto'
			},
			defaults: {
				style: 'width: 33%'
			},
			items: [this.yesButton, this.noButton, this.noneButton],
			listeners: {
				scope: this,
				toggle: function(container, button, pressed) {
					if (pressed) {
						if (button === this.yesButton) {
							this.setPressed('yes');
						} else if (button === this.noButton) {
							this.setPressed('no');
						} else {
							this.setPressed('none');
						}
					}
				}
			}
		});
		
		this.add([{
			xtype: 'fieldset',
			title: Messages.CORRECT_ANSWER,
			items: [this.segmentedButton]
		}]);
	},
	
	initWithPossibleAnswers: function(possibleAnswers) {
		// We will have 2 or 3 answers, depending on an 'abstention' value
		if (possibleAnswers.length !== 2 && possibleAnswers.length !== 3) {
			return;
		}
		
		// We assume that the possibleAnswers are laid out exactly as 'yes' and 'no'
		[this.yesButton, this.noButton].forEach(function(button, index) {
			button.setText(possibleAnswers[index].text);
		});
		// Press the 'correct' button
		this.segmentedButton.setPressedButtons(possibleAnswers.map(function(answer, index) {
			return answer.correct ? index : null;
		}));
		// Still no button pressed? Select the 'none' button...
		if (this.segmentedButton.getPressedButtons().length === 0) {
			this.segmentedButton.setPressedButtons([2]);
		}
	},
	
	getQuestionValues: function() {
		var result = {};
		
		var yesAnswer = { text: this.yesButton.getText(), correct: false };
		var noAnswer = { text: this.noButton.getText(), correct: false };
		
		switch (this.getPressed()) {
			case "yes":
				yesAnswer.correct = true;
				break;
			case "no":
				noAnswer.correct = true;
				break;
			default:
				result.noCorrect = true;
				break;
		}
		result.possibleAnswers = [yesAnswer, noAnswer];
		
		return result;
	}
});
