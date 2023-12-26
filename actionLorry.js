const utils = require("utils");
const {isNorm} = require("./utils");
module.exports = {

    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){
        function findClosestSourceOfEnergy(creep) {
            // Помним ли мы откуда брать
            if (isNorm(creep.memory.target)) {
                const target = Game.getObjectById(creep.memory.target);
                if (utils.isNorm(target) && (target.store[RESOURCE_ENERGY] > 0 || target.energy > 0)) {
                    creep.memory.target = target.id;
                    return target;
                }

                delete creep.memory.target;
                console.log("lorry: то, откуда мы хотели брать уже не существует или там закончилась энергия");
            }
            // Тут мы выбираем откуда брать
            creep.memory.action = 'looking for Energy';

            let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (utils.isNorm(target)) {
                creep.memory.getFrom = LOOK_ENERGY;
                return target;
            }

            target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (s) => s.store[RESOURCE_ENERGY] > 0
            })
            if (utils.isNorm(target)) {
                creep.memory.getFrom = LOOK_CREEPS;
                return target;
            }

            // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
            // if (creep.room.controller.level > 4) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
                    || s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
                    || s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
            });
            if (utils.isNorm(target)) {
                creep.memory.getFrom = target.structureType;
                return target;
            }
            // }

            // Если последнее куда мы клали не сторадж, значит можно оттуда взять
            if (creep.memory.putTo !== STRUCTURE_STORAGE) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
                });
                if (utils.isNorm(target)) {
                    creep.memory.getFrom = STRUCTURE_STORAGE;
                    return target;
                }
            }

            //если нет в сторадже, идем в контейнеры, если есть, конечно
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getCapacity()
            });
            creep.memory.getFrom = STRUCTURE_CONTAINER;
            if (utils.isNorm(target)) {
                creep.memory.target = target.id;
            }

            return target;
        }

        function takeEnergy(creep,target){
            if (!utils.isNorm(target)) {
                console.log(`lorry ${creep.name}: target not found`);
                return;
            }

            let actRes = creep.withdraw(target, RESOURCE_ENERGY);
            switch (actRes) {
                case OK:
                    creep.memory.working = true;
                    //fallthrough
                case ERR_NOT_ENOUGH_RESOURCES:
                    delete creep.memory.target;
                    break;
                case ERR_INVALID_TARGET:
                    const pickUpEnergy = creep.pickup(target);
                    if(pickUpEnergy !== ERR_NOT_IN_RANGE) {
                        delete creep.memory.target;
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

        function findClosestDestination(creep){
            creep.memory.action = 'transfer Energy';
            let structure;

            // пошли тащить
            if(creep.memory.getFrom === STRUCTURE_CONTAINER){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                    || s.structureType === STRUCTURE_LINK && s.energy < s.energyCapacity
                });
                if (utils.isNorm(structure) && structure.structureType !== creep.memory.getFrom) {
                    creep.memory.putTo = structure.structureType;
                    console.log('lorry: ' + creep.name + ' go to ' + structure.structureType);
                    return structure;
                }
            }

            // ищем ближийший накопитель
            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] < s.storeCapacity
            });
            // console.log('lorry: ' + creep.name + JSON.stringify(structure));
            if (utils.isNorm(structure) && structure.structureType !== creep.memory.getFrom) {
                creep.memory.putTo = structure.structureType;
                return structure;
            }


                //все экстеншены ДОЛЖНЫ быть заполнены!
            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
            });
            if (utils.isNorm(structure)) {
                creep.memory.putTo = STRUCTURE_EXTENSION;
                return structure;
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
            if (!utils.isNorm(structure)) {
                console.log('[notice] -> ' + creep.id + ' not found empty container for energy');
                return;
            }

            const resultTransfer = creep.transfer(structure, RESOURCE_ENERGY);
            if (resultTransfer === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }else if (resultTransfer === OK && creep.memory.getFrom !== STRUCTURE_STORAGE) {
                creep.memory.getFrom = 0;
            }
        }

        // console.log('lorry: ' + creep.name + ' ' + creep.memory.action);
        creep.memory.working = creep.store[RESOURCE_ENERGY] > 0;


        if (!creep.memory.working) {
            // Тут мы выбираем откуда брать
            let target = findClosestSourceOfEnergy(creep);
            takeEnergy(creep, target);
            return;
        }

        transferEnergy(creep, findClosestDestination(creep));
    }
};