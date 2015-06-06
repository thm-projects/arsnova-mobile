/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2014 The ARSnova Team
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
Ext.define("ARSnova.controller.QuestionExport", {
    extend: 'Ext.app.Controller',

	filename: function () {
		var filename = 'lectureQuestions' + this.getActualDate() + '.csv';
		return filename;
	},

    exportCsvTemplate: function() {
        var csvColumns = ['QuestionType','questionSubject','Question','Answer 1','Answer 2',
                          'Answer 3','Answer 4','Answer 5','Answer 6','Answer 7','Answer 8',
                          'Right Answer','\n'].toString();

        var csvMulpipleChoice = ['MC','Subject of a question','The question itself',
                                 'The 1st answer (mandatory)','The 2nd answer (mandatory)',
                                 'The 3rd answer (optional)','The 4th answer (optional)',
                                 'The 5th answer (optional)','The 6th answer (optional)',
                                 'The 7th answer (optional)','The 8th answer (optional)',
                                 '"1,2,6"','\n'].toString();

        var csvSingleChoice = ['SC','Subject of a question','The question itself',
                               'The 1st answer (mandatory)','The 2nd answer (mandatory)',
                               'The 3rd answer (optional)','The 4th answer (optional)',
                               'The 5th answer (optional)','The 6th answer (optional)',
                               'The 7th answer (optional)','The 8th answer (optional)',
                               '3','\n'].toString();

        var csvFreeText = ['TXT','Subject of a question','The question itself',
                           '','','','','','','','','','\n'].toString();

        var csvYesNo = ['YN','Subject of a question','The question itself',
                        '','','','','','','','','y'].toString();

        var csvTemplate = csvColumns + csvMulpipleChoice + csvSingleChoice + csvFreeText + csvYesNo;
        this.saveFileOnFileSystem(csvTemplate, this.filename());
    },

    exportCsvFile: function(json) {
        var csv = ARSnova.utils.CsvUtil.jsonToCsv(json);
        this.saveFileOnFileSystem(csv, this.filename());
    },

    getActualDate: function(){
       var d = new Date();
       return ('0' + d.getFullYear()).slice(-2) + '-'
       + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
       + ('0' + d.getDate()).slice(-2) + '-'
       + ('0' + d.getHours()).slice(-2) + '-'
       + ('0' + d.getMinutes()).slice(-2);
    },


    getQuestionType: function(questionTypeModel){
        switch (questionTypeModel){
            case 'mc' : return 'MC';
            case 'abcd' : return 'SC';
            case 'freetext' : return 'TXT';
            case 'yesno' :  return 'YN';
        }
    },

    formatQuestion: function(questionModel){
        var questionTypeModel = questionModel.questionType;
        var rightAnswer ='';
        var question = '{';
            question += '"questionType":' +'"'+this.getQuestionType(questionTypeModel)+'"';
            question += ',"questionSubject":' +'"'+ questionModel.subject+'"';
            question += ',"question":' +'"'+ questionModel.text+'"';

        if(questionTypeModel === 'mc' ||  questionTypeModel === 'abcd'){

            for(var i=0 ; i < questionModel.possibleAnswers.length ; i++){
                question += ',"answer'+(i+1)+'":'+'"'+ questionModel.possibleAnswers[i].text+'"';
                if(questionModel.possibleAnswers[i].correct === true){
                    rightAnswer += (i+1)+',';
                }
            }
            question += ',"RightAnswer":' +'"'+ rightAnswer.slice(0,rightAnswer.length-1)+'"';

        } else if(questionTypeModel === 'yesno'){
            rightAnswer='n';
            if(questionModel.possibleAnswers[0].correct) {
                rightAnswer = 'y';
            }
            question += ',"RightAnswer":' +'"'+ rightAnswer+'"';
        }
        question += '}';

        console.log('end format');
        console.log(question);
        return JSON.parse(question);
    },

    preparseJSONtoCSV: function(records){
        var fileName = localStorage.getItem('shortName')+
                       '-'+sessionStorage.getItem('keyword')+'-'+
                        this.getActualDate();
        var questions = [];
        for (var i=0 ; i < records.length ; i++) {
            questions[i] = this.formatQuestion(records[i].data);
        }
        console.log(records);
        console.log(questions);
        console.log(fileName);

        // csv datei bauen mit ARSnova.utils.CsvUtil.jsonToCsv
        ARSnova.app.getController("SessionExport").saveFileOnFileSystem(JSON.stringify(questions),fileName+'.json');
    },

    saveFileOnFileSystem: function (csv, filename) {
        var blob = new Blob([csv], {type: "application/csv;charset=utf-8"});
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            var a = window.document.createElement('a');
            a.className = "session-export";
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;

            // Append anchor to body.
            document.body.appendChild(a);
            a.click();
        }
        var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
        hTP.animateActiveItem(hTP.mySessionsPanel, {
            type: 'slide',
            direction: 'right',
            duration: 700
        });
        var preparsedQuestion = this.preparseJSONtoCSV(records);
        var csv = ARSnova.utils.CsvUtil.jsonToCsv(preparsedQuestion);
        this.saveFileOnFileSystem(csv, this.filename());
    }

});
