/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('towerController');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    towerActions:function(){
        let towersCount = 0;
        let towers = _.filter(Game.structures, function (s) {
            towersCount++;
            return s.structureType === STRUCTURE_TOWER
        });
    
        if (!towers) {
            return;
        }
        
        // let i = 1;
        for (let tower of towers) {
            // if(towersCount>1){

            //     if(i % 2 === 1){
            //         tower.defend();
            //         // tower.doRepair();
            //     }
            //     else{
            //         //TODO поправить, что при использовании тавера может ложиться весь луп
            //         tower.doRepair();
            //     }
            // }
            // else{
                if(!tower.defend()){
                    tower.doRepair();
                }
            // }
            // i++;
        }
    }
};