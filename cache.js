function init(){
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