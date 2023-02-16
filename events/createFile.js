const event = require('events');
const fs = require('fs');
let eventEmitter = new event.EventEmitter();

eventEmitter.on('createFile', function (params) {
    fs.appendFile(`files/${params.file}.txt`, params.message, error => {
        if (error) return console.log(error);
    })
});

module.exports = eventEmitter;
