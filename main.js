require('proto.Creep');
require('proto.Spawn');
require('proto.Tower');
require('proto.Link');

require('populationSettings'); // настройки популяции
require('harvesterLDSettings');//настройки харвестеров на длинные дистанции
const tc = require('towerController');
const lc = require('linksControler')
const cc = require('creepController')
const cache = require('cache');
//region links settings
const linkSettings = require('linkSettings');
Memory.linkSettings = {};
Memory.linkSettings = linkSettings;
//endregion

module.exports.loop = function () {
    cache.init();
    console.log('tick: ' + Game.time);
    tc.towerActions();
    // console.log(JSON.stringify(Game.spawns, null, 2)) ;

    for (let spawn in Game.spawns) {
        Game.spawns[spawn].populationControl();
    }

    lc.linkActions();
    cc.creepActions();
    cache.clearDeadCreeps();
};