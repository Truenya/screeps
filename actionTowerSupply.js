var harvester = require('actionHarvest');

module.exports = {
    run:function(creep){
        // let startCpu = Game.cpu.getUsed();
        // let elapsed;
        //var carry = _.sum(creep.carry);
        let carry = creep.store[RESOURCE_ENERGY];
        // console.log("ТД: я жив");
        if(carry < creep.store.getCapacity() && !creep.memory.working){
            // console.log("ТД: Не полный рюкзак и не работаю");
            creep.memory.action ='harvest';
            harvester.run(creep);
            // let sourse;
            //
            // if(creep.memory.resID !== undefined){
            //     // console.log("ТД: Есть что копать");
            //     // console.log(creep.memory.resID);
            //     sourse = Game.getObjectById(creep.memory.resID);
            // }
            // else{
            //     sourse = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // }
            //
            // let hResult = creep.harvest(sourse);
            //
            // if (hResult === ERR_NOT_IN_RANGE) {
            //     creep.moveTo(sourse); //,{visualizePathStyle: {stroke: '#ffffff'}}
            // }
            // else if(hResult === OK){
            //     creep.memory.resID = sourse.id;
            // }
            // else{
            //     delete creep.memory.resID;
            // }
        
        }
        else{
            if(carry>0){
                creep.memory.working = true;
            }
            else{
                creep.memory.working = false;
                return;
            }
            
            
            let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_TOWER && s.energy < s.energyCapacity
            });
            creep.memory.action ='transferToTower';
            //extensions || structure.energyCapacity === structure.energy
            if (structure === undefined){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
                creep.memory.action ='transferToExtension';
            }
            
            //containers  || structure.energyCapacity === structure.energy
            if (structure === undefined){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                creep.memory.action ='transferToContainer';
            }
            

            if (structure === undefined) {
                structure = creep.room.storage;
            }

            if (structure !== undefined) {
                let action = creep.transfer(structure, RESOURCE_ENERGY);
                if ( action === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);// ,{visualizePathStyle: {stroke: '#ffffff'}});
                }
                else if(action === ERR_NOT_ENOUGH_RESOURCES){
                    creep.memory.working = false;
                }
            }

        }

    }
};