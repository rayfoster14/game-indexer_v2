const xl = require('excel4node');
var fs = require('fs');

var meta = undefined;
if(fs.existsSync('./metaConfig.json')){
    meta = JSON.parse(fs.readFileSync('./metaConfig.json'))
}


var convertToCells = function (obj) {
    var lists = {};
    var commonCols = Object.keys(_c.excel.commonCols);
    var priceCols = Object.keys(_c.excel.priceCols);

    for (var i = 0; i < platforms.length; i++) {
        var k = platforms[i];
        lists[k] = [
            []
        ];

        var metaList = {};
        if(meta){
            
            for(var c = 0; c < obj[k].length; c++){
                var game = obj[k][c];
                var gameKeys = Object.keys(game);
                for(var d = 0; d < gameKeys.length; d++){
                    if(meta[gameKeys[d]]) {
                        metaList[gameKeys[d]] = meta[gameKeys[d]].text 
                    }
                }
            }
        }
        var metaKeys = Object.keys(metaList);
        var cols = _c.platform[k].extraFields ? commonCols.concat(Object.keys(_c.platform[k].extraFields)) : commonCols;
        if (metaKeys.length !== 0) cols = cols.concat(metaKeys);
        cols = cols.concat(priceCols)

        if(!_c.platform[k].extraFields) _c.platform[k].extraFields = {}

        var titles = {
            ..._c.excel.commonCols,
            ..._c.platform[k].extraFields,
            ... metaList,
            ..._c.excel.priceCols
        }

        //Pushes Titles to Page
        for (var t = 0; t < cols.length; t++) {
            lists[k][0].push(titles[cols[t]]);
        }

        //Pushes rows to Page
        for (var e = 0; e < obj[k].length; e++) {
            lists[k].push([]);
            var game = obj[k][e];

            //Pushes column to row
            for (var c = 0; c < cols.length; c++) {
                lists[k][e + 1].push(game[cols[c]])
            }
        }


    }
    return lists;

}


var makeFile = async function (makeData) {

    var lists = makeData.lists;
    var report = makeData.report;

    var wb = new xl.Workbook({
        defaultFont: {
           // size: 12,
            //name: 'Courier New',
           // name:'Cascadia Mono ExtraLight'
           name: 'Consolas',
           size: 8
        }
    });

    var ws = {};

    var titleStyle = wb.createStyle({
        font: {
            color: '#FF0800',
            size: 8,
            bold: true,
            name: 'Small Fonts'
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
    });

    //Front Page
    ws.report = wb.addWorksheet('Report');
    for(var i = 0; i < report.length; i++){
        ws.report.cell(i+2,2).string(report[i]).style(i==0?titleStyle:{})
    }

    //Starts Platform Processing
    for (var i = 0; i < platforms.length; i++) {
        var k = platforms[i]
        var thisPlatform = lists[k]
        ws[k] = wb.addWorksheet(k.toUpperCase());

        var maxWidth = [];

        //Top row cells (titles + initalise width)
        for (var c = 0; c < thisPlatform[0].length; c++) {
            maxWidth.push(0)
            ws[k].cell(1, c + 1).string(thisPlatform[0][c]).style(titleStyle)

            maxWidth[c] = thisPlatform[0][c].length
        }

        //For each row
        for (var x = 1; x < thisPlatform.length; x++) {

            //For each cell in the row
            for (var y = 0; y < thisPlatform[x].length; y++) {

                //Writes data to cell
                if (typeof thisPlatform[x][y] == 'number') {
                    ws[k].cell(x + 1, y + 1).number(thisPlatform[x][y])
                }else{
                    thisPlatform[x][y] ? ws[k].cell(x + 1, y + 1).string(thisPlatform[x][y]) : ws[k].cell(x + 1, y + 1).string('');
                }

                //Sets widths for row
                maxWidth[y] = (thisPlatform[x][y] ? thisPlatform[x][y]+"" : "").length > maxWidth[y] ? (thisPlatform[x][y]+"").length : maxWidth[y];
                ws[k].column(y + 1).setWidth(maxWidth[y] + 1)
            }
        }
    }

    var filePath = `${_c.directories.rootRoms}${_c.excel.file}`
    console.log(`Writing Excel File to ${filePath}`)
    await wb.write(filePath);
    return true;
}

var makeReport = function (data) {
    var returnCells = [];
    var reportData = [];
    var combineData = {
        quantity: 0,
        bytes: 0,
        estVal:0,
    };
    for (var i = 0; i < platforms.length; i++) {
        var k = platforms[i];
        var thisPlatform = data[k];
        var thisData = {
            platform: _c.platform[k].title,
            quantity: 0,
            bytes: 0,
            estVal:0,
        };
        for (var e = 0; e < thisPlatform.length; e++) {
            thisData.quantity++;
            thisData.bytes = thisData.bytes + thisPlatform[e].bytes
            thisData.estVal += thisPlatform[e].price?thisPlatform[e].price:0;
        }
        reportData.push(thisData);
    }
    for (var i = 0; i < reportData.length; i++) {
        combineData.quantity = combineData.quantity + reportData[i].quantity
        combineData.bytes = combineData.bytes + reportData[i].bytes
        combineData.estVal += reportData[i].estVal
    }
    
    returnCells[0] = `Game Dumping Report: ${_f.timeConverter(new Date())}`
    returnCells[1] = `Total Quantity: ${combineData.quantity}`
    returnCells[2] = `Total Size: ${_f.formatBytes(combineData.bytes)}`
    returnCells[2] = `Total Est. Value: £${combineData.estVal.toFixed(2)}`

    for(var i = 0; i < platforms.length; i++){
        returnCells.push('') //New Line
        returnCells.push('-------------------------------------')
        returnCells.push(`${reportData[i].platform}`)
        returnCells.push(`Quantity: ${reportData[i].quantity}`)
        returnCells.push(`Size: ${_f.formatBytes(reportData[i].bytes)}`)
        returnCells.push(`Est. Value:	 £${reportData[i].estVal.toFixed(2)}`);
    }
    return returnCells
}
module.exports = {
    writeToExcel: async function(obj)  {
        console.log('\nSpreadsheet Reporter'.green)
        console.log('Creating games reports...')
        var report = makeReport(obj)
        console.log('Converting game lists to arrays...')
        var lists = convertToCells(obj);
        console.log('Building Excel File...')
        await makeFile({report:report,lists:lists});
    }
}