module.exports = {
    extractData: async function (file) {
        file.headerHighBuffer = ((await _f.readFileBytes(file.path, 'ffc0', 21)))
        file.headerHigh = file.headerHighBuffer.toString().replace(/\u0000/g, "").trim();
        file.headerHighJap = _f.decodeJapaneseHeader(file.headerHighBuffer).replace(/\u0000/g, "").trim()

        file.headerLowBuffer = ((await _f.readFileBytes(file.path, '7fc0', 21)))
        file.headerLow = file.headerLowBuffer.toString().replace(/\u0000/g, "").trim();
        file.headerLowJap = _f.decodeJapaneseHeader(file.headerLowBuffer).replace(/\u0000/g, "").trim();
        return file
    },
    getDBInfo: async function(file){
        for(var i = 0; i < _db[file.platform].length; i++){
            if(_db[file.platform][i].id == file.headerHigh){
                file.header = file.headerHigh
                return { ..._db[file.platform][i], ...file}
            }else if(_db[file.platform][i].id == file.headerLow){
                file.header = file.headerLow
                return { ..._db[file.platform][i], ...file}
            }else if(_db[file.platform][i].id == file.headerHighJap){
                file.header = file.headerHigh
                return { ..._db[file.platform][i], ...file}
            }else if(_db[file.platform][i].id == file.headerLowJap){
                file.header = file.headerLow
                return { ..._db[file.platform][i], ...file}
            }
        }
        file.header = 'NOT FOUND'
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