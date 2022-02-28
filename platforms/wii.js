const fs = require('fs')

module.exports = {
        getList: async function (dir) {
            let dirList = await _f.readDir(dir);
            var returnlist = [];
            for (var i = 0; i < dirList.length; i++) {
                var gameList = {
                    rootDir: dir + dirList[i]
                };

                let list = fs.lstatSync(dir + dirList[i]).isDirectory() ? await _f.readDir(dir + dirList[i]) : []
                for (var e = 0; e < list.length; e++) {
                    _f.printLine( `${dir}${dirList[i]}/${list[e]}`)
                    var filesplit = list[e].split('.');
                    if (filesplit[filesplit.length - 1] == 'wbfs') {
                        gameList.path = `${dir}${dirList[i]}/${list[e]}`
                        gameList.file = list[e]
                    }
                }
                if (gameList.path){
                    returnlist.push(gameList)
            }
        }
        return returnlist;
    }
}