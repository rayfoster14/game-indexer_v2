const fs = require('fs');
const progbar = require('cli-progress');
const standard = require('./platforms/standard.js');
const excel = require('./excel.js');
const access = require('./accessdb.js');
var priceListFile = './addon-scripts/scrape-prices/prices';
var metaFile = './addon-scripts/meta-data/metaData';


global._f = require('./functions.js')

if(!fs.existsSync('config.json')){
    console.log('Config file cannot be found!\nCreating new one...\n')
    _f.createConfig();
}

if(!fs.existsSync('./data/db.json')){
    console.log('Database JSON not found! Configuring...')
    _f.decryptDB();
}

global._p = {};
global._c = JSON.parse(fs.readFileSync('config.json')).indexer
global._db = JSON.parse(fs.readFileSync('./data/db.json'));
global.platforms = !_c.dev[0] ? Object.keys(_c.platform) : _c.dev[1];
global.standard = require(`./platforms/standard.js`);

//Specialised requirements per platform
_p.gb =  require(('./platforms/gb.js'));
_p.ds3 =  require(('./platforms/ds3.js'));
_p.gcn =  require(('./platforms/gcn.js'));
_p.nes =  require(('./platforms/nes.js'));
_p.ps1 =  require(('./platforms/ps1.js'));
_p.ps2 =  require(('./platforms/ps2.js'));
_p.ps3 =  require(('./platforms/ps3.js'));
_p.psp =  require(('./platforms/psp.js'));
_p.snes =  require(('./platforms/snes.js'));
_p.wii =  require(('./platforms/wii.js'));
_p.wiiu =  require(('./platforms/wiiu.js'));
_p.xbox =  require(('./platforms/xbox.js'));
_p.xbox360 =  require(('./platforms/xbox360.js'));
_p.gba = {};
_p.nds = {};
_p.n64 = {};


var bar = function(title){
    return {format:` [{bar}] | {percentage}% | {value}/{total} | ${title}`}
}

