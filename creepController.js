/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepController');
 * mod.thing == 'a thing'; // true
 */

// const actions = {
//     harvester: require('actionHarvest'),
//     upgrader: require('actionUpgrader'),
//     builder: require('actionBuilder'),
//     repair: require('actionRepaireler'),
//     repairWall: require('actionWallRepair'),
//     TowerSupply: require('actionTowerSupply'),
//     harvesterLD: require('actionHarvestLD'),
//     lorry: require('actionLorry')
// };
//
// module.exports = {
//     creepActions:function(){
//         for (let name in Memory.creeps) {
//             if (Game.creeps[name] === undefined) {
//                 Memory.population[this.name][Memory.creeps[name].role]--;
//
//                 if(Memory.population[this.name][Memory.creeps[name].role] < 0){
//                     Memory.population[this.name][Memory.creeps[name].role] = 0;
//                 }
//
//                 if (Memory.creeps[name].resourceRoomID !== undefined) {
//                     Memory.resourceRooms[Memory.creeps[name].resourceRoomID] -- ;
//
//                     if(Memory.resourceRooms[Memory.creeps[name].resourceRoomID] < 0){
//                         Memory.resourceRooms[Memory.creeps[name].resourceRoomID] = 0;
//                     }
//                 }
//
//                 delete Memory.creeps[name];
//             }
//             else{
//                 //запуск action'ов
//                 //FIXME  вынести из спавна экшены
//                 actions[Memory.creeps[name].role].run(Game.creeps[name]);
//             }
//         }
//     }
// };