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

module.exports = router;
