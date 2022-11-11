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
main()