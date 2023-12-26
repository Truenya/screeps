const harvester = require('actionHarvest');
const upgrader = require('actionUpgrader');
// const utils = require('utils');

module.exports = {
    run:function(creep){
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

        if (carry === 0){
            creep.memory.working = false;
            return;
        }

        creep.memory.working = true;
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(!target) {
            upgrader.run(creep);
            return;
        }

        if(creep.build(target) === ERR_NOT_IN_RANGE) {
            // utils.routeCreep(creep, target);
            creep.moveTo(target);
        }
    }
};