var main = async function(){
    //Gets file lists
    var romList = {};
    console.log('Reading Files...')
    for(var i = 0; i < platforms.length; i++){
        var k = platforms[i];
        console.log('')
        _f.printLine(`Reading ${_c.platform[k].title}...`)
        var platformdir = `${_c.directories.rootRoms}${_c.platform[k].directory}/`;
        romList[k] = _p[k].getList ? await _p[k].getList(platformdir): await standard.getList(platformdir,_c.platform[k].fileTypes);
        _f.printLine(`Completed ${_c.platform[k].title}`)
    }

    //Get file size
    var romListInfo = {};
    console.log('\n\nMeasuring file sizes...');
    for(var i = 0; i < platforms.length; i++){
        var k = platforms[i];

        bar(_c.platform[k].title)
        var sizeBar = new progbar.SingleBar(bar(_c.platform[k].title), progbar.Presets.rect);
        sizeBar.start(romList[k].length, 0);

        romListInfo[k] = [];
        for(var f = 0; f < romList[k].length; f++){
            var file = romList[k][f];
            file.platform = k;
            romListInfo[k].push(_p[k].getSize ? await _p[k].getSize(file) : await standard.getSize(file))

            sizeBar.update(f+1);
        }
        sizeBar.stop();
    }

    //Extract file data
    console.log('\nReading file data...')
    for(var i = 0; i < platforms.length; i++){
        var k = platforms[i];
        
        var readBar = new progbar.SingleBar(bar(_c.platform[k].title), progbar.Presets.rect);
        readBar.start(romListInfo[k].length, 0);

        for(var f = 0; f < romListInfo[k].length; f++){
            var file = romListInfo[k][f];
            romListInfo[k][f] = _p[k].extractData ? await _p[k].extractData(file): await standard.extractData(file, _c.platform[k].header);

            readBar.update(f+1);
        }
        readBar.stop();
    }

    //Get DB info
    console.log('\nMatching up with database...')
    for(var i = 0; i < platforms.length; i++){
        var k = platforms[i];

        var dbBar = new progbar.SingleBar(bar(_c.platform[k].title), progbar.Presets.rect);
        dbBar.start(romListInfo[k].length, 0);

        for(var f = 0; f < romListInfo[k].length; f++){
            var file = romListInfo[k][f];
            romListInfo[k][f] = _p[k].getDBInfo ? await _p[k].getDBInfo(file) : await standard.getDBInfo(file);

            dbBar.update(f+1)
        }
        dbBar.stop();
    }
    //Extra processing required?
    console.log('\nExtra processing functions...')
    for(var i = 0; i < platforms.length; i++){
        var k = platforms[i];
        if(_c.platform[k]){
            if(_c.platform[k].extraFields){
                if(_c.platform[k].extraFields.path_ENG){
                    console.log(`Filtering Translation Patches for ${_c.platform[k].title}...`)
                    //Find English Version
                    var filtlist = [];
                    for(var e=0; e < romListInfo[k].length; e++){
                        if(romListInfo[k][e].file.indexOf('_ENG') == -1){
                            filtlist.push(romListInfo[k][e])
                        }
                    }
                    for(var e=0; e < romListInfo[k].length; e++){
                        if(romListInfo[k][e].file.indexOf('_ENG') !== -1){
                            for(var u = 0; u < filtlist.length; u++){
                                if(romListInfo[k][e].id == filtlist[u].id){

                                    filtlist[u].file_ENG = romListInfo[k][e].file
                                    filtlist[u].path_ENG = romListInfo[k][e].path
                                    filtlist[u].translated = 'ENG'
                                    filtlist[u].language = 'JAP'
                                }
                            }
                        }
                    }
                    romListInfo[k] = filtlist;
                }
            }
        }
        if(_p[k].extraProcessing){
            console.log(`Final touches for ${_c.platform[k].title}...`)
            romListInfo[k] = await _p[k].extraProcessing(romListInfo[k])
        }
    }

    if(fs.existsSync(priceListFile)){
        var prices = JSON.parse(fs.readFileSync(priceListFile));
        console.log('Price List found! Extracting data...')
        for(var i = 0; i < platforms.length; i++){
            var k = platforms[i];
            for(var e = 0; e < romListInfo[k].length; e++){
                var g = romListInfo[k][e];
                if(prices[k]){
                    if(prices[k][g.header]){
                        var v = prices[k][g.header]
                        romListInfo[k][e].loosePrice = Number(v.used.replace(/[^0-9\.-]+/g,""))
                        romListInfo[k][e].boxedPrice = Number(v.complete.replace(/[^0-9\.-]+/g,""));
                        romListInfo[k][e].sealedPrice = (v.new)? Number(v.new.replace(/[^0-9\.-]+/g,"")):0;
                        romListInfo[k][e].priceUrl = v.url
                    }
            }
            }
        }
    }

    if(fs.existsSync(metaFile)){
        var meta = JSON.parse(fs.readFileSync(metaFile));
        console.log('Meta data found! Extracting data...')
        for(var i = 0; i < platforms.length; i++){
            var k = platforms[i];
            for(var e = 0; e < romListInfo[k].length; e++){
                var g = romListInfo[k][e];

                //Sets Default Value
                if(meta.defaults[k]){
                    if(meta.defaults[k].state){
                        if(meta.defaults[k].state == 'Boxed'){
                           romListInfo[k][e].price = romListInfo[k][e].boxedPrice
                        }else {
                             romListInfo[k][e].price = romListInfo[k][e].loosePrice
                        }
                    }
                }

                if(meta[k]){
                    if(meta[k][g.header]){
                        romListInfo[k][e]= {...romListInfo[k][e],... meta[k][g.header]}
                        if(romListInfo[k][e].state){
                            if(romListInfo[k][e].state == 'Boxed'){
                                romListInfo[k][e].price = romListInfo[k][e].boxedPrice
                            }else if(romListInfo[k][e].state == 'Sealed'){
                                romListInfo[k][e].price = romListInfo[k][e].sealedPrice
                            }else{
                               romListInfo[k][e].price = romListInfo[k][e].loosePrice
                            }
                        }

                        if(romListInfo[k][e].booklet){
                            if(romListInfo[k][e].booklet == 'Missing'){
                                if(romListInfo[k][e].price) romListInfo[k][e].price = Number((romListInfo[k][e].price * 0.75).toFixed(2))
                            }
                        }
                        if(romListInfo[k][e].conditionLabel){
                            if(romListInfo[k][e].conditionLabel !== 'Perfect'){
                                 if(romListInfo[k][e].price) romListInfo[k][e].price = Number((romListInfo[k][e].price * 0.5).toFixed(2))
                            }
                        }
                        if(romListInfo[k][e].possession){
                            if(romListInfo[k][e].possession == 'No'){
                                if(romListInfo[k][e].price) romListInfo[k][e].price = undefined  
                            }
                        }
                    }
            }
            }
        }
    }
    //Alphabetises the records
    console.log('\nAlphabetising Records...')
    for(var i = 0; i < platforms.length; i++){
        romListInfo[platforms[i]].sort(function(a,b){
            a.title ? a.title : '';
            b.title ? b.title : '';
            a.header ? a.header : '';
            b.header ? b.header : '';
            if(a.title && b.title){
                return a.title.localeCompare(b.title)
            }else{
                return a.header.localeCompare(b.header)
            }
        });
    }

    //Creates Reports
    console.log('\nCreating JSON export...')
    fs.writeFileSync('games.json',JSON.stringify(romListInfo))

    await access.update(romListInfo);

    excel.writeToExcel(romListInfo);
    console.log('\nCompleted Game Scan Report.')

}




module.exports={
    run:function(){
        console.log(`
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
G a m e   I n d e x e r   v 2
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
`)
        main()
    },
    title:'Index Games'

}

