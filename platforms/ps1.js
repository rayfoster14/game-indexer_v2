const fs = require('fs')
module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            var gameList = {
                rootDir: dir + dirList[i]
            };
            var binaryList = [];
            let list = fs.lstatSync(dir + dirList[i]).isDirectory() ? await _f.readDir(dir + dirList[i]) : [];
            for (var e = 0; e < list.length; e++) {
                _f.printLine(`${dir}${dirList[i]}/${list[e]}`)
                var filesplit = list[e].split('.');
                if (filesplit[filesplit.length - 1] == 'bin' || filesplit[filesplit.length - 1] == 'BIN' || filesplit[filesplit.length - 1] == 'img' || filesplit[filesplit.length - 1] == 'IMG' || filesplit[filesplit.length - 1] == 'ecm' || filesplit[filesplit.length - 1] == 'ECM') {
                    binaryList.push(list[e])
                }
            }
            for (var e = 0; e < binaryList.length; e++) {
                discNo = `disc${e+1}`;
                gameList[discNo] = `${dir}${dirList[i]}/${binaryList[e]}`;
                if (e == 0) {
                    gameList.path = `${dir}${dirList[i]}/${binaryList[e]}`
                    gameList.file = binaryList[e]
                }
            }

            returnlist.push(gameList)
        }
        return returnlist;
    },
    extractData: async function (file) {

        let bytes = file.path ? (await _f.readBigFileBytes(file.path, 0, 1000000)) : "";
        var header = ""

        let demo;
        //Demo disks
        if (bytes.indexOf('SLED') !== -1) {
            var index = bytes.indexOf('SLED');
            for (var e = 0; e < 12; e++) {
                header += bytes[index + e]
            }
            demo = true;
        }
        if (bytes.indexOf('SCED') !== -1) {
            var index = bytes.indexOf('SCED');
            for (var e = 0; e < 12; e++) {
                header += bytes[index + e]
            }
            demo = true;
        }

        //Finds and stores Header information
        //make !demo more elegant at some point in the future...
        if(!demo){
            if (bytes.indexOf('SCES') !== -1) {
                var index = bytes.indexOf('SCES');
                for (var e = 0; e < 12; e++) {
                    header += bytes[index + e]
                }
            }
            if (bytes.indexOf('SLES') !== -1) {
                var index = bytes.indexOf('SLES');
                for (var e = 0; e < 12; e++) {
                    header += bytes[index + e]
                }
            }
        }
    
        //Standardises header code
        header = header.replace('_', '-').replace('.', "").replace(';', "").trim();
        header = header.length == 9 ? _f.injectCharIntoString(header, 4, '-') : header

        file.header = header;
        return file
    }
}