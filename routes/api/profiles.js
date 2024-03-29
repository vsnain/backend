var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('../auth');



router.get('/', auth.required, function(req, res, next){
  
  User.findById(req.payload.id)
  .populate('pack')
  .populate('party')
  .populate('commitments')
  .then(function(user){
    if(!user){ return res.json({error:"error"}); }

    console.log(user);
    return res.json({profile: user.toProfileJSONFor(user)});
  });
  
});


router.get('/view', auth.optional,function(req, res, next){
  
    User.findById(req.query.id)
    .populate('pack')
    .populate('party')
    .populate('commitments')
    .then(function(user){
      user.popularity++;
      console.log(user);
      user.save();
      if(!user){ return res.json({profile: user.toProfileJSONFor(false)}); }

      return res.json({profile: user.toProfileJSONFor(user)});
    });
  
});


// Preload user profile on routes with ':username'
// router.param('username', function(req, res, next, username){
//   User.findOne({username: username}).then(function(user){
//     if (!user) { return res.sendStatus(404); }

//     req.profile = user;

//     return next();
//   }).catch(next);
// });



router.get('/:username', auth.optional, function(req, res, next){
  if(req.payload){
    User.findById(req.payload.id).then(function(user){
      if(!user){ return res.json({profile: req.profile.toProfileJSONFor(false)}); }

      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  } else {
    return res.json({profile: req.profile.toProfileJSONFor(false)});
  }
});

router.post('/:username/follow', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.follow(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

router.delete('/:username/follow', auth.required, function(req, res, next){
  var profileId = req.profile._id;

  User.findById(req.payload.id).then(function(user){
    if (!user) { return res.sendStatus(401); }

    return user.unfollow(profileId).then(function(){
      return res.json({profile: req.profile.toProfileJSONFor(user)});
    });
  }).catch(next);
});

module.exports = router;
