module.exports = {
    isNorm: function (chtoto) {
        return (chtoto !== null && chtoto !== undefined && chtoto !== 0)
    },

    routeCreep: function (creep, dest) {
        if(creep.fatigue>0){
            return -1;
        }

        if(typeof dest == "undefined"){
            return -1;
        }

        const fromStr = creep.room.name+"."+creep.pos.x+"."+creep.pos.y
        let path = [];

        if(typeof Memory.routeCache !== "object"){
            Memory.routeCache = {};
        }

        if(typeof Memory.routeCache[fromStr] === "undefined"){
            Memory.routeCache[fromStr] = {'dests':{},'established':Game.time}
        }

        if(typeof Memory.routeCache[fromStr]['dests'][''+dest.id] === "undefined"){
            Memory.routeCache[fromStr]['dests'][dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
            path = creep.room.findPath(creep.pos,dest.pos,{maxOps:500,heuristicWeight:2})
            if(typeof path[0] === "undefined"){
                return creep.move(Math.floor(Math.random()*8));
            }

            Memory.routeCache[fromStr]['dests'][''+dest.id][path[0].direction]+=1;
            for(var i =0; i<path.length-1; i++){
                const step = path[i];
                const stepStr = creep.room.name+"."+step.x+"."+step.y//creep.room.name+"."+step.x+"."+step.y
                if(typeof Memory.routeCache[stepStr] === "undefined"){
                    Memory.routeCache[stepStr] = {'dests':{},'established':Game.time,'usefreq':0.0};
                }
                if(typeof Memory.routeCache[stepStr]['dests'][''+dest.id] === "undefined"){
                    Memory.routeCache[stepStr]['dests'][''+dest.id] = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0};
                }
                Memory.routeCache[stepStr]['dests'][''+dest.id][path[i+1].direction]+=1;
            }
        }

        for(var k in Memory.routeCache[fromStr]['dests']){
            if(Game.getObjectById(k)==null){//clean out invalid routes
                delete Memory.routeCache[fromStr]['dests'][k];
            }
        }


        let total = 0.0//pick from the weighted list of steps
        for(let d in Memory.routeCache[fromStr]['dests'][''+dest.id]){
            total += Memory.routeCache[fromStr]['dests'][''+dest.id][d];
        }

        total=total*Math.random();

        let dir = 0;
        for(let d in Memory.routeCache[fromStr]['dests'][''+dest.id]){
            total -= Memory.routeCache[fromStr]['dests'][''+dest.id][d];
            if(total < 0){
                dir = d;
                break;
            }

        }

        // if(creep.pos.getRangeTo(dest)>1 && pathisBlocked(creep.pos,dir)){ //you will need your own "pathisBlocked" function!
        //     dir = Math.floor(Math.random()*8);
        // }

        return creep.move(dir);
    }
}