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
function creepActions(){
    for (let name in Memory.creeps) {
        if (isNorm(Game.creeps[name])) {
            //запуск action'ов
            //TODO убрать тут экшены, оставить только работу с памятью
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
}

const claimableRooms = [{name:'W59S5', claimed:false}];

function init(){
    initState();
}

exports.init = init;
exports.claimableRooms = claimableRooms;
exports.creepActions = creepActions;