module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            let list = await _f.readDir(dir + dirList[i]);
            _f.printLine(`${dir}${dirList[i]}/${list[e]}`)
            for (var e = 0; e < list.length; e++) {
                var filesplit = list[e].split('.');
                if ((filesplit[filesplit.length - 1] == 'iso' || filesplit[filesplit.length - 1] == 'ISO') && filesplit[filesplit.length - 2] == "part 00") {
                    returnlist.push({
                        path: `${dir}${dirList[i]}/${list[e]}`,
                        file: list[e],
                        rootDir: `${dir}${dirList[i]}/`
                    })
                }
            }
        }
        return returnlist
    },
    extractData: async function (file) {
        var bytes = await _f.readFileBytes(`${file.rootDir}default.xbe`, '180', 4);
        var headerNumbers = `${(bytes[1]+bytes[0])}`;
        headerNumbers = _f.prependStrings(headerNumbers, 3, '0');

        var headerLetters = `${bytes.toString()[3]}${bytes.toString()[2]}`;
        file.header = `${headerLetters}-${headerNumbers}`
        return file
    }
}