const {isNorm} = require("./utils");

function initState(){
    if (!Memory.state)
        Memory.state = {};

    if (Memory.state.initialized)
        return;

    Memory.structures = Memory.structures || {};
    for (let s in Game.structures) {
        //getting object by its hash
        const { structureType, pos } = Game.structures[s];
        if (!structureType) continue;
        if (!Memory.structures[structureType]) Memory.structures[structureType] = [];
        if (!Memory.structures[structureType].includes(s))
            Memory.structures[structureType].push(pos);
    }

    Memory.state.initialized = true;
}

function clearDeadCreaps(){
    const creeps = Memory.creeps;
    for (const name in creeps) {
        const creep = creeps[name];
        if (isNorm(Game.creeps[name])) {
            continue;
        }
        const spawn = creep.spawn;
        if (!isNorm(creep.role)|| !isNorm(spawn)) {
            delete Memory.creeps[name];
            continue;
        }
        Memory.population[spawn][creep.role]--;
        if (Memory.population[spawn][creep.role] < 0) {
            Memory.population[spawn][creep.role] = 0;
        }

        if (Memory.creeps[name].resourceRoomID !== undefined) {
            Memory.resourceRooms[creep.resourceRoomID]--;

            if (Memory.resourceRooms[creep.resourceRoomID] < 0) {
                Memory.resourceRooms[creep.resourceRoomID] = 0;
            }
        }

        delete Memory.creeps[name];
    }
}
containersToFill ={
    'W59S5': [
        {
            x: 32,
            y: 32
        }
    ]
};

function isToFill(container){
    return true;
    // if(container.pos.roomName in containersToFill){
    //     const pos = container.pos;
    //     return containersToFill[container.pos.roomName].some(p => p.x === pos.x && p.y === pos.y);
    // }
    // return false;
}

function init(){
    initState();
}

exports.init = init;
exports.clearDeadCreeps = clearDeadCreaps;
exports.isToFill = isToFill;