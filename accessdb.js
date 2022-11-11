

let go = async function(gameList){
    let database = _c.accessDb;
    let tableName = _c.accessTableName;

    //Thank you el3um4s if you see this, for the wonderful library!
    let table = require('@el3um4s/node-mdb').table;
    let query = require('@el3um4s/node-mdb').query;

    console.log('\nAccess Database Updater'.green)
    let dbData = await table.read({database, table: tableName});
    let schema = (await table.schema({database, table: tableName}));

    console.log('Checking for updates...');
    let keys = Object.keys(gameList);
    let queries = [];
    for(let v = 0; v < keys.length; v++){
        let k = keys[v];
        let platformList = gameList[k];
        for(let g = 0; g < platformList.length; g++){
            let game = platformList[g];

            //Check if game is in the DB already
            let index = dbData.map(function(x){
                if(x.platform === k)  return x.id
            }).indexOf(game.id);

            let thisQuery; 

            //Create a new entry!!
            if(index === -1){
                let cols = [];
                let values = [];
                for(let q = 0; q < schema.length; q++){
                    if(game[schema[q].NAME]){
                        //Jiggery pokery to make SQL query work for MDB file
                        let thisCol = schema[q].NAME;
                        if (thisCol === 'size') thisCol = `[${thisCol}]`
                        cols.push(thisCol);
                        let thisValue = game[schema[q].NAME];

                        if(typeof thisValue === 'string' && thisValue.length > 254) thisValue = thisValue.substring(0,254)

                        if(typeof thisValue === 'string') thisValue = `"${thisValue}"`;
                        
                        values.push(thisValue);
                    }
                }
                thisQuery = `INSERT INTO ${tableName} (${cols.toString()})  VALUES (${values.toString()});  `
            }else{
                let dbGame = dbData[index]
                let setArr = [];
                for(let q = 0; q < schema.length; q++){
                    if(game[schema[q].NAME]){
                        if(dbGame[schema[q].NAME] == game[schema[q].NAME]){
                            //There is a loose match in data
                        } else{
                            //Current data does not match DB
                            let thisCol = schema[q].NAME;
                            if (thisCol === 'size') thisCol = `[${thisCol}]`
                            let thisValue = game[schema[q].NAME];
                            if(typeof thisValue === 'string' && thisValue.length > 254) thisValue = thisValue.substring(0,254)
                            setArr.push(`${thisCol} = "${thisValue}"`)
                        }
                    }
                }
                if(setArr.length !== 0){
                    thisQuery = `UPDATE ${tableName} SET ${setArr.toString()} WHERE TID = ${dbGame.TID};`
                }
            }
        
            if(thisQuery) {
                queries.push(thisQuery);
            }
        }
    }

    if(queries.length !== 0){
        console.log(`Updating ${queries.length} change(s)`.green);
        for(let i = 0; i < queries.length; i++){
            let queryResult = await query.sql({database, sql: queries[i]});
            if (queryResult === '[]') console.log(`Error. This query failed: ${queries[i].blue}`)
        }
        console.log('Complete!\n')
    }else{
        console.log('No changes required!')
    }

    return true;
}


module.exports={
    update:async function(data){
        if(_c.accessDb){
            return await go(data);
        }else{
            console.log('No Access DB file specified in config indexer.accessDb: <string path>')
        }
    }
}