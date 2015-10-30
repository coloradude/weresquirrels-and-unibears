var express = require('express');
var router = express.Router();
var db = require('monk')('mongodb://localhost/unibears-and-weresquirrels')
var unibears = db.get('unibears')
var weresquirrels = db.get('weresquirrels')
var unibearAgreements = db.get('unibear-agreements')
var weresquirrelAgreements = db.get('weresquirrel-agreements')
var colonies = db.get('colonies')
var duels = db.get('duels')
var weresquirrelStats = db.get('weresquirrel-stats')

router.get('/', function(req, res, next) {
  colonies.find({}).then(function(allColonies){
    var promises = [];
    allColonies.forEach(function(colony){
      promises.push(duels.find({ winner: colony._id }))
    })
    Promise.all(promises).then(function(duels){
      var output = [];
      for (var i=0;i<duels.length;i++){
        output.push({ colony: allColonies[i], wins: duels[i].length })
      }
      res.render('index', { colonies : output })
    })
  })
});

router.get('/duel', function(req, res){
  colonies.find({}).then(function(allColonies){
    res.render('duel', {colonies: allColonies})
  })
})

router.post('/duel', function(req, res){
  Promise.all([
    weresquirrelAgreements.findOne({ colony_id: weresquirrelAgreements.id(req.body.colony1)}),
    colonies.findById(req.body.colony1),
    weresquirrelAgreements.findOne({ colony_id: weresquirrelAgreements.id(req.body.colony2)}),
    colonies.findById(req.body.colony2)
    ]).then(function(agreements){
    var results = 
      { 
        colony1: { 
          colony_id: agreements[0].colony_id,
          name: agreements[1].name,
          duelResults: []
        }, 
        colony2: {
          colony_id: agreements[2].colony_id,
          name: agreements[3].name,
          duelResults: []
        }
      }
    agreements[0].weresquirrels_id.forEach(function(squirrel){
      results.colony1.duelResults.push({
        weresquirrel_id: squirrel,
        garlic: Math.floor(Math.random() * 20),
        meat: Math.floor(Math.random() * 20)
      })
    })
     agreements[2].weresquirrels_id.forEach(function(squirrel){
      results.colony2.duelResults.push({
        weresquirrel_id: squirrel,
        garlic: Math.floor(Math.random() * 20),
        meat: Math.floor(Math.random() * 20)
      })
    })
    return results;
  }).then(function(results){
    var colony1Score = 0,
        colony2Score = 0;
    results.colony1.duelResults.forEach(function(result){
      colony1Score += result.garlic
      colony1Score += result.meat
    })
    results.colony2.duelResults.forEach(function(result){
      colony2Score += result.garlic
      colony2Score += result.meat
    })
    results.colony1.score = colony1Score
    results.colony2.score = colony2Score

    var duelId = duels.id(),
        winner_id,
        winnerName;

    if (colony1Score > colony2Score){
      winner_id = results.colony1.colony_id
      winnerName = results.colony1.name
    } else if (colony2Score > colony1Score){
      winner_id = results.colony2.colony_id
      winnerName = results.colony2.name
    } else {
      winner_id = null,
      winnerName = 'Tie'
    }
    res.render('duel-results', {
      colony1: results.colony1, 
      colony2: results.colony2, 
      winnerName: winnerName, 
      winner_id: winner_id
    })
    duels.insert({
      _id: duelId, 
      colony1_id: results.colony1.colony_id, 
      colony2_id: results.colony2.colony_id,
      winner: winner_id 
    })
    for (var colony in results){
      results[colony].duelResults.forEach(function(squirrelResult){
        weresquirrelStats.insert({ 
          weresquirrel_id: squirrelResult.weresquirrel_id, 
          duel_id: duelId,
          meat: squirrelResult.meat, 
          garlic: squirrelResult.garlic
        })
      })
    }
  })
})

