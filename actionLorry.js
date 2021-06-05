var utils = require("utils");
module.exports = {

    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){
        function isNorm(chtoto) {
            return (chtoto !== null && chtoto !== undefined && chtoto !== 0)
        }

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
            // console.log("Ищем ");
            creep.memory.action = 'looking for Energy';
            // TODO Добавить поиск мертвых крипов с энергией, чтобы не исчезала
            //если есть стораджи и в них есть что брать
            // if (creep.room.controller.level > 3) {
            //     target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            //         filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
            //     });
            //     creep.memory.getFrom = STRUCTURE_LINK;
            // }
            // else{
            // // если нет ничего выше перечисленного, идем в контенеры и берем оттуда энергию
            // creep.memory.target=0;
            if (!creep.memory.target) {

                //  if(!target){
                //     target = creep.pos.findClosestByPath(FIND_TOMBSTONES)
                // };
                // Если последнее куда мы клали не сторадж, значит можно оттуда взять
                // if (!isNorm(target) && creep.memory.putTo !== STRUCTURE_STORAGE) {
                if (creep.memory.putTo !== STRUCTURE_STORAGE) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0
                    });
                    creep.memory.getFrom = STRUCTURE_STORAGE;
                }

                // FIXME добавить список объектов энергии, чтобы все за ними не рвались толпой
                if (!utils.isNorm(target)) {
                    target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                    creep.memory.getFrom = 0;
                }


                // console.log(target);
                //если нет в сторадже, идем в контейнеры, если есть, конечно
                if (!isNorm(target)) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getCapacity()
                    });

                    //console.log("Заберем из контейнера");
                    creep.memory.getFrom = STRUCTURE_CONTAINER;
                }
                if (isNorm(target))
                    creep.memory.target = target.id;
                // console.log(creep.memory.target);
            }
            else{
                if ((creep.memory.getFrom !== creep.memory.putTo) && isNorm(Game.getObjectById(creep.memory.target))) {
                    target = Game.getObjectById(creep.memory.target);
                    // console.log("Что-то есть в памяти");
                } else {
                    creep.memory.target = 0
                    // creep.memory.getFrom = STRUCTURE_CONTAINER;
                    console.log("в памяти ничего адекватного и мы ее почистили");
                }
                //neFIXME, вроде разобрался(надеюсь) Разобраться с циклическим весельем у контейнера(стораджа)
            }
            // console.log(target);
            return target;
        }

        function zabratEnergiyu(creep,target){
            if (isNorm(target)) {
                // console.log("lorry znayet kuda idti");
                let actRes = creep.withdraw(target, RESOURCE_ENERGY);
                // console.log(actRes);
                // console.log(target);
                if (actRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    //console.log("i idet tuda");
                }
                if (actRes === OK) {
                    // console.log("Лорри: А ну пох вроде все забрал");
                    creep.memory.working = true;
                    creep.memory.target = 0;
                }
                if (actRes === ERR_NOT_ENOUGH_RESOURCES)
                    creep.memory.target = 0;
                if(actRes === ERR_INVALID_TARGET){
                    pickUpEnergy = creep.pickup(target);
                    if(pickUpEnergy === ERR_NOT_IN_RANGE)
                        creep.moveTo(target);
                    else
                        creep.memory.target = 0;

                    // console.log(pickUpEnergy);
                    // console.log(target);
                }
            }
        }

        // function noticeIt(creep){
        //     if( Memory.noticeSettings !== null &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
        //         elapsed = Game.cpu.getUsed() - startCpu;
        //         if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
        //             creep.say(Math.round(elapsed,2)+'%');
        //            // //console.log('[CPU]-> creep.harvest action: mine energy, cpu usage:' + elapsed);
        //         }
        //     }
        //
        // }

        function searchStructure(creep){
            creep.memory.action = 'transfer Energy';
            let structure;
            //console.log("пошли тащить")FIND_DROPPED_RESOURCES
            if(creep.memory.getFrom === STRUCTURE_CONTAINER){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;
            }

            // ищем ближийший накопитель
            if (!isNorm(structure)) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN) && s.energy < s.energyCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_SPAWN;
            }

            if (!isNorm(structure)) {
                //все экстеншены ДОЛЖНЫ быть заполнены!
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_EXTENSION;
            }

            if (!isNorm(structure)) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_TOWER;
                //Если товер заполнен и энергия не закончилась, то отнесем в сторадж, иначе эта переменная все равно будет перезаписана
                creep.memory.getFrom = STRUCTURE_CONTAINER;
            }

            if ((!isNorm(structure)) && creep.memory.getFrom !== STRUCTURE_STORAGE) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE
                    // &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;

            }
            // Если уж все заполнено и даже пусть мы брали из стораджа, отнесем снова туда
            if ((!isNorm(structure))) {
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_STORAGE
                    // &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (isNorm(structure))
                    creep.memory.putTo = STRUCTURE_STORAGE;

            }
            // if(!structure && creep.memory.getFrom !== STRUCTURE_CONTAINER){
            //     structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            //         filter: (s) => s.structureType === STRUCTURE_CONTAINER &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
            //     });
            // }
            // // s.structureType === STRUCTURE_TOWER
            return structure;
        }

        function transferEnergy(creep, structure) {
            if (isNorm(structure)) {

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

        // let startCpu = Game.cpu.getUsed();
        // let elapsed;
        // //console.log(creep.store[RESOURCE_ENERGY]);
        checkIfCreepIsBusy(creep);


        if (!creep.memory.working) {
            // Тут мы выбираем откуда брать
            let target;
            // console.log("И ищет откуда бы взять энергии")
            target = findClosestSourceOfEnergy(creep);

            zabratEnergiyu(creep, target);


        } else {
            let structure = searchStructure(creep);
            //console.log("пошли тащить")FIND_DROPPED_RESOURCES
            transferEnergy(creep, structure);
        }
    }
};