var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');

var DefaultPlugin = require(__dirname + '/../DefaultPlugin').Plugin;

function FuransuiExport(options) {
	this.help = {
		name: 'FuransuiExport',
		description: 'Exports as plaintext',
		options: {
			outputFile: 'File name format for output files, placeholders: %date%',
			dateFormat: 'Date format to use'
		}
	}

	this.options = _.extend({
		outputFile: '%date%.txt',
		dateFormat: 'YYYYMMDD'
	}, options);
}

FuransuiExport.prototype = Object.create(DefaultPlugin.prototype);

FuransuiExport.prototype.exportDay = function exportDay(day, cb) {
	var text = 'time,event\n';

	if(!day.segments){
		cb('Day ' + day.date + ' seems to have no segments')
		return;
	}

	day.segments.forEach(function(segment) {

	   
		var start = moment(segment.startTime, 'YYYYMMDDTHHmmssZ');
		var end = moment(segment.endTime, 'YYYYMMDDTHHmmssZ');

		if(segment.type == 'place') {
			text += start.format('YYYY.MM.DD HH:mm') + ',at ' + segment.place.name + ' for ' + end.diff(start, 'minutes') +  'min.\n';
			return;
		}

		if(segment.type == 'move' && Array.isArray(segment.activities)) {
			segment.activities.forEach(function(activity) {

			    start = moment(activity.startTime, 'YYYYMMDDTHHmmssZ');
			    end = moment(activity.endTime, 'YYYYMMDDTHHmmssZ');

			    //if(activity.activity != 'trp') {
				text += start.format('YYYY.MM.DD HH:mm') + ',' + activity.activity + ' for ' + activity.duration + ' seconds (' + activity.distance + 'm)\n';
			    //}
			});
		}
	});

	fs.writeFile(this.getFilename(day.date), text, function(err) {
		if(err) {
			cb(err);
			return;
		}

		cb(null, day.date);
	});
}


exports.Plugin = FuransuiExport;
