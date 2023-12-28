//TODO добавить функцию подобрать энергию и гонять в каждом крипе, если энергия в пределах трех клеток
const {isNorm} = require("./utils");
/**
 * добыча энергии
 * @returns {boolean}
 */
Creep.prototype.mineEnergy = function () {
    let source;
    this.memory.action = 'mine Energy';

    if (this.memory.resID) {
        source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {filter: s => s.id === this.memory.resID});
        // Memory.rooms[this.room.name]['source'][this.memory.resID]++;
    }

    if (!source) {
        if (this.memory.badResID) {
            source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {filter: s => s.id !== this.memory.badResID});
        }

        if (!source) {
            source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        }
    }

    let actResult = this.harvest(source);
    if (actResult === ERR_NOT_IN_RANGE) {
        this.moveTo(source);
    } else if (actResult === OK) {
        delete this.memory.badResID;
        this.memory.resID = source.id;
    } else if (
        // actResult === ERR_NOT_ENOUGH_RESOURCES||
         actResult === ERR_INVALID_TARGET ||
         actResult === ERR_NOT_OWNER) {
        this.memory.badResID = this.memory.resID;
        // Memory.rooms[this.room.name]['source'][this.memory.resID]--;
        delete this.memory.resID;
    }
    return this.store[RESOURCE_ENERGY] !== this.store.getCapacity(RESOURCE_ENERGY);
};

/**
 * апгрейд контроллера
 * @returns {boolean}
 */
Creep.prototype.doUpgrade = function () {
    if(this.carry.energy === 0){
        return false;
    }
    this.memory.action='upgrading...';

    if(this.upgradeController(this.room.controller) === ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller);
    }
    return true;
};
/**
 * Починка
 * @returns {boolean}
 */
Creep.prototype.doRepair = function(){
    let targets = [];
    if(this.memory.repObj !== null){
        if(Game.getObjectById(this.memory.repObj) !== null){
            if(Game.getObjectById(this.memory.repObj).hits <= (Game.getObjectById(this.memory.repObj).hitsMax/1.5)){
                targets[0] = Game.getObjectById(this.memory.repObj);
                delete this.memory.repObj;
            }
        }
    }
    if(targets.length<1){
        targets = this.room.find(FIND_STRUCTURES, {
            filter: object =>
                object.structureType !== STRUCTURE_WALL
                && object.structureType !== STRUCTURE_RAMPART
                && object.hits < (object.hitsMax / 2)
        });
        targets.sort((a,b) => a.hits - b.hits);
    }

    if (targets.length > 0) {
        this.memory.action = 'repair';
        this.memory.repObj = targets[0].id;
        if (!isNorm(this.repair)) return;
        if (this.repair(targets[0]) === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        }
        if (targets[0].hits > (targets[0].hitsMax / 2)) {
            delete this.memory.repObj;
        }
        return true;
    }
    this.memory.action = '?';
    return false;

};
/**
 * Чинить стены и рампарты
 * @returns {boolean}
 */
Creep.prototype.doWallsRampartsRepair = function(){
    let targets = [];

    if (this.memory.wallID && Game.getObjectById(this.memory.wallID).hits < Game.getObjectById(this.memory.wallID).hitsMax / 2) {
        targets[0] = Game.getObjectById(this.memory.wallID);
    } else {
        targets = this.room.find(FIND_STRUCTURES, {
            filter: object => (object.structureType === STRUCTURE_RAMPART || object.structureType === STRUCTURE_WALL) && object.hits < (object.hitsMax / 2)
        });

        targets.sort((a, b) => a.hits - b.hits);
    }

    if(targets.length>0) {
        let actResult = this.repair(targets[0]);
        if (actResult === ERR_NOT_IN_RANGE) {
            this.moveTo(targets[0]);
        } else if (actResult === OK) {
            this.memory.wallID = targets[0].id;
        }
        this.memory.action = 'Wall repair';
        return true;
    }

    return false;
};
/**
 * Строительство
 * @returns {boolean}
 */
Creep.prototype.doBuild = function () {
    const target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if (target) {
        if (this.build(target) === ERR_NOT_IN_RANGE) {
            this.moveTo(target);
        }
        this.memory.action = 'build';
        return true;
    }
    return false;
};
COLOR_BUILDER = '#33ff00';
COLOR_HARVESTER = '#ff0000';
COLOR_UPGRADER = '#ffff00';
COLOR_REPAIR = '#0000ff';
COLOR_LORRY = '#ff00ff';
COLOR_TOWER = '#00ff00';

COLOR_BY_ROLE = {
    harvester: COLOR_HARVESTER,
    builder: COLOR_BUILDER,
    upgrader: COLOR_UPGRADER,
    repair: COLOR_REPAIR,
    repairWall: COLOR_REPAIR,
    lorry: COLOR_LORRY,
    TowerSupply: COLOR_TOWER
}

Creep.prototype.colorByRole = function () {
    return COLOR_BY_ROLE[this.memory.role];
}

// My own more efficient moveTo
Creep.prototype.moveToMy = function (target) {
    if (this.fatigue > 0) {
        return ERR_TIRED;
    }
    // Just add args
    const result = this.moveTo(target, {reusePath: 20, ignoreCreeps: true, visualizePathStyle: {stroke: this.colorByRole()}, serializeMemory:true});
    if (result !== OK || (Game.time - this.memory._move.time) > 2) {
        // console.log(this.name+' moveToMy: '+result + ' -> ' + target + ' from last step: ' + (Game.time -this.memory._move.time));
        this.moveTo(target);
    }
    return result;
}


/**
 * Массив с комнатами для добычи ресов и лимитами
 * @type {Array}
 */
Creep.prototype.resourseRooms = [];

Creep.prototype.dest = undefined;
