require('proto.Creep');
require('proto.Spawn');
require('proto.Tower');
require('proto.Link');

require('populationSettings'); // настройки популяции
require('harvesterLDSettings');//настройки харвестеров на длинные дистанции

//region добавление настроек в память
const noticeSettings = require('noticeSettings');
Memory.noticeSettings = {};
Memory.noticeSettings = noticeSettings;
//endregion

//region links settings
const linkSettings = require('linkSettings');
Memory.linkSettings = {};
Memory.linkSettings = linkSettings;
//endregion
module.exports.loop = function () {
    //region башни
    let towersCount = 0;
    let towers = _.filter(Game.structures, function (s) {
        towersCount++;
        return s.structureType === STRUCTURE_TOWER
    });

    if (towers) {
        let i = 1;
        for (let tower of towers) {

            if(towersCount>1){

                if(i % 2 === 1){
                    tower.defend();
                    tower.doRepair();
                }
                else{
                    //TODO поправить, что при использовании тавера может ложиться весь луп
                    tower.doRepair();
                }
            }
            else{
                if(!tower.defend()){
                    tower.doRepair();
                }
            }
            i++;
        }
    }
    //endregion

    for (let spawn in Game.spawns) {
        // if()
        // console.log("Спавним крипов");
        Game.spawns[spawn].populationControl();
    }

    //region lnks
    if (Memory.linkSettings !== undefined ) {
        for (let room in Memory.linkSettings) {
            if(Memory.linkSettings[room].length > 0){
                for(let id in Memory.linkSettings[room]){
                    let targetFrom;
                    let targetTo;
                    if(Memory.linkSettings[room][id]['fromID'] !== undefined && Memory.linkSettings[room][id]['toID'] !== undefined){
                        targetFrom =  Game.getObjectById(Memory.linkSettings[room][id]['fromID']);
                        targetTo =  Game.getObjectById(Memory.linkSettings[room][id]['toID']);
                    }
                    //FIXME
                    // else {
                    //     targetFrom = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['from'][0], Memory.linkSettings[room][id]['from'][1])[0]['structure'];
                    //     if (targetFrom && targetFrom instanceof StructureLink) {
                    //         targetTo = Game.rooms[room].lookAt(Memory.linkSettings[room][id]['to'][0], Memory.linkSettings[room][id]['to'][1])[0]['structure'];
                    //         if (targetTo && targetTo instanceof StructureLink) {
                    //             Memory.linkSettings[room][id]['fromID'] = targetFrom.id;
                    //             Memory.linkSettings[room][id]['toID'] = targetTo.id;
                    //         }
                    //     }
                    // }
                    // targetFrom.sendEnergy(targetTo);
                }
            }
        }
    }
    //endregion
};