'use strict';

var EventEmitter = require('events').EventEmitter;
var SerialPort = require('serialport');

class EnoceanListener extends EventEmitter {
    constructor(config, isParse) {
        super();

        this.serialPort = new SerialPort(
            config.port,
            {
                baudrate: config.baudrate,
                stopBits: config.stopBits,
                dataBits: config.dataBits,
                parity: config.parity
            },
            err => {
                if (err)
                    console.log(`error: ${err}`);
            });

        this.tmp = null;
        
        this.serialPort.on('open', () => {
            if (!isParse) {
                this.serialPort.on('data', data => this.emit('raw', new Buffer(data)));
            } else {
                this.serialPort.on('data', this.onData.bind(this));
            }
            
        });
    }

    onData(data) {
        this.emit('raw', data);

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
            this.tmp = '';
            let totalExpectedLength = calcExpectedLength(buf);
            if (totalExpectedLength && (buf.length === totalExpectedLength)) {
                this.parseEnocean(buf);
            } else {
                this.tmp = data;
            }
        } else {
            if (this.tmp != null) {
                this.tmp = Buffer.concat([this.tmp, data]);
                buf = new Buffer(this.tmp);
                let totalExpectedLength = calcExpectedLength(buf);
                if (totalExpectedLength && (buf.length === totalExpectedLength)) {
                    this.parseEnocean(buf);
                }
            }
        }
    }

    parseEnocean(pkt) {
        let packet = {
            raw: pkt,
            szData : pkt.readUInt16BE(1),
            szOptData : pkt.readUInt8(3),
            pktType : pkt.readUInt8(4),
            crc : pkt.readUInt8(5),
            crcBody : pkt.readUInt8(pkt.length - 1)
        };
        
        this.emit('packet', packet);
    }
};

module.exports = EnoceanListener;