const utils = require('utils');
module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){
        let structure;
        if(creep.carry.energy === 0 || creep.memory.harvesting){
            creep.memory.action = 'mine Energy';
            creep.memory.harvesting = creep.mineEnergy();
        }

        if (creep.memory.harvesting) {
            return;
        }
        creep.memory.action = 'transfer Energy';

        // let lorrysCount = Memory.population[creep.memory.spawn]['lorry'];
        // if (!utils.isNorm(lorrysCount)) {
        //     //все экстеншены ДОЛЖНЫ быть заполнены!
        //     structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        //         filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
        //     });
        //     if (utils.isNorm(structure)) {
        //         if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        //             creep.moveTo(structure);
        //         }
        //         return;
        //     }
        // }

        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LINK && s.energy < s.energyCapacity,
            range: 1
        });
        // ищем ближайший накопитель
        if (utils.isNorm(structure)) {
            if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
            return;
        }
        let structures = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (
                    (s.structureType === STRUCTURE_CONTAINER)
                    && s.store[RESOURCE_ENERGY] < s.storeCapacity
                )
                || ((
                        s.structureType === STRUCTURE_SPAWN
                        || s.structureType === STRUCTURE_EXTENSION
                        || s.structureType === STRUCTURE_TOWER
                    )
                    && s.energy < s.energyCapacity
                )
        });

        if (utils.isNorm(structures) && structures.length > 0) {
            structure = structures[0];
            if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
            return;
        }

        if (!utils.isNorm(structure)) {
            structure = creep.room.storage;
        }

        if (!utils.isNorm(structure)) {
            console.log('[notice] {ERROR} -> ' + creep.id + ' not found empty container for energy');
            return;
        }

        if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure);
        }
    }

};