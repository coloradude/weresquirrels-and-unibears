
// var unibearsSeed = [
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() },
//   { _id: unibears.id() }
// ]

// var weresquirrelsSeed = [
//   { _id: weresquirrels.id(), name: 'Joebob'  },
//   { _id: weresquirrels.id(), name: 'Dingus' },
//   { _id: weresquirrels.id(), name: 'Jackdaw' },
//   { _id: weresquirrels.id(), name: 'Fooper'  },
//   { _id: weresquirrels.id(), name: 'Mandingo' },
//   { _id: weresquirrels.id(), name: 'Pickles' },
//   { _id: weresquirrels.id(), name: 'Euphoria' },
//   { _id: weresquirrels.id(), name: 'KrackerJack' }
// ]

// var coloniesSeed = [
//   { _id: colonies.id(), name: 'Tonka Town' },
//   { _id: colonies.id(), name: 'Auschwitz' }, 
//   { _id: colonies.id(), name: 'Whoville' },
//   { _id: colonies.id(), name: 'Ho Lee Shit' }
// ]

// var unibearAgreementsSeed = [
//   { 
//     _id: unibearAgreements.id(), 
//     colony_id: coloniesSeed[0]._id, 
//     unibears_id: [ unibearsSeed[0]._id, unibearsSeed[1]._id ],
//     length: 2,
//     honey: 4 
//   },
//   { 
//     _id: unibearAgreements.id(), 
//     colony_id: coloniesSeed[1]._id, 
//     unibears_id:[ unibearsSeed[2]._id, unibearsSeed[3]._id ],
//     length: 6,
//     honey: 10 
//   },
//   { 
//     _id: unibearAgreements.id(), 
//     colony_id: coloniesSeed[2]._id, 
//     unibears_id:[ unibearsSeed[4]._id, unibearsSeed[5]._id ],
//     length: 1,
//     honey: 5 
//   },
//   { 
//     _id: unibearAgreements.id(), 
//     colony_id: coloniesSeed[3]._id, 
//     unibears_id:[ unibearsSeed[6]._id, unibearsSeed[7]._id ],
//     length: 9,
//     honey: 2 
//   }
// ]

// var weresquirrelAgreementsSeed = [
//   {
//     _id: weresquirrelAgreements.id(),
//     colony_id: coloniesSeed[0]._id,
//     weresquirrels_id: [weresquirrelsSeed[0]._id, weresquirrelsSeed[1]._id],
//     peanuts: 3049,
//     length: 7
//   },
//   {
//     _id: weresquirrelAgreements.id(),
//     colony_id: coloniesSeed[1]._id,
//     weresquirrels_id: [weresquirrelsSeed[2]._id, weresquirrelsSeed[3]._id],
//     peanuts: 9009,
//     length: 10
//   },
//   {
//     _id: weresquirrelAgreements.id(),
//     colony_id: coloniesSeed[2]._id,
//     weresquirrels_id: [weresquirrelsSeed[4]._id, weresquirrelsSeed[5]._id],
//     peanuts: 112,
//     length: 2
//   },
//   {
//     _id: weresquirrelAgreements.id(),
//     colony_id: coloniesSeed[3]._id,
//     weresquirrels_id: [weresquirrelsSeed[6]._id, weresquirrelsSeed[7]._id],
//     peanuts: 10829,
//     length: 14
//   }
// ]


// var duelsSeed = [
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[0]._id,
//     colony2_id: coloniesSeed[1]._id,
//     winner: coloniesSeed[1]._id
//   },
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[2]._id,
//     colony2_id: coloniesSeed[3]._id,
//     winner: coloniesSeed[2]._id
//   },
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[1]._id,
//     colony2_id: coloniesSeed[3]._id,
//     winner: coloniesSeed[3]._id
//   },
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[0]._id,
//     colony2_id: coloniesSeed[2]._id,
//     winner: coloniesSeed[0]._id
//   },
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[3]._id,
//     colony2_id: coloniesSeed[0]._id,
//     winner: coloniesSeed[3]._id
//   },
//   {
//     _id: duels.id(),
//     colony1_id: coloniesSeed[1]._id,
//     colony2_id: coloniesSeed[2]._id,
//     winner: coloniesSeed[2]._id
//   }
// ]

// var weresquirrelStatsSeed = [
//   { duel_id: duelsSeed[0]._id, weresquirrel_id: weresquirrelsSeed[0]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[3]._id, weresquirrel_id: weresquirrelsSeed[0]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[4]._id, weresquirrel_id: weresquirrelsSeed[0]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[0]._id, weresquirrel_id: weresquirrelsSeed[1]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[3]._id, weresquirrel_id: weresquirrelsSeed[1]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[4]._id, weresquirrel_id: weresquirrelsSeed[1]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[0]._id, weresquirrel_id: weresquirrelsSeed[2]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[2]._id, weresquirrel_id: weresquirrelsSeed[2]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[5]._id, weresquirrel_id: weresquirrelsSeed[2]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[0]._id, weresquirrel_id: weresquirrelsSeed[3]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[2]._id, weresquirrel_id: weresquirrelsSeed[3]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[5]._id, weresquirrel_id: weresquirrelsSeed[3]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[1]._id, weresquirrel_id: weresquirrelsSeed[4]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[3]._id, weresquirrel_id: weresquirrelsSeed[4]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[5]._id, weresquirrel_id: weresquirrelsSeed[4]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[1]._id, weresquirrel_id: weresquirrelsSeed[5]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[3]._id, weresquirrel_id: weresquirrelsSeed[5]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[5]._id, weresquirrel_id: weresquirrelsSeed[5]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[1]._id, weresquirrel_id: weresquirrelsSeed[6]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[2]._id, weresquirrel_id: weresquirrelsSeed[6]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[4]._id, weresquirrel_id: weresquirrelsSeed[6]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[1]._id, weresquirrel_id: weresquirrelsSeed[7]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[2]._id, weresquirrel_id: weresquirrelsSeed[7]._id, garlic: 10, meat: 10 },
//   { duel_id: duelsSeed[4]._id, weresquirrel_id: weresquirrelsSeed[7]._id, garlic: 10, meat: 10 }
// ]

// unibearsSeed.forEach(function(bear){
//   unibears.insert(bear);
// })

// weresquirrelsSeed.forEach(function(squirrel){
//   weresquirrels.insert(squirrel)
// })

// coloniesSeed.forEach(function(colony){
//   colonies.insert(colony)
// })

// unibearAgreementsSeed.forEach(function(agreement){
//   unibearAgreements.insert(agreement)
// })

// weresquirrelAgreementsSeed.forEach(function(agreement){
//   weresquirrelAgreements.insert(agreement)
// })

// duelsSeed.forEach(function(duel){
//   duels.insert(duel)
// })

// weresquirrelStatsSeed.forEach(function(stat){
//   weresquirrelStats.insert(stat)
// })
