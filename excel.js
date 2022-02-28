const xl = require('excel4node');

var convertToCells = function (obj) {
    var lists = {};
    var commonCols = Object.keys(_c.excel.commonCols);

    for (var i = 0; i < platforms.length; i++) {
        var k = platforms[i];
        lists[k] = [
            []
        ];

        var cols = _c.platform[k].extraFields ? commonCols.concat(Object.keys(_c.platform[k].extraFields)) : commonCols;
        var titles = _c.platform[k].extraFields ? {
            ..._c.excel.commonCols,
            ..._c.platform[k].extraFields
        } : _c.excel.commonCols;

        //Pushes Titles to Page
        for (var t = 0; t < cols.length; t++) {
            lists[k][0].push(titles[cols[t]]);
        }

        //Pushes rows to Page
        for (var e = 0; e < obj[k].length; e++) {
            lists[k].push([]);
            var game = obj[k][e];
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
            size: 12,
            name: 'Courier New',
        }
    });

    var ws = {};

    var titleStyle = wb.createStyle({
        font: {
            color: '#FF0800',
            size: 12,
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
        }

        //For each row
        for (var x = 1; x < thisPlatform.length; x++) {

            //For each cell in the row
            for (var y = 0; y < thisPlatform[x].length; y++) {

                //Writes data to cell
                if (typeof thisPlatform[x][y] == 'number') {
                    thisPlatform[x][y] = thisPlatform[x][y] + ""
                };
                typeof thisPlatform[x][y] !== "undefined" ? ws[k].cell(x + 1, y + 1).string(thisPlatform[x][y]) : ws[k].cell(x + 1, y + 1).string('');

                //Sets widths for row
                maxWidth[y] = (typeof thisPlatform[x][y] !== 'undefined' ? thisPlatform[x][y] : "").length > maxWidth[y] ? thisPlatform[x][y].length : maxWidth[y];
                ws[k].column(y + 1).setWidth(maxWidth[y] + 2)
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
        bytes: 0
    };
    for (var i = 0; i < platforms.length; i++) {
        var k = platforms[i];
        var thisPlatform = data[k];
        var thisData = {
            platform: _c.platform[k].title,
            quantity: 0,
            bytes: 0
        };
        for (var e = 0; e < thisPlatform.length; e++) {
            thisData.quantity++;
            thisData.bytes = thisData.bytes + thisPlatform[e].bytes
        }
        reportData.push(thisData);
    }
    for (var i = 0; i < reportData.length; i++) {
        combineData.quantity = combineData.quantity + reportData[i].quantity
        combineData.bytes = combineData.bytes + reportData[i].bytes
    }
    
    returnCells[0] = `Game Dumping Report: ${_f.timeConverter(new Date())}`
    returnCells[1] = `Total Quantity: ${combineData.quantity}`
    returnCells[2] = `Total Size: ${_f.formatBytes(combineData.bytes)}`
    for(var i = 0; i < platforms.length; i++){
        returnCells.push('') //New Line
        returnCells.push(`${reportData[i].platform} Quantity: ${reportData[i].quantity}`)
        returnCells.push(`${reportData[i].platform} Size: ${_f.formatBytes(reportData[i].bytes)}`)
    }
    return returnCells
}
module.exports = {
    writeToExcel: async function(obj)  {
        console.log('Creating games reports...')
        var report = makeReport(obj)
        console.log('Converting game lists to arrays...')
        var lists = convertToCells(obj);
        console.log('Building Excel File...')
        await makeFile({report:report,lists:lists});
    }
}