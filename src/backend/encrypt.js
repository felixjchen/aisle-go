const crypto = require('crypto');

class crypting {
    constructor (string);
    encrypt = () => {
        crypto.createHash('sha256').update(string).digest('hex');
    } 

}

module.exports = (string ) => 
    function (string) {return new crypting( arg1,arg2,arg3 )}



