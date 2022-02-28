module.exports={
    extractData: async function (file) {
    
        let bytes = file.path ? (await _f.readBigFileBytes(file.path, 0, 5000000)): "";

        var findHeader = function(occurance){
            var header = ""
            //Finds and stores Header information
            if(bytes.indexOf('SCES', bytes.indexOf('SCES')+occurance) !== -1){
                var index = bytes.indexOf('SCES',  bytes.indexOf('SCES')+occurance);
                for(var e = 0; e < 12; e++){
                    header+=bytes[index+e]
                }
            }else if(bytes.indexOf('SLES',  bytes.indexOf('SLES')+occurance) !== -1){
                var index = bytes.indexOf('SLES',  bytes.indexOf('SLES')+occurance);
                for(var e = 0; e < 12; e++){
                    header+=bytes[index+e]
                }
            }else if(bytes.indexOf('SLPS',  bytes.indexOf('SLPS')+occurance) !== -1){
                    var index = bytes.indexOf('SLPS',  bytes.indexOf('SLPS')+occurance);
                    for(var e = 0; e < 12; e++){
                        header+=bytes[index+e]
                    }
            }else{
                header = "NOTFOUND"
            }

            //Standardises header code
            header = header.replace('_','-').replace('.',"").replace(';',"").trim();
            header = header.length == 9 ? _f.injectCharIntoString(header,4,'-') : header;

            return header
        }

        returnHeader = findHeader(0);
        returnHeader[4] !== '-' ? returnHeader = findHeader(1): returnHeader;
        file.header = returnHeader;
        return file
    },
    getDBInfo: async function(file){
        for(var i = 0; i < _db[file.platform].length; i++){
            if(_db[file.platform][i].id == file.header){
                return { ..._db[file.platform][i], ...file}
            }
        }
        return file
    },


    extraProcessing: async function(list){
        //We're here to discover Disc 2s...
        var newList = [];
        for(var e = 0; e < list.length; e++){
            var idNum = parseInt(list[e].header.split('-')[1]);
            var prefix = list[e].header.split('-')[0];
            var filterRes = list.filter(z => z.header === `${prefix}-${idNum-1}`)
            //Making Assumptions: Disc2 follows id number incrementally and has the first number of the ID as 8
            if(filterRes.length > 0 && `${idNum}`[0] == 8){
                var entry = filterRes[0];
                var disc2 = list[e];
                var newBytes = entry.bytes+disc2.bytes
                entry.disc1 = entry.path;
                entry.disc2 = disc2.path;
                entry.header2 = disc2.header;
                entry.bytes = newBytes;
                entry.size = _f.formatBytes(newBytes);
                newList.push(entry)
            }
        }
        for(var e = 0; e < list.length; e++){
            var filter1 = newList.filter(z => (z.header === list[e].header))
            var filter2 = newList.filter(z => (z.header2 === list[e].header))
            if(filter1.length == 0 && filter2.length == 0){
                list[e].disc1 = list[e].path
                newList.push(list[e]);
            }
        }
        return newList;
    }
}
