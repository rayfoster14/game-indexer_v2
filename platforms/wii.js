const fs = require('fs');
const xmlConvert = require('xml-js');
var wiiDb = JSON.parse(fs.readFileSync('./data/wiidata.json'))

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
    },
    getDBInfo: async function(file){

        for(var i = 0; i < _db[file.platform].length; i++){
            if(_db[file.platform][i].id == file.header){
                file = { ..._db[file.platform][i], ...file}
            }
        }

        //Now lets get the Wii Controller information!

        for(var i = 0; i < wiiDb.length; i++){
            if(wiiDb[i].id == file.id){
                if(wiiDb[i].input.control){
                    for(var e = 0; e < wiiDb[i].input.control.length; e++){
                        var controls = wiiDb[i].input.control[e];
                        if(controls['@type'] == 'nunchuk') {
                            file.nunchuk = 'Yes'
                            if(controls['@required'] == 'true') file.nunchuk = 'Required'
                        }

                        if(controls['@type'] == 'classiccontroller') {
                            file.classiccontroller = 'Yes'
                            if(controls['@required'] == 'true') file.classiccontroller = 'Required'
                        }

                        if(controls['@type'] == 'gamecube') {
                            file.gamecube = 'Yes'
                            if(controls['@required'] == 'true') file.gamecube = 'Required'
                        }

                        if(controls['@type'] == 'wiimote') {
                            file.wiimote = 'Yes'
                            if(controls['@required'] == 'true') file.wiimote = 'Required'
                        }

                    }
                }
            }
        }
        return file
    },
    
}