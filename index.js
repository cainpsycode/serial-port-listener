'use strict';

var config = require('./config.json');
var debug = require('debug');
var debugPort1 = debug(config.port1.name);
var debugPort2 = debug(config.port2.name);

var timespan = require('timespan');
var EnoceanListener = require('./listener');

var last = new Date(Date.now());


let listener1 = new EnoceanListener(config.port1, false);
listener1.on('raw', raw => {
	let diff = dateDiff();
	debugPort1(`${diff.totalMilliseconds()} ms: ${raw.toString('hex')}`);
});
// listener1.on('packet', pkt => {
// 	let diff = dateDiff();
// 	debugPort1(`diff: ${diff.totalMilliseconds()} ms. Data: ${pkt.raw.toString('hex')}`);
// 	debugPort1(`  szData: ${pkt.szData}, szOptData:${pkt.szOptData}, type:${pkt.pktType}, crcHeader:${pkt.crc.toString(16)}, crcBody:${pkt.crcBody.toString(16)}`);
// 	debugPort1('  data: ' + pkt.raw.slice(6, 6 + pkt.szData).toString('hex'));
// 	debugPort1('  optData: ' + pkt.raw.slice(6 + pkt.szData, -1).toString('hex'));
// });




let listener2 = new EnoceanListener(config.port2, false);
listener2.on('raw', raw => {
	let diff = dateDiff();
	debugPort2(`${diff.totalMilliseconds()} ms: ${raw.toString('hex')}`);
});
// listener2.on('packet', pkt => {
// 	let diff = dateDiff();
// 	debugPort2(`diff: ${diff.totalMilliseconds()} ms. Data: ${pkt.raw.toString('hex')}`);
// 	debugPort2(`  szData: ${pkt.szData}, szOptData:${pkt.szOptData}, type:${pkt.pktType}, crcHeader:${pkt.crc.toString(16)}, crcBody:${pkt.crcBody.toString(16)}`);
// 	debugPort2('  data: ' + pkt.raw.slice(6, 6 + pkt.szData).toString('hex'));
// 	debugPort2('  optData: ' + pkt.raw.slice(6 + pkt.szData, -1).toString('hex'));
// });


function dateDiff() {
	let now = new Date(Date.now());
	let ts = timespan.fromDates(last, now);
	last = now;
	return ts;
}