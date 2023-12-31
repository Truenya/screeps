const harvester = require('actionHarvest');
// const utils = require("./utils");
// const {isNorm} = require("./utils");

module.exports = {
    run:function(creep){
        //FIXME ALL
        // creep.memory.roomID = 'W58S5';
        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            return;
        }

        if(!creep.room.controller) {
            harvester.run(creep);
            return;
        }

        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
        }

        if(creep.store[RESOURCE_ENERGY] > 0 && creep.memory.working){
            creep.memory.working = creep.doUpgrade();
            return;
        }

        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0
            || (s.structureType === STRUCTURE_LINK && s.energy > 0)
        });
        //
        // if (!isNorm(container)) {
        //     harvester.run(creep);
        //     creep.memory.working = creep.store[RESOURCE_ENERGY] === creep.carryCapacity;
        //     return;
        // }
        // if(!creep.memory.working) {
        //     harvester.run(creep);
        //     creep.memory.working = creep.store[RESOURCE_ENERGY] === creep.carryCapacity;
        //     return;
        // }

        let actRes = creep.withdraw(container, RESOURCE_ENERGY);
        if (actRes === ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
        } else if(actRes === ERR_NOT_ENOUGH_RESOURCES || actRes === ERR_INVALID_TARGET){
            // creep.memory.working = creep.mineEnergy();
            harvester.run(creep);
            creep.memory.working = creep.store[RESOURCE_ENERGY] === creep.carryCapacity;
        }
    }
};