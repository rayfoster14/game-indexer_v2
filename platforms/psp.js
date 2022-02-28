module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            let list = await _f.readDir(dir + dirList[i]);
            for (var e = 0; e < list.length; e++) {
                var filesplit = list[e].split('.');
                _f.printLine( `${dir}${dirList[i]}/${list[e]}`)
                if (filesplit[filesplit.length - 1] == 'iso' || filesplit[filesplit.length - 1] == 'ISO') {
                    returnlist.push( {
                        path: `${dir}${dirList[i]}/${list[e]}`,
                        file: list[e]
                    })
                }
            }
        }
        return returnlist
    }
}