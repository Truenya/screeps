/**
 * найден вражеский крип, атака
 * @returns {boolean}
 */
StructureTower.prototype.defend = function () {
    let startCpu = Game.cpu.getUsed();
    let elapsed;
    let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        //this.pos.findClosestByRange(FIND_CREEPS, {filter: creep => creep.owner.username !== this.owner.username});

    if (target){
        this.attack(target);
        if( Memory.noticeSettings && Memory.noticeSettings['noticeTowerAttack'] === true) {
            console.log('[tower]-> room [' + this.room.name + '], found enemy');
        }
        elapsed = Game.cpu.getUsed() - startCpu;
        if(elapsed > 1.9){
            // console.log('[CPU]-> tower.attack cpu usage:'+elapsed);
        }

        return true;
    }

    if( Memory.noticeSettings &&  Memory.noticeSettings['noticeCPU'] && Memory.noticeSettings['noticeCPULevel']) {
        elapsed = Game.cpu.getUsed() - startCpu;
        if (elapsed > Memory.noticeSettings['noticeCPULevel']) {
            // console.log('[CPU]-> tower.attack cpu usage:' + elapsed);
        }
    }
    return false;
};
var utils = require('utils');
/**
 * найдено здание, требующее починки (меньше половины hits)
 * @returns {boolean}
 */
StructureTower.prototype.doRepair = function () {
    let startCpu = Game.cpu.getUsed();
    let elapsed;
    let closestDamagedStructure;
    const {repair, noticeSettings} = Memory;
    if (!utils.isNorm(repair)) {
        Memory.repair = {};
    }
    const {name} = this.room;
    if (utils.isNorm(Memory.repair[name])) {
        closestDamagedStructure = Game.getObjectById(Memory.repair[name]);
        if (utils.isNorm(closestDamagedStructure)) {
            if (closestDamagedStructure.hits > (closestDamagedStructure.hitsMax * 0.5)) {
                closestDamagedStructure = undefined;
                delete Memory.repair[name];
            }
        }
    }
    if (!closestDamagedStructure) {
        closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) =>
                structure.structureType !== STRUCTURE_WALL
                && structure.structureType !== STRUCTURE_RAMPART
                // && structure.structureType !== STRUCTURE_ROAD
                && structure.hits < (structure.hitsMax * 0.5)
        });
    }

    if (closestDamagedStructure) {
        Memory.repair[name] = closestDamagedStructure.id;
        this.repair(closestDamagedStructure);
        elapsed = Game.cpu.getUsed() - startCpu;
        if (noticeSettings && noticeSettings['noticeCPU'] && noticeSettings['noticeCPULevel']) {
            if (elapsed > noticeSettings['noticeCPULevel']) {
                console.log('[CPU]-> tower.repair cpu usage:' + elapsed);
            }
        }
        return true;
    }

    elapsed = Game.cpu.getUsed() - startCpu;
    if (noticeSettings && noticeSettings['noticeCPU'] && noticeSettings['noticeCPULevel']) {
        if (elapsed > noticeSettings['noticeCPULevel']) {
            console.log('[CPU]-> tower.repair cpu usage:' + elapsed);
        }
    }

    return false;
};
