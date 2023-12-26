/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('linksControler');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    towerActions:function(){
        if (Memory.linkSettings !== undefined ) {
            for (let room in Memory.linkSettings) {
                if(Memory.linkSettings[room].length > 0){
                    for(let id in Memory.linkSettings[room]) {
                        let targetFrom;
                        let targetTo;
                        let currentRoom = Memory.linkSettings[room][id];
    
                        if (currentRoom['fromID'] !== undefined && currentRoom['toID'] !== undefined) {
                            targetFrom = Game.getObjectById(Memory.linkSettings[room][id]['fromID']);
                            targetTo = Game.getObjectById(Memory.linkSettings[room][id]['toID']);
                        }
                        //FIXME
                        else {
                            targetFrom = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['from'][0], Memory.linkSettings[room][id]['from'][1])[0]['structure'];
                            if (targetFrom && targetFrom instanceof StructureLink) {
                                targetTo = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['to'][0], Memory.linkSettings[room][id]['to'][1])[0]['structure'];
                                if (targetTo && targetTo instanceof StructureLink) {
                                    Memory.linkSettings[room][id]['fromID'] = targetFrom.id;
                                    Memory.linkSettings[room][id]['toID'] = targetTo.id;
                                }
                            }
                        }
                        targetFrom.sendEnergy(targetTo);
                    }
                }
            }
        }
    }
};