router.get('/leaderboard', function(req, res){
  var promises = [],
      names = [],
      condensedStats = [];
  weresquirrels.find({}).then(function(allSquirrels){
    allSquirrels.forEach(function(squirrel){
      promises.push(weresquirrelStats.find({weresquirrel_id: squirrel._id}))
      names.push(squirrel.name)
    })
    Promise.all(promises).then(function(allStats){
      allStats.forEach(function(individualStats, i){
        var totalGarlic = 0,
            totalMeat = 0,
            currentId;
        individualStats.forEach(function(stat){
          totalGarlic += stat.garlic
          totalMeat += stat.meat
          currentId = stat.weresquirrel_id
        })
        weresquirrelAgreements.findOne({weresquirrels_id: currentId}).then(function(agreement){
          return colonies.findById(agreement.colony_id).then(function(colony){
            return { 
                      weresquirrel_id: currentId, 
                      name: names[i],
                      colony_id: colony._id, 
                      colonyName: colony.name, 
                      totalGarlic: totalGarlic, 
                      totalMeat: totalMeat 
                    }
          })
        }).then(function(statAggregate){
          condensedStats.push(statAggregate)
          if (condensedStats.length === allSquirrels.length){
            console.log(condensedStats)
            res.render('leaderboard', { allStats: condensedStats })
          }
        })
      })
    })
  })
})

router.get('/colony/:_id', function(req, res){
  colonies.findById(req.params._id).then(function(colony){
    weresquirrelAgreements.findOne({ colony_id: colony._id }).then(function(agreement){
      weresquirrels.find({_id: { $in: agreement.weresquirrels_id }}).then(function(squirrels){
        var promises = [];
        squirrels.forEach(function(squirrel){
          promises.push(weresquirrelStats.find({weresquirrel_id: weresquirrelStats.id(squirrel._id)}))
        })
        Promise.all(promises).then(function(allResults){
          console.log(allResults)
          var totalMeat = 0,
              totalGarlic = 0;
          allResults.forEach(function(squirrelResults){
            squirrelResults.forEach(function(result){
              totalMeat += result.meat
              totalGarlic += result.garlic
            })
          })
          res.render('colony', { colony: colony, totalMeat: totalMeat, totalGarlic: totalGarlic })
        })
      })
    })
  })
})

// colonies.find({}).then(function(colonies){
//   weresquirrelAgreements.findOne({ colony_id: colonies[0]._id }).then(function(agreement){
//     weresquirrels.find({_id: { $in: agreement.weresquirrels_id }}).then(function(squirrels){
//       console.log(squirrels)
//     })
//   })
// })

// var promises = [],
//     names = [],
//     condensedStats = [];
// weresquirrels.find({}).then(function(allSquirrels){
//   allSquirrels.forEach(function(squirrel){
//     promises.push(weresquirrelStats.find({weresquirrel_id: squirrel._id}))
//     names.push(squirrel.name)
//   })
//   Promise.all(promises).then(function(allStats){
//     allStats.forEach(function(individualStats, i){
//       var totalGarlic = 0,
//           totalMeat = 0,
//           currentId;
//       individualStats.forEach(function(stat){
//         totalGarlic += stat.garlic
//         totalMeat += stat.meat
//         currentId = stat.weresquirrel_id
//       })
//       weresquirrelAgreements.findOne({weresquirrels_id: currentId}).then(function(agreement){
//         return colonies.findById(agreement.colony_id).then(function(colony){
//           return { 
//                     weresquirrel_id: currentId, 
//                     name: names[i],
//                     colony_id: colony._id, 
//                     colonyName: colony.name, 
//                     totalGarlic: totalGarlic, 
//                     totalMeat: totalMeat 
//                   }
//         })
//       }).then(function(statAggregate){
//         condensedStats.push(statAggregate)
//         if (condensedStats.length === allSquirrels.length){
//           console.log(condensedStats)
//         }
//       })
//     })
//   })
// })

// var contestant_ids = ['5633c8ec4e7dc26c4d5f1920', '5633c8ec4e7dc26c4d5f191f']
// var promises = [];

