
class Block{

    contstructor(index, time, data,previous){
        this.hash = this.hashing
        this.index = index;
        this.timestamp = time;
        this.data = data;
        this.previous = prevHash
        
    }

    hashing =  () => {
        const hashit = this.index + this.prevHash + this.time + JSON.stringify(this.data);
        const encrypt = require('./encrypt')(hashit)
    }
}

module.exports = Block;