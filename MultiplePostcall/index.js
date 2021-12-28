const express = require('express');
var bodyParser = require('body-parser');
const app = express();
var server = require('http').Server(app);
var https = require('https');
var _ = require('lodash');
var Promise = require('bluebird');
var EventEmitter = require("events").EventEmitter;
var _body = new EventEmitter();
var _finalSend = new EventEmitter();
 
server.listen(8000, function() {
    console.log('server started on port 8000 ');
});

function HitAPI(offset,streamid,bearertoken) 
{
	var request = require('request');
    console.log("start of testService");
	var clonedData="";
    return new Promise(function(fulfill, reject) 
	{
		var url="https://bots.kore.com/api/1.1/builder/streams/"+streamid+"/analysis?offset="+offset+"&limit=30";
		console.log(url);
		request(
		{
			url: url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'authorization': bearertoken,
			},
			form: {
				"type": "successintent",
				"filters": {
					"from": "2018-04-03T09:36:34.546Z",
					"to": "2018-04-10T09:36:34.546Z"
				},
				"sort": {
					"order": "desc",
					"by": "timestamp"
				}
			}
		},
		function(error, response, body) 
		{
			if (error) {
				console.log('error');
				reject(error);
			} else {
				console.log(response.statusCode+', '+offset);
				fulfill(body);
			}
		});
    });
}
var Thread = {
	sleep: function(ms) {
		var start = Date.now();
		
		while (true) {
			var clock = (Date.now() - start);
			if (clock >= ms) break;
		}
		
	}
};
app.get('/', function(req, res) {
    console.log("Get call - nesbotcopy\n");
    
	var bearertoken = "bearer cBmtP0t7IGNPeY-sP_bbi-SdUTexkO6ds7G25J1oIYX1vaev1hxeIDNyqqAvB1tq";
	var streamid = "st-ff70d01f-7b98-50ad-a999-bafe42a21a8f";
	var clonedData='';
	var queryLength = 100;
	var end = 0;
	
	for(var offset =0;offset<=queryLength;offset+=20)
	{
		var d1 = new Date();
		console.log('start ' + d1.toLocaleTimeString());
		HitAPI(offset,streamid,bearertoken).then(function(quesresp)
		{
			_body.data = quesresp;
			console.log('quesresp: '+quesresp.length);
			_body.emit('update');
		});
	
		Thread.sleep(10000/2);
		
		var d2 = new Date();
		console.log('end ' + d2.toLocaleTimeString()+'\n');	
	}
	_body.on('update', function () 
	{
		end+=20;
		console.log('end : '+end);
		clonedData=clonedData+'@!!!@'+_body.data;
		console.log('update function : ' +_body.data.length,clonedData.length); 
		
		if((end-20)===queryLength)
		{
			console.log('finalSend : '+clonedData.length)
			_finalSend.data=clonedData;
			_finalSend.emit('finalSend');
		}
	});
	_finalSend.on('finalSend', function () 
	{
		console.log('sending : '+clonedData.length);
		var Splitdata = clonedData.split('@!!!@');
		console.log('Splitdata.length : '+Splitdata.length);
		res.send(Splitdata);
	});
});

