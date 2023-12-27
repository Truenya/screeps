const {isNorm} = require("./utils");
const {actions} = require("./actions");

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

function processActionsInRoom(room) {
    const creeps = Memory.rooms[room].creeps;
    for (const name in creeps) {
        const creep = creeps[name];
        if (isNorm(Game.creeps[name])) {
            //запуск action'ов
            //TODO убрать тут экшены, оставить только работу с памятью
            actions[creep.role].run(Game.creeps[name]);
            continue;
        }

        Memory.population[this.name][creep.role]--;
        if (Memory.population[this.name][creep.role] < 0) {
            Memory.population[this.name][creep.role] = 0;
        }

        if (Memory.rooms[room].creeps[name].resourceRoomID !== undefined) {
            Memory.resourceRooms[creep.resourceRoomID]--;

            if (Memory.resourceRooms[creep.resourceRoomID] < 0) {
                Memory.resourceRooms[creep.resourceRoomID] = 0;
            }
        }

        delete Memory.rooms[room].creeps[name];
    }
}

function creepActions(){
    for (const room in Memory.rooms){
        processActionsInRoom(room);
    }
}

const claimableRooms = [{name:'W59S5', claimed:false}];

function init(){
    initState();
}

exports.init = init;
exports.claimableRooms = claimableRooms;
exports.creepActions = creepActions;