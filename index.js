'use strict';

var SerialPort = require('serialport');
var debugRaw = require('debug')('serialport:raw');
var debugHeader = require('debug')('serialport:header');
var debugData = require('debug')('serialport:data');
var debugOptData = require('debug')('serialport:optD');
	

var config = require('./config.json');

var splitTimeout = 100;

this.serialPort = new SerialPort(config.port, { 
    baudrate: config.baudrate,
    stopBits: config.stopBits,
    dataBits: config.dataBits,
    parity: config.parity 
});

var tmp = null;
this.serialPort.on('open', () => this.serialPort.on('data', onData.bind(this)));

function onData(data) {
    let calcExpectedLength = buf => {
					if (buf.length >= 4) {
						let dataLength = (buf[1] << 8) | buf[2];
						let optionalLength = buf[3];
						return 1 + 6 + dataLength + optionalLength; // SYNC_BYTE + HEADER_LENGTH + DATA + OPT_DATA
					}
				};

				// when recieving data from the serialport, we dont receive complete telegrams, but jsut chuck of them.
				let buf = new Buffer(data);
				if (buf[0] === 0x55) {
					tmp = '';
					let totalExpectedLength = calcExpectedLength(buf);
					if (totalExpectedLength && (buf.length === totalExpectedLength)) {
						receive(buf);
					} else {
						tmp = data;
					}
				} else {
					if (tmp != null) {
						tmp = Buffer.concat([tmp, data]);
						buf = new Buffer(tmp);
						let totalExpectedLength = calcExpectedLength(buf);
						if (totalExpectedLength && (buf.length === totalExpectedLength)) {
							receive(buf);
						}
					}
				}
}

function receive(packet) {
    debugRaw(packet);
    parseEnocean(packet);
}

function parseEnocean(buf) {
    let szData = buf.readUInt16BE(1);
    let szOptData = buf.readUInt8(3);
    let pktType = buf.readUInt8(4);
    let crc = buf.readUInt8(5);
    let crcBody = buf.readUInt8(buf.length - 1);
    debugHeader(`data:${szData}, optData:${szOptData}, type:${pktType}, crcHeader:${crc.toString(16)}, crcBody:${crcBody.toString(16)}`);
    debugData(buf.slice(6, 6 + szData).toString('hex'));
    debugOptData(buf.slice(6 + szData, -1).toString('hex'));
}
