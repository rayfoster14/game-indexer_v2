module.exports = {
    getDBInfo: async function(file){
        for(var i = 0; i < _db[file.platform].length; i++){
            var s = file.header.split('-');
            var newHeader = `${s[0]}${s[1]}`
            if(_db[file.platform][i].id == newHeader){
                return { ..._db[file.platform][i], ...file}
            }
        }
        return file
    },
}