// contestant_ids.forEach(function(contestant){
//   promises.push(weresquirrelAgreements.findOne({ colony_id: weresquirrelAgreements.id(contestant) }))
//   promises.push(colonies.findById(contestant))
// })
// Promise.all(promises).then(function(agreements){
//   var results = 
//     { 
//       colony1: { 
//         colony_id: agreements[0].colony_id,
//         name: agreements[1].name,
//         duelResults: []
//       }, 
//       colony2: {
//         colony_id: agreements[2].colony_id,
//         name: agreements[3].name,
//         duelResults: []
//       }
//     }
//   agreements[0].weresquirrels_id.forEach(function(squirrel){
//     results.colony1.duelResults.push({
//       weresquirrel_id: squirrel,
//       garlic: Math.floor(Math.random() * 20),
//       meat: Math.floor(Math.random() * 20)
//     })
//   })
//    agreements[2].weresquirrels_id.forEach(function(squirrel){
//     results.colony2.duelResults.push({
//       weresquirrel_id: squirrel,
//       garlic: Math.floor(Math.random() * 20),
//       meat: Math.floor(Math.random() * 20)
//     })
//   })
//   return results;
// }).then(function(results){
//   var colony1Score = 0,
//       colony2Score = 0;
//   results.colony1.duelResults.forEach(function(result){
//     colony1Score += result.garlic
//     colony1Score += result.meat
//   })
//   results.colony2.duelResults.forEach(function(result){
//     colony2Score += result.garlic
//     colony2Score += result.meat
//   })
//   results.colony1.score = colony1Score
//   results.colony2.score = colony2Score
  // var duelId = duels.id(),
  //      winner_id,
  //      winnerName; colony1Score > colony2Score ? results.colony1.colony_id : results.colony2.colony_id 
  // if (colony1Score > colony2Score){
  //   winner_id = results.colony1.colony_id
  //   winnerName = results.colony1.name
  // } else if (colony2Score > colony1Score){
  //   winner_id = results.colony2.colony_id
  //   winnerName = results.colony2.name
  // } else {
  //   winner_id = null,
  //   winnerName = 'Tie'
  // }
  //   duels.insert({
  //     _id: duelId, 
  //     colony1_id: results.colony1.colony_id, 
  //     colony2_id: results.colony2.colony_id,
  //     winner: winner_id 
  //   })
  // for (colony in results){
  //   results[colony].duelResults.forEach(function(squirrelResult){
  //     weresquirrelStats.insert({ 
  //       weresquirrel_id: squirrelResult.weresquirrel_id, 
  //       duel_id: duelId,
  //       meat: squirrelResult.meat, 
  //       garlic: squirrelResult.garlic
  //     })
  //   })
  // }
// })

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



// http://psychic-vr-lab.com/deepdream/pics/985434.html 
// http://psychic-vr-lab.com/deepdream/pics/985437.html



/* GET home page. */


module.exports = router;

// This isn't necessarily for the instructors but for the organization as a whole.

// I am super disappointed with the constant swapping and switching of instructors. I feel that Galvanize is not doing everything it should to make sure we get the education we are paying for. One thing I really wanted was to have someone that has seen my work over the course of the 6 months and is able to give me feedback and recommendations on what direction to move in and areas for growth and now I feel that has been robbed of me. 

// We all signed a contract and dropped everything to be here, we committed to 6 months and I expect the same from our instruction team. By the time this is over we will have had something like 10 - 12 different instructors over a 6 month period which frankly is insulting.

// I hope this can be rectified in some way but I personally don't see how that can happen. More than anything I hope this situation will be avoided at all costs in the future because I would hate for anyone else to have go through so much frustration. As of right now the story of my time at Galvanize is filled with dropped initiatives, confusion, and the constant lowering of expectations.

// One specific thing I would like to see that can be implemented quickly is some mechanism for feedback. We've heard from day 1 that Galvanize is aware that students are looking for more feedback and I would like to see something implemented. The extent of feedback that I've received over the last few months is minimal to say the least. I have no idea if I'm developing bad habits that need to be corrected, and I have no idea if and where I might be excelling. If an employer were to ask me today what area I have the most strengths or where I would like to go I wouldn't have an answer for them.
