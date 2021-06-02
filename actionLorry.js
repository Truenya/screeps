module.exports = {
    /**
     * развозит энергию по спавнам и/или заполняет все контенеры из стораджа
     * @param {Creep} creep
     */
    run:function(creep){

        let startCpu = Game.cpu.getUsed();
        let elapsed;
        //console.log("Лорри жив");
        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
            // console.log("Если лорри заполнен, значет рабоотает");
        }
        else if(creep.carry.energy === 0){
        // console.log("Если лорри пуст, значет нее рабоотает");
            creep.memory.working = false;
        }

        if(creep.carry.energy === 0 || !creep.memory.working){
            // Тут мы выбираем откуда брать
            let target;
            creep.memory.action = 'looking for Energy';
            // TODO Добавить поиск мертвых крипов с энергией, чтобы не исчезала
            //если есть стораджи и в них есть что брать
            if (creep.room.controller.level > 3) {

                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_LINK && s.energy > 0
                });
                creep.memory.getFrom = STRUCTURE_LINK;

                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] < s.storeCapacity
                    });
                    creep.memory.getFrom = STRUCTURE_STORAGE;
                }
                //если нет стораджей, идем в линки, если есть, конечно

            }
            else{
                // если нет ничего выше перечисленного, идем в контенеры и берем оттуда энергию
                if(!target){
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) =>  s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY]  > 0
                    });
                    creep.memory.getFrom = STRUCTURE_CONTAINER;
                }
            }
            creep.gonnaEndMyWork = false;
            if(target !== undefined && !creep.gonnaEndMyWork){
                let actRes = creep.withdraw(target, RESOURCE_ENERGY);
                if (actRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    if(creep.pos.getRangeTo(target)>20)
                        // console.log("Лорри: что-то далеко мне идти, проверю достаточно ли я упрям чтобы добраться")
                        if(creep.gonnaEndMyWork !== undefined) {
                            creep.gonnaEndMyWork = true;
                            // console.log("Лорри: Я силен и крепок, я доберусь до цели во что-бы то ни стало");
                        }
                        else
                            console.log("Лорри: похоже я лошара и буду крутиться");
                }
            }

            if( Memory.noticeSettings !== undefined &&  Memory.noticeSettings['noticeCPU'] === true && Memory.noticeSettings['noticeCPULevel']) {
                elapsed = Game.cpu.getUsed() - startCpu;
                if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                    creep.say(Math.round(elapsed,2)+'%');
                   // console.log('[CPU]-> creep.harvest action: mine energy, cpu usage:' + elapsed);
                }
            }
        }

        if(creep.memory.working){
            creep.memory.action = 'transfer Energy';
            let structure;

            //все экстеншены ДОЛЖНЫ быть заполнены!
            structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>  s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
            });

            
            // ищем ближийший накопитель
            if(!structure){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
                });
            }
            
            if(!structure && creep.memory.getFrom !== STRUCTURE_CONTAINER){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
            }

            //если позволяет развитие, то таскаем в контейнеры
            if(!structure && creep.room.controller.level > 3){

                //заполнили контейнеры, заполняем сторадж
                if(!structure && creep.memory.getFrom !== STRUCTURE_STORAGE){
                    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => s.structureType === STRUCTURE_STORAGE &&  s.store[RESOURCE_ENERGY] < s.storeCapacity
                    });
                }
            }


            if (structure !== undefined) {
                
                let resultTrasnfer = creep.transfer(structure, RESOURCE_ENERGY);
                if (resultTrasnfer === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
                if(resultTrasnfer === OK) {
                    creep.gonnaEndMyWork = false;
                }
                //creep.memory.targetID = structure.id;
            }
            else{
                console.log('[notice] -> '+creep.id+' not found empty container for energy');
            }

            if( Memory.noticeSettings  !== undefined &&  Memory.noticeSettings['noticeCPU']=== true && Memory.noticeSettings['noticeCPULevel']) {
                elapsed = Game.cpu.getUsed() - startCpu;
                if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
                    creep.say(Math.round(elapsed,2)+'%');
                   // console.log('[CPU]-> creep.harvest action: transfer energy, cpu usage:' + elapsed);
                }
            }
        }
    }
};