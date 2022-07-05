const fs = require('fs');
const du = require('du');
var shiftjis = require('shiftjis');
const rl = require('readline-sync');
const crypto = require('crypto');
const { off } = require('process');



var parseAddressToInt = function (address) {
    return parseInt(Number("0x" + address), 10);
}


module.exports = {
    checkFileOrDir: async function (path) {
        //true is dir
        return fs.lstatSync(path).isDirectory()
    },
    readDir: async function (dir) {
        return fs.readdirSync(dir);
    },
    readFileSize: async function (file) {
        return fs.statSync(file).size
    },
    readDirSize: async function (dir) {
        return await du(dir)
    },
    formatBytes: function (bytes, decimals = 3) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    injectCharIntoString: function (str, index, stringToAdd) {
        return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
    },
    prependStrings: function (str, length, fillerStr) {
        var x = str;
        for (y = 0; y < length; y++) {
            if (x.length < length) {
                x = `${fillerStr}${x}`
            }
        }
        return x;
    },
    printLine(str) {
        //replaces current line on log with new text
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(str);
    },
    readFileBytes: async function (path, address, length) {
        var a = typeof address == "string" ? parseAddressToInt(address) : address;
        var stream = fs.createReadStream(path, {
            start: a,
            end: (a + length) - 1
        });
        return new Promise(function (resolve) {
            stream.on("data", function (chunk) {
                resolve(chunk)
            });
        });
    },
    readBigFileBytes: async function (path, start, end) {
        var stream = fs.createReadStream(path, {
            start: start,
            end: end,
            encoding: 'utf8'
            //highWaterMark: 5
        });
        x = "";
        for await (const data of stream) {
            x += (data)
        }
        return x
        /*return new Promise(function (resolve) {
              stream.on("data", function (chunk) {
                  resolve(chunk)
              });
          });*/
    },
    timeConverter: function (UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        return `${date}.${month}.${year} ${hour}:${min}:${sec}`
    },
    decodeJapaneseHeader(buffer) {
        return shiftjis.decode(buffer)
    },
    fillInZeros: function(str){
        //If a hex string is smaller than 8, prepend zeros...
        var length = str.length;
        do{
            if(length < 8)str = '0'+str;
            length = str.length;
        }while(length < 8)
        return str;
    },
    createConfig() {
        var newConfig = {
            indexer:{
                directories:{},
                platform:{},
                excel:{
                    commonCols:{
                        title:'Title',
                        file:'File',
                        size:'Size',
                        path:'Path',
                        bytes:'Bytes',
                        header:'ID'
                    }
                },
                dev:[false,[]]
            }
        };

        var ask = function (question, example) {
            console.log(`\n${question}`);
            console.log(`Example: ${example}`)
            return rl.question('Answer: ');
        }

        var defaultPlatform = {
            gb: {
                title: "Gameboy (Color)",
                fileTypes: [
                    "GB",
                    "gb",
                    "SGB",
                    "sgb",
                    "GBC",
                    "gbc"
                ],
                extraFields: {
                    flagCGB: "GBC Compatiblity",
                    flagSGB: "SGB Compatiblity",
                    flagCart: "Cart Type",
                    flagRamSize: "RAM Size",
                    path_ENG: "English Patch"
                }
            },
            gba: {
                title: "GameBoy Advance",
                fileTypes: [
                    "gba",
                    "GBA"
                ],
                header: {
                    address: "00ac",
                    bytes: 4
                }
            },
            nds: {
                title: "Nintendo DS",
                fileTypes: [
                    "nds",
                    "NDS"
                ],
                header: {
                    address: "000c",
                    bytes: 4
                }
            },
            ds3: {
                title: "Nintendo 3DS",
                fileTypes: [
                    "3ds",
                    "3DS"
                ],
                header: {
                    address: "0108",
                    bytes: 8
                }
            },
            nes: {
                title: "Nintendo Entertainment Sys",
                fileTypes: [
                    "nes",
                    "bin"
                ],
                extraFields: {
                    path_ENG: "English Patch",
                    crc32: "CRC32",
                    prgCRC:"PRG",
                    chrCRC:"CHR",
                    pcb_map:"Mapper",
                    type:"Region"
                }
            },
            snes: {
                title: "Super Nintendo",
                fileTypes: [
                    "sfc",
                    "SFC"
                ],
                extraFields: {
                    path_ENG: "English Patch"
                }
            },
            n64: {
                title: "Nintendo 64",
                fileTypes: [
                    "z64",
                    "Z64"
                ],
                header: {
                    address: "003b",
                    bytes: 4
                }
            },
            gcn: {
                title: "Gamecube",
                sizeFromDir: true,
                header: {
                    address: "0000",
                    bytes: 6
                },
                extraFields: {
                    disc2: "Disc 2"
                }
            },
            wii: {
                title: "Wii",
                sizeFromDir: true,
                header: {
                    address: "0200",
                    bytes: 6
                }
            },
            wiiu: {
                title: "Wii U",
                sizeFromDir: true,
                directory: "Wii U"
            },
            ps1: {
                title: "PlayStation",
                sizeFromDir: true,
                fileTypes: [
                    "bin",
                    "BIN"
                ],
                extraFields: {
                    disc2: "Disc 2",
                    disc3: "Disc 3"
                }
            },
            ps2: {
                title: "PlayStation 2",
                fileTypes: [
                    "ISO",
                    "iso"
                ],
                extraFields: {
                    disc2: "Disc 2"
                }
            },
            ps3: {
                title: "PlayStation 3",
                fileTypes: [
                    "iso",
                    "ISO"
                ],
                header: {
                    address: "0810",
                    bytes: 10
                }
            },
            psp: {
                title: "PlayStation Portable",
                fileTypes: [
                    "iso",
                    "ISO"
                ],
                sizeFromDirs: true,
                header: {
                    address: "8373",
                    bytes: 10
                }
            },
            xbox: {
                sizeFromDir: true,
                title: "XBOX",
            },
            xbox360: {
                title: "XBOX 360",
                sizeFromDir: true,
                extraFields: {
                    disc2: "Disc 2",
                    disc3: "Disc 3"
                }
            }
        };
        
        newConfig.indexer.directories.rootRoms = ask('Path to root directory of roms?', 'Z:/Games/');
        newConfig.indexer.excel.file = ask('Name of excel file to export', 'report.xlsx');

        console.log('Configure platforms to index. Type [y] to set up.');
        var newPlatformList = Object.keys(defaultPlatform);
        for (var p = 0; p < newPlatformList.length; p++){
            var platform = defaultPlatform[newPlatformList[p]];
            var thisPlatformBool = rl.keyInYN(`${platform.title}? `)
            if(thisPlatformBool){
                platform.directory = ask(`Define directory from ${newConfig.indexer.directories.rootRoms} to ${platform.title} game folder.`, 'NES Games');
                newConfig.indexer.platform[newPlatformList[p]] = platform
            }
        }

        console.log('Exporting Config File...');
        fs.writeFileSync('config.json',JSON.stringify(newConfig));
        return true
    },
    decryptDB: async function(){
        if(!fs.existsSync('./data/db')){
            console.log('Please redownload source from repo.');
            return 0;
        }
        var a = crypto.createDecipher('aes-256-cbc','38522a');
       var c = fs.readFileSync('./data/db').toString('utf8')
        var b = a.update(c,'hex','utf8');
        b += a.final('utf8');
        await fs.writeFileSync('./data/db.json', b);
        return 'done';
    }
}