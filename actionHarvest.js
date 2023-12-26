const utils = require('utils');
module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){
        if(creep.carry.energy === 0 || creep.memory.harvesting){
            creep.memory.action = 'mine Energy';
            creep.memory.harvesting = creep.mineEnergy();
        }

        if (creep.memory.harvesting) {
            return;
        }
        creep.memory.action = 'transfer Energy';
        let structure;
        // ищем ближийший накопитель
        if (!structure) {
            let structures;
            structures = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (
                        (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_LINK)
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
            // console.log('harvester: ' + creep.name + ' has ' + Object.values(structures) + ' structures' );
            //STRUCTURE_LINK
            //TODO добавить список структур и обрабатывать его единообразно в одной функции.
            /**/
            let lorrysCount = Memory.population[creep.memory.spawn]['lorry'];

            if (!utils.isNorm(lorrysCount)) {
                //все экстеншены ДОЛЖНЫ быть заполнены!
                structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
            }
            //
            // //если уровень контроллера позволяет строить стораджи, то забиваем только их!
            // if (!structure) {
            //     if (creep.room.controller.level > 3) {
            //         structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            //             filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] < s.storeCapacity
            //         });
            //     }
            // }


            if (structures.length > 0) {
                structure = structures[0];
            }
        }


        // если все забили, то забиваем все подряд, что еще не наполнено
        // if (!structure) {
        //     structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        //         filter: (s) => ((s.structureType === STRUCTURE_SPAWN
        //                     || s.structureType === STRUCTURE_EXTENSION
        //                     || s.structureType === STRUCTURE_TOWER)
        //                 && s.energy < s.energyCapacity)
        //             || ((s.structureType === STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] < s.storeCapacity)
        //     });
        // }

        // совсем на худой конец, есть башни и спауны
        // if (structure === undefined) {
        //     structure = creep.room.find(FIND_MY_STRUCTURES, {
        //         filter: (structure) => {
        //             return (structure.structureType === STRUCTURE_EXTENSION ||
        //                 structure.structureType === STRUCTURE_SPAWN ||
        //                 structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        //         }
        //     });
        //
        // }

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