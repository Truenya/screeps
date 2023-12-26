const harvester = require('actionHarvest');
const upgrader = require('actionUpgrader');
const utils = require('utils');
function getEnergy(creep){
    let carry = creep.carry.energy;
    if(carry < creep.carryCapacity && (creep.memory.working === false || creep.memory.working === undefined)){
        // Почему билдеры в других комнатах не могут находиться?
        // Было в начале, переместил в тот кейс, когда ему за ресурсами надо идти.
        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            return;
        }

        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0) || (s.structureType === STRUCTURE_LINK && s.energy > 0)
        });

        if (container === undefined) {
            harvester.run(creep);
            return;
        }

        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
            // utils.routeCreep(creep, container);
            return;
        }
    }

    creep.memory.working = carry !== 0;
}

module.exports = {
    run:function(creep){
        // console.log('builder: ' + creep.memory.action);
        getEnergy(creep);

        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if(utils.isNorm(target)) {
            // utils.routeCreep(creep, target);
            if(creep.build(target) === ERR_NOT_IN_RANGE) creep.moveTo(target);
            return;
        }
        // console.log('builder1: ' + creep.memory.action + target);

        upgrader.run(creep);
    }
};