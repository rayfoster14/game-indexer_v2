module.exports = {
    getList: async function (dir,types) {
        let list = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < list.length; i++) {
            _f.printLine(`${dir}${list[i]}`);
            if (types.includes(list[i].split('.')[(list[i].split('.')).length - 1])) {
                returnlist.push({
                    file: list[i],
                    path: `${dir}${list[i]}`
                })
            }
        }
        return returnlist;
    },
    getSize: async function (file) {
        if(_c.platform[file.platform].sizeFromDir){
            file.bytes = await _f.readDirSize(file.rootDir);
            file.size = _f.formatBytes(file.bytes);
        } else {
            file.bytes = await _f.readFileSize(file.path);
            file.size = _f.formatBytes(file.bytes);
        }
        return file;
    },
    getDBInfo: async function(file){
        for(var i = 0; i < _db[file.platform].length; i++){
            if(_db[file.platform][i].id == file.header){
                return { ..._db[file.platform][i], ...file}
            }
        }
        return file
    },
    extractData: async function(file, h){
        file.header = (await _f.readFileBytes(file.path, h.address, h.bytes)).toString()
        return file;
    }
}