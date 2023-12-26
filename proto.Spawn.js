var utils = require('utils');
const {isNorm} = require("./utils");
/**
 * удаление крипов по роли
 * @param role
 * @constructor
 */
StructureSpawn.prototype.DellCreeps = function (role) {
    let nums = 0;

    for(let name in Game.creeps){
        if(Game.creeps[name].memory.role === role){
            Game.creeps[name].suicide();
            nums++;
        }
    }
    console.log('[notice] -> deleting '+ nums +' creep(s)');
    return '';
};

/**
 * добавить лимит
 * @param role string
 * @param newLimit int
 */
StructureSpawn.prototype.addLimit = function (role,newLimit) {
    if(this.population[role] !== undefined){
        this.population[role]['limit'] = newLimit;
        this.GetPopulation();
    }
    else{
        console.log('[notice]-> unknown role '+role);
    }
    return '';
};

/**
 * убить всех и вся, зачистить память. По сути, сделать ресет крипам. Хард ресет.
 * @returns {string}
 */
StructureSpawn.prototype.killEmAll = function () {

    let nums = 0;
    for(let name in Game.creeps){
        Game.creeps[name].suicide();
        nums++;
    }
    console.log('[notice] -> deleting '+ nums +' creep(s)');
    this.cleanMemoryPopulation();
    this.GetPopulation();
    return '';
};

/**
 * статистика крипов со спавна
 * @returns {string}
 * @constructor
 */
StructureSpawn.prototype.GetPopulation = function () {
    let total = 0;

    if(Memory.population === undefined){
        Memory.population = {};
    }

    for(let role in Memory.population[this.name]){
        let max;
        if(this.population !== undefined){
            if(this.population[role] !== undefined && this.population[role]['limit'] !== undefined){
                max = this.population[role]['limit'];
            }
            else{
                max = '?';
            }
        }
        console.log('[population]-> ', role, ': ', Memory.population[this.name][role] + '/' + max);
        total ++;
    }

    if(total === 0){
        console.log('[notice]-> population is empty!');
    }
    return '';
};

/**
 * Расчистить память счетчиков созданных крипов
 */
StructureSpawn.prototype.cleanMemoryPopulation = function () {
    if(Memory.population !== undefined){
        delete Memory.population;
    }
    console.log('Done');
};

const actions = {
    harvester: require('actionHarvest'),
    upgrader: require('actionUpgrader'),
    builder: require('actionBuilder'),
    repair: require('actionRepaireler'),
    repairWall: require('actionWallRepair'),
    TowerSupply: require('actionTowerSupply'),
    harvesterLD: require('actionHarvestLD'),
    lorry: require('actionLorry')
};

/**
 * контроль рождаемости крипов
 */
StructureSpawn.prototype.populationControl = function () {
    //region контроль популяции
    if (!utils.isNorm(Memory.population)) {
        Memory.population = {};
    }

    if (!utils.isNorm(Memory.population[this.name])) {
        Memory.population[this.name] = {};
    }

    for (let role in this.population) {
        if (!utils.isNorm(Memory.population[this.name][role])) {
            Memory.population[this.name][role] = 0;
        }
    }
    //endregion

    // FIXME: этого тут быть не должно.
    for (let name in Memory.creeps) {
        if (isNorm(Game.creeps[name])) {
            //запуск action'ов
            //FIXME  вынести из спавна экшены
            actions[Memory.creeps[name].role].run(Game.creeps[name]);
            continue;
        }

        // Game.creeps[name] === undefined
        Memory.population[this.name][Memory.creeps[name].role]--;

        if(Memory.population[this.name][Memory.creeps[name].role] < 0){
            Memory.population[this.name][Memory.creeps[name].role] = 0;
        }

        if (Memory.creeps[name].resourceRoomID !== undefined) {
            Memory.resourceRooms[Memory.creeps[name].resourceRoomID] --;

            if(Memory.resourceRooms[Memory.creeps[name].resourceRoomID] < 0){
                Memory.resourceRooms[Memory.creeps[name].resourceRoomID] = 0;
            }
        }

        delete Memory.creeps[name];
    }
    // Вот досюда фиксить
    // console.log(`[population]-> ${this.name} -> ${JSON.stringify(Memory.population[this.name])}`);
    if(this.spawning){
        // console.log('[notice]-> spawning...');
        return;
    }

    if (!isNorm(this.populationPriority)){
        this.populationPriority = ['harvester','lorry', 'builder', 'harvesterLD', 'upgrader', 'repair', 'repairWall', 'TowerSupply', 'RoomClaimer'];
    }

    for (let role in this.populationPriority) {
        // console.log(`[population]-> ${this.name} -> ${this.populationPriority[role]}`);
        role = this.populationPriority[role];
        if (Memory.population[this.name][role] < this.population[role]['limit']) {
            if (this.creepCreate(role)) {
                console.log('[notice]-> spawning ' + role);
                break;
            }
        }
    }
};

/**
 * конструирование тела крипа
 * @param role
 * @returns {Array}
 */
StructureSpawn.prototype.constructCreepBody = function (role) {
    if(!this.population[role] || !this.population[role]['body']){
        console.log('[creepBody]-> role "'+role+'" is undefined, using default [MOVE,CARRY,WORK]');
        return [MOVE,CARRY,WORK];
    }

    let returnBody = [];
    let totalEnergy = this.room.energyAvailable;

    while (totalEnergy > 0){
        for (const bodyPart in this.population[role]['body']) {
            totalEnergy -= BODYPART_COST[this.population[role]['body'][bodyPart]];

            if (totalEnergy >= 0) {
                returnBody[returnBody.length] = this.population[role]['body'][bodyPart];
            }
        }
        // if (!role.includes('harvester')){
        //     break;
        // }
        // Don't use full energy for creeps
        totalEnergy/=3;
    }

    if(totalEnergy < 0){
        returnBody.pop();
    }

    if(returnBody.length < this.population[role]['body'].length){
        returnBody = this.population[role]['body'];
    }
    // console.log('[creepBody]-> role "'+role+'" -> body '+returnBody);

    return returnBody;
};

/**
 * создание крипа по роли
 * @param role
 */
StructureSpawn.prototype.creepCreate = function (role) {
    if(this.spawning){
        console.log(this.spawning);
        return false;
    }
    if(!this.population[role] || !this.population[role]['body']){
        console.log('[create]-> unknown role "' + role +'". Creation aborted');
        return true;
    }

    let creepBody = this.constructCreepBody(role);
    let pref = new Date();

    let tmp = this.canCreateCreep(creepBody, this.population[role]['pref'] + '_'+ pref.getTime());
    if( tmp !== OK){
        console.log('[notice]-> can not create creep: ' + tmp + ', creepBody: ' + creepBody);
        return false;
    }

    let cName = this.createCreep(creepBody,this.population[role]['pref'] + '_'+pref.getTime(),{'role':role,'spawn':this.name});
    if(cName === undefined || !_.isString(cName)){
        console.log('[notice]-> can not create creep, unknown error');
        return false;
    }

    //Game.creeps[cName].memory.spawnID = this.name;
    Game.creeps[cName].memory.roomID = Game.creeps[cName].room.name;
    Memory.population[this.name][role] += 1;
    return true;
};