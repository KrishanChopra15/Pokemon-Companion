"use strict";

const fs=require("fs");
const path=require("path");


class MoveTargetsGenerator {


generate(){


const targets=[

{
 id:0,
 constant:"MOVE_TARGET_SELECTED",
 name:"Selected Pokémon"
},

{
 id:1,
 constant:"MOVE_TARGET_DEPENDS",
 name:"Depends on move"
},

{
 id:2,
 constant:"MOVE_TARGET_USER_OR_SELECTED",
 name:"User or Selected Pokémon"
},

{
 id:4,
 constant:"MOVE_TARGET_RANDOM",
 name:"Random Pokémon"
},

{
 id:8,
 constant:"MOVE_TARGET_BOTH",
 name:"All Pokémon"
},

{
 id:16,
 constant:"MOVE_TARGET_USER",
 name:"User"
},

{
 id:32,
 constant:"MOVE_TARGET_FOES_AND_ALLY",
 name:"Foes and Ally"
},

{
 id:64,
 constant:"MOVE_TARGET_OPPONENTS_FIELD",
 name:"Opponent Field"
}

];


const output =
path.join(
process.cwd(),
"database/reference/move-targets.json"
);


fs.writeFileSync(
output,
JSON.stringify(
targets,
null,
4
)
);


console.log(
`Generated ${output}`
);


}


}


module.exports=MoveTargetsGenerator;