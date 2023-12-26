const utils = require("utils");
module.exports = {

    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){
        function checkIfCreepIsBusy(creep) {
            // if(creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()){
            if (creep.store[RESOURCE_ENERGY] > 0) {
                creep.memory.working = true;
                //console.log("Если лорри заполнен, значет рабоотает");
            } else if (creep.store[RESOURCE_ENERGY] === 0) {
                //console.log("Если лорри пуст, значет нее рабоотает");
                creep.memory.working = false;
            }
        }

        function findClosestSourceOfEnergy(creep) {
            // Тут мы выбираем откуда брать
            let target;
            creep.memory.action = 'looking for Energy';
            // TODO Добавить поиск мертвых крипов с энергией, чтобы не исчезала
            // если есть стораджи и в них есть что брать
            // if (creep.room.controller.level > 4) {
            //     target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            //         filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
            //     });
            //     creep.memory.getFrom = STRUCTURE_LINK;
            // }
            // // если нет ничего выше перечисленного, идем в контейнеры и берем оттуда энергию
            if (creep.memory.target) {
                if ((creep.memory.getFrom !== creep.memory.putTo) && utils.isNorm(Game.getObjectById(creep.memory.target))) {
                    return Game.getObjectById(creep.memory.target);
                }

                creep.memory.target = 0;
                console.log("lorry: в памяти ничего адекватного и мы ее почистили");

                // FIXME, вроде разобрался(надеюсь) Разобраться с циклическим весельем у контейнера(стораджа)
                return undefined;
            }

            // Если последнее куда мы клали не сторадж, значит можно оттуда взять
            if (creep.memory.putTo !== STRUCTURE_STORAGE) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
                });
                creep.memory.getFrom = STRUCTURE_STORAGE;
            }

            // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
            if (!utils.isNorm(target)) {
                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                creep.memory.getFrom = LOOK_ENERGY;
            }


            //если нет в сторадже, идем в контейнеры, если есть, конечно
            if (!utils.isNorm(target)) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getCapacity()
                });
                creep.memory.getFrom = STRUCTURE_CONTAINER;
            }
            if (utils.isNorm(target))
                creep.memory.target = target.id;

            return target;
        }

        function zabratEnergiyu(creep,target){
            if (!utils.isNorm(target)) {
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
                    // utils.routeCreep(creep, target);
                    break;
                default:
                    break;
            }
        }

        function searchStructure(creep){
            creep.memory.action = 'transfer Energy';
            let structure;

            // пошли тащить
            if(creep.memory.getFrom === STRUCTURE_CONTAINER){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;
            }

            // ищем ближийший накопитель
            if (!utils.isNorm(structure)) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_SPAWN;
            }

            if (!utils.isNorm(structure)) {
                //все экстеншены ДОЛЖНЫ быть заполнены!
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_EXTENSION;
            }

            if (!utils.isNorm(structure)) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_TOWER;
                //Если товер заполнен и энергия не закончилась, то отнесем в сторадж, иначе эта переменная все равно будет перезаписана
                creep.memory.getFrom = STRUCTURE_CONTAINER;
            }

            if ((!utils.isNorm(structure)) && creep.memory.getFrom !== STRUCTURE_STORAGE) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE
                    // &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;

            }
            // Если уж все заполнено и даже пусть мы брали из стораджа, отнесем снова туда
            if ((!utils.isNorm(structure))) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE
                    // &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (utils.isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;

            }
            return structure;
        }

        function transferEnergy(creep, structure) {
            if (utils.isNorm(structure)) {

                let resultTransfer = creep.transfer(structure, RESOURCE_ENERGY);
                if (resultTransfer === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
                if (resultTransfer === OK) {
                    if (creep.memory.getFrom !== STRUCTURE_STORAGE)
                        creep.memory.getFrom = 0;
                }
            } else {
                console.log('[notice] -> ' + creep.id + ' not found empty container for energy');
            }
        }
        console.log('lorry: ' + creep.name + ' ' + creep.memory.action);
        checkIfCreepIsBusy(creep);


        if (!creep.memory.working) {
            // Тут мы выбираем откуда брать
            let target = findClosestSourceOfEnergy(creep);
            zabratEnergiyu(creep, target);
        } else {
            let structure = searchStructure(creep);
            transferEnergy(creep, structure);
        }
    }
};