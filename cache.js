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

const resourceRooms={};

function initResourceRooms(){
    if(Memory.resourceRooms === undefined){
        Memory.resourceRooms = [];
        for(let id in creep.resourseRooms){
            Memory.resourceRooms[id] = 0;
            console.log(id);
        }
    }

    if (creep.memory.resourceRoomID === undefined) {
        for (let id in creep.resourseRooms) {
            if (Memory.resourceRooms[id] < creep.resourseRooms[id]['limit']) {
                creep.memory.resourceRoomID = id;
                Memory.resourceRooms[id] += 1;
                break;
            }
        }
    }
}

function init(){
    initState();
}

exports.init = init;

// function clear() {
//     Memory.structures = undefined;
//     Memory.state = undefined;
// }
//
// function reset() {
//     clear();
//     init();
// }