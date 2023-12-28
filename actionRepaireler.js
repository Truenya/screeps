const {isNorm} = require("./utils");

module.exports = {
    run:function(creep){
        // console.log('repairer: '+creep.memory.action);
        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            return;
        }

        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
            creep.memory.harvesting = false;
        }

        if (creep.memory.harvesting){
            creep.memory.working = creep.mineEnergy();
            return;
        }

        if(!(creep.carry.energy === 0 || !creep.memory.working)){
            creep.memory.working = creep.doRepair() || creep.doWallsRampartsRepair() || creep.doBuild() || creep.doUpgrade();
            return;
        }
        delete creep.memory.wallID;

        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0) || (s.structureType === STRUCTURE_LINK && s.energy > 0)
        });

        if (!isNorm(container)) {
            creep.memory.working = !creep.mineEnergy();
            return;
        }

        let actRes = creep.withdraw(container, RESOURCE_ENERGY);
        if ( actRes === ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
        } else if(actRes === ERR_NOT_ENOUGH_RESOURCES || actRes === ERR_INVALID_TARGET){
            creep.memory.working = creep.mineEnergy();
        }
    }
};