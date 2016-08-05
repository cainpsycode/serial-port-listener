'use strict';

var SerialPort = require('serialport');
var debug = require('debug')('serialport');

var config = require('./config.json');

this.serialPort = new SerialPort(config.port, { baudrate: config.baudrate });
this.serialPort.on('open', () => {
    this.serialPort.on('data', data => {
        debug('data %s', data.toString('hex'));
    });
});