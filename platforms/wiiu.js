const fs = require('fs');
module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            let list = await _f.readDir(dir + dirList[i]);
            var appRoute = false;

            //Checks for Plan 1...
            for (var e = 0; e < list.length; e++) {
                if (list[e] == 'content') {
                    // This is not a WUX file... needs plan 2
                    appRoute = true
                    break;
                }
                var filesplit = list[e].split('.');
                _f.printLine(`${thisDir}/${list[e]}`)
                if (filesplit[filesplit.length - 1] == 'wux' || filesplit[filesplit.length - 1] == 'WUX') {
                    var thisDir = `${dir}/${dirList[i]}`
                    returnlist.push({
                        path: `${thisDir}/${list[e]}`,
                        file: list[e],
                        rootDir: thisDir,
                        keysExist: {
                            gkey: fs.existsSync(`${thisDir}/game.key`),
                            ckey: fs.existsSync(`${thisDir}/common.key`)
                        }
                    })
                }
            }

            //Plan 2! Let's get the RPX file!
            if (appRoute) {
                let list = await _f.readDir(`${dir}${dirList[i]}/code/`);
                for (var e = 0; e < list.length; e++) {
                    _f.printLine(`${thisDir}/${list[e]}`)
                    var filesplit = list[e].split('.');
                    if (filesplit[filesplit.length - 1] == 'rpx' || filesplit[filesplit.length - 1] == 'RPX') {
                        var thisDir = `${dir}/${dirList[i]}`
                        returnlist.push({
                            path: `${thisDir}/code/${list[e]}`,
                            file: list[e],
                            appVer: true,
                            rootDir: thisDir,
                            keysExist: {
                                gkey: false,
                                ckey: false
                            }
                        })
                    }
                }
            }
        }
        return returnlist
    },
    extractData: async function (file, h) {
        if (!file.appVer) {
            //WUX files
            file.header = (await _f.readFileBytes(file.path, '2f0006', 4)).toString();
            file.gKey = file.keysExist.gkey ? (await _f.readFileBytes(`${file.rootDir}/game.key`, '00', 16)).toString('hex') : "no";
            file.cKey = file.keysExist.ckey ? (await _f.readFileBytes(`${file.rootDir}/common.key`, '00', 16)).toString('hex') : "no";
        } else {
            //App Version
            file.header = (await _f.readFileBytes(`${file.rootDir}/meta/meta.xml`, 'b3', 4)).toString()
        }
        return file;
    },
    getDBInfo: async function (file) {
        for (var i = 0; i < _db[file.platform].length; i++) {
            if (_db[file.platform][i].id.indexOf(file.header) !== -1) {
                return {
                    ..._db[file.platform][i],
                    ...file
                }
            }
        }
        return file
    },
}