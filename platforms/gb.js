const fs = require('fs');
var flags = JSON.parse(fs.readFileSync('./data/gbflags.json'))

module.exports = {
    extractData: async function (file) {

        let flagCGB = ((await _f.readFileBytes(file.path, '143', 1)).toString('hex')).toUpperCase()
        let flagSGB = ((await (_f.readFileBytes(file.path, '146', 1))).toString('hex')).toUpperCase()
        let flagCartType = ((await _f.readFileBytes(file.path, '147', 1)).toString('hex')).toUpperCase()
        let flagRamSize = ((await _f.readFileBytes(file.path, '149', 1)).toString('hex')).toUpperCase()

        file.headerLong = (await _f.readFileBytes(file.path, '0134', 14)).toString().replace(/\u0000/g, "")
        file.headerSmall = (await _f.readFileBytes(file.path, '0134', 11)).toString().replace(/\u0000/g, "")
      
        file.flagCGB = flags.cgb[flagCGB] ? flags.cgb[flagCGB] : "";
        file.flagSGB = flags.sgb[flagSGB] ? flags.sgb[flagSGB] : "";
        file.flagCart = flags.cartType[flagCartType] ? flags.cartType[flagCartType] : "";
        file.flagRamSize = flags.ramSize[flagRamSize] ? flags.ramSize[flagRamSize] : "";

        return file
    },
    getDBInfo: async function(file){
        for(var n = 0; n < _db[file.platform].length; n++){
            if(_db[file.platform][n].id == file.headerLong){
                file.header = file.headerLong
                return { ..._db[file.platform][n], ...file}
            }else if(_db[file.platform][n].id == file.headerSmall){
                file.header = file.headerSmall
                return { ..._db[file.platform][n], ...file}
            }else{
                file.header = file.headerLong
            }
        }
        return file
    },
    extraProcessing: async function(list){
        //Find Patched versions
        var filtlist = [];
        for(var e=0; e < list.length; e++){
            if(list[e].file.indexOf('_ENG') == -1){
                filtlist.push(list[e])
            }
        }
        for(var e=0; e < list.length; e++){
            if(list[e].file.indexOf('_ENG') !== -1){
                for(var u = 0; u < filtlist.length; u++){
                    if(list[e].id == filtlist[u].id){
                        filtlist[u].file_ENG = list[e].file
                        filtlist[u].path_ENG = list[e].path
                        filtlist[u].translated = 'ENG'
                        filtlist[u].language = 'JAP'
                    }
                }
            }
        }
        return filtlist;
    }
}