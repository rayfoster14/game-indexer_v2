const fs = require('fs');
module.exports = {
    getList: async function (dir) {
        let dirList = await _f.readDir(dir);
        var returnlist = [];
        for (var i = 0; i < dirList.length; i++) {
            let firstLevel = await _f.readDir(dir + dirList[i]);
            //Dir will be something like 00004000
            if(await _f.checkFileOrDir(`${dir}${dirList[i]}/${firstLevel[0]}`)){
                var nextDir = firstLevel[0];
                let list = await _f.readDir(`${dir}${dirList[i]}/${nextDir}`);

                var thisRecord = {
                    rootDir: `${dir}${dirList[i]}/`,
                   /* disc1:"",
                    disc2:"",
                    disc3:"",*/
                }

                var discNum = 1;

                //We have multiple discs
                for (var e = 0; e < list.length; e++) {
                   _f.printLine(`${dir}${dirList[i]}/${nextDir}/${list[e]}`)
                    if(! await _f.checkFileOrDir(`${dir}${dirList[i]}/${nextDir}/${list[e]}`)){
                        if(!thisRecord.path){
                            thisRecord.path= `${dir}${dirList[i]}/${nextDir}/${list[e]}`;
                            thisRecord.file= list[e];
                            thisRecord.disc1= `${dir}${dirList[i]}/${nextDir}/${list[e]}`
                        }else{
                            discNum++
                            thisRecord[`disc${discNum}`] = `${dir}${dirList[i]}/${nextDir}/${list[e]}`;
                        }
                    }
                }

                if(thisRecord.path){
                returnlist.push(thisRecord)
                }
            }
          
        }
        return returnlist
    },
    extractData: async function (file) {
        file.header = (await _f.readFileBytes(`${file.path}`, '0360', 4)).toString('hex');
        return file
    }
}