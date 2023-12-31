/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('actions');
 * mod.thing == 'a thing'; // true
 */
exports.actions = {
        harvester: require('actionHarvest'),
        upgrader: require('actionUpgrader'),
        builder: require('actionBuilder'),
        repair: require('actionRepaireler'),
        repairWall: require('actionWallRepair'),
        TowerSupply: require('actionTowerSupply'),
        harvesterLD: require('actionHarvestLD'),
        lorry: require('actionLorry'),
        RoomClaimer: require('actionClaimer')
};