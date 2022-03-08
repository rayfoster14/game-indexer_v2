const fs = require('fs')
const crc = require('crc');

module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            var gameList = {
                rootDir: dir + dirList[i],
            };
            var stat = fs.lstatSync(dir + dirList[i]);
            if (stat.isFile()) {
                _f.printLine(`${dir}${dirList[i]}`)
                var filesplit = dirList[i].split('.');
                if (filesplit[0] == 'CART' || filesplit[filesplit.length - 1] == 'nes' || filesplit[filesplit.length - 1] == 'NES' || filesplit[filesplit.length - 1] == 'bin' || filesplit[filesplit.length - 1] == 'BIN') {
                    gameList.path = `${dir}${dirList[i]}`
                    gameList.file = dirList[i]
                }
                if (filesplit[0].indexOf("_ENG") !== -1) {
                    gameList.path_ENG = `${dir}${dirList[i]}`
                    gameList.file_ENG = dirList[i]
                    gameList.translated = 'ENG'
                    gameList.language = 'JAP'
                }
                returnlist.push(gameList)
            } else {
                let list = fs.lstatSync(dir + dirList[i]).isDirectory() ? await _f.readDir(dir + dirList[i]) : [];
                for (var e = 0; e < list.length; e++) {
                    _f.printLine(`${dir}${dirList[i]}/${list[e]}`)
                    var filesplit = list[e].split('.');
                    if ((filesplit[0] == 'CART' || filesplit[filesplit.length - 1] == 'nes' || filesplit[filesplit.length - 1] == 'NES') && filesplit[0] !== 'eng') {
                        gameList.path = `${dir}${dirList[i]}/${list[e]}`
                        gameList.file = list[e]
                    }
                    if (filesplit[0] == "eng") {
                        gameList.path_ENG = `${dir}${dirList[i]}/${list[e]}`
                        gameList.file_ENG = list[e]
                        gameList.translated = 'ENG'
                        gameList.language = 'JAP'
                    }
                }
                if(gameList.file){
                    returnlist.push(gameList)
                }
            }
        }
        return returnlist;
    },
    extractData: async function (file) {
        var thisFile = fs.readFileSync(file.path);
        var x = (crc.crc32(thisFile).toString(16)).toUpperCase();
        file.header = x
        file.crc32 = x
        file.id = x;
        if (fs.existsSync(file.rootDir + '/PRG.bin')) {
            var thisPRG = fs.readFileSync(file.rootDir + '/PRG.bin');
            var prgcrc = (crc.crc32(thisPRG).toString(16)).toUpperCase();
            file.prgCRC = prgcrc
        }
        if (fs.existsSync(file.rootDir + '/CHR.bin')) {
            var thisCHR = fs.readFileSync(file.rootDir + '/CHR.bin');
            var chrcrc = (crc.crc32(thisCHR).toString(16)).toUpperCase();
            file.chrCRC = chrcrc
        }
        return file
    },
    getDBInfo: async function (file) {
        for (var i = 0; i < _db.nes.length; i++) {
            var prg = file.prgCRC ? file.prgCRC : "na";
            var chr = file.chrCRC ? file.chrCRC : "na";
            if (_db.nes[i].id == file.header ||
                _db.nes[i].prgrom == file.header ||
                _db.nes[i].chrrom == file.header ||
                _db.nes[i].prgrom == prg ||
                _db.nes[i].chrrom == chr ){
                return {
                    ..._db.nes[i],
                    ...file
                }
            }
        }
        return file
    }
}