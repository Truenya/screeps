const {isNorm} = require("./utils");
const builder = require("./actionBuilder");
const harvester = require("./actionHarvest");

module.exports = {
    run:function(creep){
        if (!isNorm(Memory.rooms)) {
            Memory.rooms = [];
        }
        const room = creep.room.name;
        if (!isNorm(Memory.rooms[room])) {
            Memory.rooms[room] = {};
        }
        // action to claim other rooms
        const targetRoom = 'W59S5'; // Replace with the room you want to claim

        if (creep.room.name !== targetRoom) {
            // Move to the target room
            creep.moveTo(new RoomPosition(25, 25, targetRoom));
            return;
        }

        // Claim the controller
        const controller = creep.room.controller;
        if (!isNorm(controller)) {
            return;
        }

        if (!controller.my){
            const result = creep.claimController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
            return;
        }
        Memory.rooms[room].claimed = true;

        if (creep.memory.harvesting) {
            harvester.run(creep);
            creep.memory.harvesting = creep.store[RESOURCE_ENERGY] < creep.store.getCapacity();
            return;
        }
        creep.memory.harvesting = creep.store[RESOURCE_ENERGY] === 0;
        builder.run(creep);
    }
};