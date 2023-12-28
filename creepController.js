/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creepController');
 * mod.thing == 'a thing'; // true
 */

const {isNorm} = require("./utils");
const {actions} = require("./actions");

module.exports = {
    creepActions:function(){
        for (const name in Memory.creeps) {
            if (isNorm(Game.creeps[name])) {
                const {role} = Memory.creeps[name];
                //запуск action'ов
                //TODO убрать тут экшены, оставить только работу с памятью
                actions[role].run(Game.creeps[name]);
            }
        }
    }
};