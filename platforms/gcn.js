module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            _f.printLine(`${dir}${dirList[i]}`);
            var gameList = {
                rootDir: dir+dirList[i]
            };
            let list = await _f.readDir(dir+dirList[i]);
                if(list.indexOf('game.iso') !== -1){
                    gameList.path = `${dir}${dirList[i]}/${list[list.indexOf('game.iso')]}`
                    gameList.disc1 = `${dir}${dirList[i]}/${list[list.indexOf('game.iso')]}`
                    gameList.file = list[list.indexOf('game.iso')]
                }
                if(list.indexOf('disc2.iso') !== -1){
                    gameList.disc2 = `${dir}${dirList[i]}/${list[list.indexOf('disc2.iso')]}`
                }
                if(!gameList.path){
                    for(var e = 0; e < list.length; e++){
                        var filesplit = list[e].split('.');
                        if(filesplit[filesplit.length-1] == 'iso'){
                            gameList.path = `${dir}${dirList[i]}/${list[e]}`
                            gameList.disc1 = `${dir}${dirList[i]}/${list[e]}`
                            gameList.file = list[e]
                        }
                    }
                }
                returnlist.push(gameList)
        }
        return returnlist;
    }
}