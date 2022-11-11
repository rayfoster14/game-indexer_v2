const inq = require('inquirer');
const fs = require('fs');
const {spawn} = require('child_process');
var extExec = JSON.parse(fs.readFileSync('./exec.json'))

//Addons
const addons = require('./addons.js').define();
var packages =  addons.packages ?? [];

var list = async function (message, choices, returnVal) {
    return new Promise(function (resolve, reject) {
        inq.prompt([{
            type: 'list',
            name: 'list',
            message: message,
            choices: choices
        }]).then(function (res) {
            if (returnVal == 'index') {
                resolve(choices.indexOf(res.list));
            } else if (returnVal == 'text') {
                resolve(rest.list)
            } else {
                resolve(res)
            }
        })
    })
};

var main = async function () {
    var optionArr = packages.map(function (x) {
        return x.title;
    });
    optionArr = optionArr.concat(extExec.map(function (x) {
        return x.name
    }))
    var option = await list('Which program?', optionArr, 'index');
    if (packages[option]) {
        await packages[option].run();
    } else {
        var a = extExec[option - (packages.length)];
        var child = spawn('cmd.exe', ['/c', 'cd /d ' + a.directory + ' && ' + a.exec], {
            detached: true,
            stdio: 'ignore'
        })
    }
}
console.log('    ____                _          ______                           \r\n   \/ __ \\ ____ _ __  __( )_____   \/ ____\/____ _ ____ ___   ___      \r\n  \/ \/_\/ \/\/ __ `\/\/ \/ \/ \/|\/\/ ___\/  \/ \/ __ \/ __ `\/\/ __ `__ \\ \/ _ \\     \r\n \/ _, _\/\/ \/_\/ \/\/ \/_\/ \/  (__  )  \/ \/_\/ \/\/ \/_\/ \/\/ \/ \/ \/ \/ \/\/  __\/     \r\n\/_\/ |_| \\__,_\/ \\__, \/  \/____\/   \\____\/ \\__,_\/\/_\/ \/_\/ \/_\/ \\___\/      \r\n              \/____\/                                                \r\n               ______               __                              \r\n              \/_  __\/____   ____   \/ \/_____                         \r\n               \/ \/  \/ __ \\ \/ __ \\ \/ \/\/ ___\/                         \r\n              \/ \/  \/ \/_\/ \/\/ \/_\/ \/\/ \/(__  )                          \r\n             \/_\/   \\____\/ \\____\/\/_\/\/____\/                           \r\n                                               ')
main()