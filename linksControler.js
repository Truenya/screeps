/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('linksControler');
 * mod.thing == 'a thing'; // true
 */

const {isNorm} = require("./utils");

function getTargets(currentRoom, room, id) {
    if (isNorm(currentRoom['fromID']) && isNorm(currentRoom['toID'])) {
        // already saved ids
        const targetFrom = Game.getObjectById(Memory.linkSettings[room][id]['fromID']);
        const targetTo = Game.getObjectById(Memory.linkSettings[room][id]['toID']);

        return {targetFrom, targetTo};
    }

    let targetFrom = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['from'][0], Memory.linkSettings[room][id]['from'][1])[0]['structure'];
    let targetTo = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['to'][0], Memory.linkSettings[room][id]['to'][1])[0]['structure'];
    Memory.linkSettings[room][id]['fromID'] = targetFrom.id;
    Memory.linkSettings[room][id]['toID'] = targetTo.id;
    targetTo = Game.getObjectById(targetTo.id);
    targetFrom = Game.getObjectById(targetFrom.id);
    return {targetFrom, targetTo};
}

module.exports = {
    towerActions:function(){
        if (!isNorm(Memory.linkSettings)) {
            return;
        }

        for (const room in Memory.linkSettings) {
            if(Memory.linkSettings[room].length === 0){
                continue;
            }

            for(const id in Memory.linkSettings[room]) {
                const currentRoom = Memory.linkSettings[room][id];
                const {targetFrom, targetTo} = getTargets(currentRoom, room, id);
                targetFrom.sendEnergy(targetTo);
            }
        }
    }
};