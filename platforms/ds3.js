module.exports = {
    extractData: async function (file, h) {
        x = (await _f.readFileBytes(file.path, '0108', 4)).toString('hex');
        file.header="00040000"
        for(var i = 4; i > 0; i--){
            file.header += `${x[i*2-2]}${x[i*2-1]}`.toUpperCase();
        }
        return file;
    }
}