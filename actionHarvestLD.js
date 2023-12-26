const harvester = require('actionHarvest');
const utils = require("./utils");
// TODO функция: сгрузить куда нибудь ресурсы.
module.exports = {
    /**
     * мачете собирать!
     * @param {Creep} creep
     */
    run:function(creep){
        // А почему ресурсные румы в крипе хранятся?
        // if(creep.resourseRooms.length === 0){
        //     console.log('[notice]-> no resource rooms, change action to simple harvester');
            harvester.run(creep);
            return;
        // }

        // Куда идти и что фармить
        // FIXME: все эти проверки надо в main перетащить, в отдельную функцию
        // И дергать раз в N тиков.
        if(Memory.resourceRooms === undefined){
            Memory.resourceRooms = [];
            for(let id in creep.resourseRooms){
                Memory.resourceRooms[id] = 0;
                console.log(id);
            }
        }

        if (creep.memory.resourceRoomID === undefined) {
            for (let id in creep.resourseRooms) {
                if (Memory.resourceRooms[id] < creep.resourseRooms[id]['limit']) {
                    creep.memory.resourceRoomID = id;
                    Memory.resourceRooms[id] += 1;
                    break;
                }
            }
        }

        if(creep.store.getUsedCapacity("energy") === 0 || creep.memory.harvesting){
            // TODO actions shoud be enum
            creep.memory.action = 'mine Energy';

            //если в домашней комнате, топаем до места назначения
            if(creep.room.name !== creep.memory.resourceRoomID){
                creep.memory.harvesting = false;
                let exit = creep.room.findExitTo(creep.resourseRooms[creep.memory.resourceRoomID]['room']);
                // let exit = creep.room.findExitTo('W59S5'); //FIXME
                console.log('exit:'+exit);
                let actRes = creep.moveTo(creep.pos.findClosestByRange(exit));

                if (actRes === OK) {
                    creep.memory.action= 'traveling to ' + creep.resourseRooms[creep.memory.resourceRoomID]['room'];
                    return;
                }
                console.log('harvesterld '+creep.name+': action='+actRes);
            }
            else{
                //пока не набился битком, майнит энергию в комнате назначения
                creep.memory.harvesting = creep.mineEnergy();
            }
        }

        if(creep.memory.harvesting){
            console.log('harvesterld:'+creep.memory.action);
            return;
        }
        // console.log('harvesterld '+creep.name+': harvesting='+creep.memory.harvesting);

        if(creep.room.name !== creep.memory.roomID){
            let exit = creep.room.findExitTo(creep.memory.roomID);
            let actRes = creep.moveTo(creep.pos.findClosestByRange(exit));
            if (actRes === OK) {
                creep.memory.action= 'go back to ' + creep.room.name;
            }
            return;
        }
        //TODO Пусть строит лучше, чем таскает

        creep.memory.action = 'transfer Energy';
        //все экстеншены ДОЛЖНЫ быть заполнены!
        // если все забили, то забиваем все подряд, что еще не наполнено
        let structure;
        if (!structure){
            structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_SPAWN
                            || s.structureType === STRUCTURE_EXTENSION
                            || s.structureType === STRUCTURE_TOWER
                            || s.structureType === STRUCTURE_LINK)
                        && s.energy < s.energyCapacity)
                    || ((s.structureType === STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] < s.storeCapacity)
            });
        }

        if (!utils.isNorm(structure)) {
            if (creep.room.controller.level <= 3) {
                console.log('[harvest]-> '+creep.id+' not found empty container for energy');
                return;
            }
            structure = creep.room.storage;
        }

        if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure);
        }
        console.log('harvesterld:'+creep.memory.action + ' to ' + structure);
    }
};