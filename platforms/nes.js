const fs = require('fs')
const crc = require('crc');

module.exports={   
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {

            var gameList = {
                rootDir: dir + dirList[i],
                title: dirList[i],
            };
            let list = fs.lstatSync(dir + dirList[i]).isDirectory() ? await _f.readDir(dir + dirList[i]) : [];

            for (var e = 0; e < list.length; e++) {

                _f.printLine(`${dir}${dirList[i]}/${list[e]}`)
                var filesplit = list[e].split('.');
                if(filesplit[0] == 'CART' ){
                    gameList.path = `${dir}${dirList[i]}/${list[e]}`
                    gameList.file = list[e]
                }
                if(filesplit[0] == "eng"){
                    gameList.path_ENG = `${dir}${dirList[i]}/${list[e]}`
                    gameList.file_ENG = list[e]
                    gameList.translated = 'ENG'
                    gameList.language = 'JAP'
                }
            }

            returnlist.push(gameList)
        }
        return returnlist;
    },
    extractData: async function (file){
           var thisFile = fs.readFileSync(file.path);
           var x = crc.crc32(thisFile).toString(16)
           file.header = x
           file.crc32=x
           file.id = x;
           return file
    },
    getDBInfo: async function(file){
        //We get tile from folder for now...
return file
    }

    }
