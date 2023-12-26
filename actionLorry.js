const {isNorm} = require("./utils");

function findClosestSourceOfEnergy(creep) {
    // Тут мы выбираем откуда брать
    creep.memory.action = 'looking for Energy';
    // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
    let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
    if (isNorm(target)) {
        creep.memory.target = target.id;
        creep.memory.getFrom = LOOK_ENERGY;
        return Game.getObjectById(target.id);
    }

    // find tombstones
    let tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (s) => s.store[RESOURCE_ENERGY] > 0
    });
    if (isNorm(tombstone)) {
        creep.memory.target = tombstone.id;
        creep.memory.getFrom = LOOK_CREEPS;
        return Game.getObjectById(tombstone.id);
    }

    // если есть таргет и в нем есть что брать
    if (creep.memory.target) {
        target = Game.getObjectById(creep.memory.target);
        if ((creep.memory.getFrom !== creep.memory.putTo) && isNorm(target) && (target.store[RESOURCE_ENERGY] > 0 || target.energy > 0)) {
            return target;
        }
    }

    // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
    // if (creep.room.controller.level > 4) {
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
            || s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            || s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
    });
    if (isNorm(target) && creep.memory.putTo !== target.structureType) {
        creep.memory.getFrom = target.structureType;
        return target;
    }
    // }

    // Если последнее куда мы клали не сторадж, значит можно оттуда взять
    if (creep.memory.putTo !== STRUCTURE_STORAGE) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
        });
        if (isNorm(target)) {
            creep.memory.getFrom = STRUCTURE_STORAGE;
            return target;
        }
    }

    //если нет в сторадже, идем в контейнеры, если есть, конечно
    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getCapacity()
    });
    creep.memory.getFrom = STRUCTURE_CONTAINER;
    if (isNorm(target)) {
        creep.memory.target = target.id;
    }

    return target;
}

    function takeEnergy(creep,target){
        if (!isNorm(target)) {
            console.log(`lorry ${creep.name}: target not found`);
            return;
        }

    let actRes = creep.withdraw(target, RESOURCE_ENERGY);
    switch (actRes) {
        case OK:
            creep.memory.working = true;
        //fallthrough
        case ERR_NOT_ENOUGH_RESOURCES:
            creep.memory.target = 0;
            break;
        case ERR_INVALID_TARGET:
            const pickUpEnergy = creep.pickup(target);
            if(pickUpEnergy !== ERR_NOT_IN_RANGE) {
                creep.memory.target = 0;
                break;
            }
        //fallthrough
        case ERR_NOT_IN_RANGE:
            creep.moveTo(target);
            // routeCreep(creep, target);
            break;
        default:
            break;
    }
}

function searchWhereToPlaceEnergy(creep){
    creep.memory.action = 'transfer Energy';
    let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
    });
    if (isNorm(structure)) {
        creep.memory.putTo = STRUCTURE_EXTENSION;
        return Game.getObjectById(structure.id);
    }

    // ищем ближийший накопитель
    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity
    });
    if (isNorm(structure)) {
        creep.memory.putTo = STRUCTURE_SPAWN;
        return Game.getObjectById(structure.id);
    }

    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] < s.storeCapacity
    });
    if (isNorm(structure)) {
        creep.memory.putTo = STRUCTURE_TOWER;
        return Game.getObjectById(structure.id);
    }
    //Если товер заполнен и энергия не закончилась, то отнесем в сторадж, иначе эта переменная все равно будет перезаписана
    // creep.memory.getFrom = STRUCTURE_CONTAINER;

    // Если взяли из контейнера, то кладем в линк или сторадж
    if(creep.memory.getFrom === STRUCTURE_CONTAINER){
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                    || s.structureType === STRUCTURE_LINK && s.energy > 0)
                && s.structureType !== creep.memory.getFrom
        });
        if (isNorm(structure)) {
            creep.memory.putTo = STRUCTURE_STORAGE;
            return Game.getObjectById(structure.id);
        }
    }

    if ((!isNorm(structure)) && creep.memory.getFrom !== STRUCTURE_STORAGE) {
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE
                &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
        });
        if (isNorm(structure)) {
            creep.memory.putTo = STRUCTURE_STORAGE;
            return Game.getObjectById(structure.id);
        }
    }

    // Если уж все заполнено и даже пусть мы брали из стораджа, отнесем снова туда
    if (!isNorm(structure)) {
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE
            // &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
        });
        if (isNorm(structure)) {
            creep.memory.putTo = STRUCTURE_STORAGE;
            return Game.getObjectById(structure.id);
        }
        // FIXME выше не ищет STORAGE, а ниже кладет напрямую в STORAGE
        creep.memory.putTo = STRUCTURE_STORAGE;
        return Game.getObjectById(Game.rooms[creep.pos.roomName].storage.id);

    }
    return Game.getObjectById(structure.id);
}

function transferEnergy(creep, structure) {
    if (!isNorm(structure)) {
        console.log('[notice] -> ' + creep.name + ' not found empty container for energy');
        return;
    }

    let resultTransfer = creep.transfer(structure, RESOURCE_ENERGY);
    if (resultTransfer === ERR_NOT_IN_RANGE) {
        creep.moveTo(structure);
    }
    if (resultTransfer === OK) {
        if (creep.memory.getFrom !== STRUCTURE_STORAGE)
            creep.memory.getFrom = 0;
    }
}

module.exports = {
    findAndGetEnergy:function (creep){
        takeEnergy(creep, findClosestSourceOfEnergy(creep));
    },

    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){
        if (creep.store[RESOURCE_ENERGY] === 0) {
            // Тут мы выбираем откуда брать
            this.findAndGetEnergy(creep);
            return;
        }

        transferEnergy(creep, searchWhereToPlaceEnergy(creep));
    }
};

