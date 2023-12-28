const harvester = require('actionHarvest');
const upgrader = require('actionUpgrader');
const utils = require('utils');
const {isNorm} = require("./utils");
function getEnergy(creep){
    let carry = creep.store[RESOURCE_ENERGY];
    if(carry < creep.carryCapacity && (creep.memory.working === false || creep.memory.working === undefined)){
        // Почему билдеры в других комнатах не могут находиться?
        // Было в начале, переместил в тот кейс, когда ему за ресурсами надо идти.
        // Возвращение в домашнюю комнату
        if(creep.room.name !== creep.memory.roomID){
            // let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            let actRes = creep.moveToMy(Game.rooms[creep.memory.roomID].storage.pos);
            // let exit = creep.room.findExitTo(creep.memory.roomID);
            // console.log('exit:'+exit);
            // let actRes = creep.move(exit);
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }else {
                console.log('не смог перейти в комнату: '+creep.memory.roomID+' ошибка: '+actRes);
            }
            return false;
        }

        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0) || (s.structureType === STRUCTURE_LINK && s.energy > 0)
        });

        if (!isNorm(container)) {
            container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0)
            })
        }
        if(!isNorm(container)) {
            harvester.run(creep);
            return false;
        }

        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
            creep.memory.action= 'gonna withdraw ';
            // utils.routeCreep(creep, container);
            return false;
        }
    }

    return carry !== 0;
}

module.exports = {
    run:function(creep){
        creep.memory.working = getEnergy(creep);
        if (!creep.memory.working){
            // console.log('builder no energy: ' + creep.memory.action);
            return;
        }
        // console.log('builder has energy: ' + creep.memory.action);

        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if(utils.isNorm(target)) {
            // utils.routeCreep(creep, target);
            if(creep.build(target) === ERR_NOT_IN_RANGE) creep.moveTo(target);
            return;
        }

        // TMP
        // Когда строить нечего в текущей комнате, можно в любую другую сходить помочь
        // const tmp = Object.keys(Memory.rooms).filter(room => room.name !== creep.room.name)[0];
        // if(utils.isNorm(tmp)) {
        //     // console.log('exit:'+exit);
        //     creep.moveToMy(Game.rooms[tmp].controller.pos);
        //     return;
        // }
        // END TMP

        // console.log('builder1: ' + creep.memory.action + target);

        upgrader.run(creep);
    }
};