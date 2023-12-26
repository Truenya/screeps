
module.exports = {
    run:function(creep){
        if(creep.room.name !== creep.memory.roomID){
            let actRes = creep.moveTo(new RoomPosition(25,25,creep.memory.roomID));
            if (actRes === OK) {
                creep.memory.action= 'traveling back ';
            }
            return;
        }

        if(creep.carry.energy === creep.carryCapacity){
            creep.memory.working = true;
        }

        if(creep.carry.energy === 0 || !creep.memory.working){

            delete creep.memory.wallID;

            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => ((s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ) &&  s.store[RESOURCE_ENERGY] > 0) || (s.structureType === STRUCTURE_LINK && s.energy > 0)
            });

            if (container !== undefined) {
                let actRes = creep.withdraw(container, RESOURCE_ENERGY);

                if ( actRes === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
                else if(actRes === ERR_NOT_ENOUGH_RESOURCES || actRes === ERR_INVALID_TARGET){
                    creep.memory.working = creep.mineEnergy();
                }
            }
            else{

                creep.memory.working = creep.mineEnergy();
            }
        }
        else {
            if (creep.doWallsRampartsRepair() || creep.doRepair() || creep.doBuild()) {
                creep.memory.working = true;
                return;
            }
            creep.memory.working = creep.doUpgrade()
        }
    }
};