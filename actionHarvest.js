const utils = require('utils');

function harvest(creep){
    if(creep.carry.energy === 0 || creep.memory.harvesting){
        creep.memory.action = 'mine Energy';
        return creep.mineEnergy();
    }
}

function putEnergy(creep){
    creep.memory.action = 'transfer Energy';
    // FIND_MY_STRUCTURES не ищет контейнеры и линки
    for (const id in Memory.structures.link) {
        const link = Memory.structures.link[id];
        if ( !utils.isNorm(link) || !creep.pos.isNearTo(link.x, link.y))
            continue;
        // console.log('link: ' + JSON.stringify(link));
        // continue;
        const targetFrom = Game.rooms[link.roomName].lookAt(link.x, link.y)[0]['structure'];
        const result = creep.transfer(targetFrom, RESOURCE_ENERGY);
        if (result === OK) {
            return;
        }
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(link);
            return;
        }
    }

    const structures = creep.pos.findInRange(FIND_STRUCTURES,3, {
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
    })
    //TODO добавить список структур и обрабатывать его единообразно в одной функции.
    /**/
    let lorrysCount = Memory.population[creep.memory.spawn]['lorry'];

    let structure;
    if (!utils.isNorm(lorrysCount)) {
        //все экстеншены ДОЛЖНЫ быть заполнены!
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
        });
    }


    if (structures.length > 0) {
        structure = structures[0];
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

module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){
        creep.memory.harvesting = harvest(creep);
        if (creep.memory.harvesting) {
            return;
        }

        putEnergy(creep)
    }
};