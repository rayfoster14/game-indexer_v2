
module.exports={
    define: function(){
        //* * * * * * *  A D D O N S * * * * * * * */
        //           Define Addons here

        global._dirs = {
            
        }

        var packages = [
            require('./indexer.js'),

        ]
        /* * * * * * * * * * * * * * * * * * * * * */

        return{packages}
    }
}