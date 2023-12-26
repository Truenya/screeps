const lorry = require('actionLorry');
const {isNorm} = require("./utils");

module.exports = {
    run:function(creep){
        const carry = creep.store[RESOURCE_ENERGY];
        if(carry < creep.store.getCapacity()){
            creep.memory.action ='lorry';
            lorry.findAndGetEnergy(creep);
            return;
        }

        if(carry===0){
            return;
        }

        let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity
        });

        if (!isNorm(structure)){
            lorry.run(creep);
            return;
        }

        creep.memory.action ='transferToTower';
        let action = creep.transfer(structure, RESOURCE_ENERGY);
        if ( action === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure);
        }
        else if(action === ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.working = false;
        }
    }
};