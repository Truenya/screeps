const {isNorm} = require("./utils");
const {isToFill} = require("./cache");

function findClosestSourceOfEnergy(creep) {
    // Тут мы выбираем откуда брать
    creep.memory.action = 'looking for Energy';
    // если есть таргет и в нем есть что брать
    if (isNorm(creep.memory.target)) {
        const target = Game.getObjectById(creep.memory.target);
        if ((creep.memory.getFrom !== creep.memory.putTo) && isNorm(target) /* && (target.store[RESOURCE_ENERGY] > 0 || target.energy > 0)*/) {
            return target;
        }
    }

    // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
    // TODO в этот список можно включать сколько заберет оттуда текущий крип.
    // и вычитать это в фильтрах
    let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
    if (isNorm(target)) {
        creep.memory.target = target.id;
        creep.memory.getFrom = LOOK_ENERGY;
        return Game.getObjectById(target.id);
    }

    // find tombstones
    target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: (s) => s.store[RESOURCE_ENERGY] > 0
    });
    if (isNorm(target)) {
        creep.memory.target = target.id;
        creep.memory.getFrom = LOOK_CREEPS;
        return Game.getObjectById(target.id);
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
            // console.log(`lorry ${creep.name}: target not found, going to стоянка 30 15`);
            //then move to 30 15
            creep.moveTo(30, 15);
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
            creep.moveToMy(target);
            // routeCreep(creep, target);
            break;
        default:
            break;
    }
}

function searchWhereToPlaceEnergy(creep){
    // FIXME ужасный код, переписать
    // список фильтров с нужными параметрами по приоритету.
    creep.memory.action = 'transfer Energy';
    if ((Object.keys(creep.store)[0] !== RESOURCE_ENERGY || Object.keys(creep.store).length > 1) && isNorm(creep.room.storage)){
        const target = creep.room.storage.id;
        creep.memory.target = target;
        creep.memory.putTo = STRUCTURE_STORAGE;
        return Game.getObjectById(target);
    }
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
        if (isNorm(creep.room.storage)) {
            creep.memory.putTo = STRUCTURE_STORAGE;
            return Game.getObjectById(Game.rooms[creep.pos.roomName].storage.id);
        }
    }

    if(isNorm(creep.room.storage)){
        creep.drop(RESOURCE_ENERGY);
        return structure;
    }

    return creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => {
            return  s.structureType === STRUCTURE_CONTAINER &&s.store[RESOURCE_ENERGY] < s.storeCapacity
            && isToFill(s);
        }
    });
}

function transferEnergy(creep, structure) {
    if (!isNorm(structure)) {
        // TMP
        // Когда класть некуда в домашней комнате, можно в любую другую сходить помочь
        // const tmp = Object.keys(Memory.rooms).filter(room => room.name !== creep.room.name)[0];
        // if(isNorm(tmp)) {
        //     console.log('lorry: going to '+tmp+ ' for help' + ' from ' + creep.room.name);
        //     creep.moveToMy(Game.rooms[tmp].controller.pos);
        //     return;
        // }
        // END TMP
        console.log('[notice] -> ' + creep.name + ' not found empty container for energy');
        return;
    }

    // for (k in Object.keys(creep.store)){
    //     const type = Object.keys(creep.store)[k];
    //     const count = creep.store[type];
        let resultTransfer = creep.transfer(structure, Object.keys(creep.store)[0]);
        if (resultTransfer === ERR_NOT_IN_RANGE) {
            creep.moveToMy(structure);
        }
        if (resultTransfer === OK) {
            if (creep.memory.getFrom !== STRUCTURE_STORAGE)
                creep.memory.getFrom = 0;
        }
    //     return;
    //
}

module.exports = {
    findAndGetEnergy:function (creep){
        takeEnergy(creep, findClosestSourceOfEnergy(creep));
    },

    /**
     * развозит энергию по спавнам и/или заполняет все контейнеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){
        if (creep.store.getUsedCapacity() === 0) {
            // Тут мы выбираем откуда брать
            this.findAndGetEnergy(creep);
            return;
        }

        transferEnergy(creep, searchWhereToPlaceEnergy(creep));
    }
};

