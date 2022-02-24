const router = require('express').Router();
const { User, Thought } = require('../../models');

//get all thoughts
router.get('/', (req, res)=>{
    Thought.find({}, (err, result) =>{
        if(err){
            res.status(500).json({message: `There was an error: ${err}`})
        }
        if(result){
            res.status(200).json(result)
            .populate('reactions')
            .select('-__v');
        } 
    })
    
});

//get one thought by ID
router.get('/', (req, res)=>{
    Thought.find({}, (err, result) =>{
        if(err){
            res.status(500).json({message: `There was an error: ${err}`})
        }
        if(result){
            res.status(200).json(result)
            .populate('reactions')
            .select('-__v');
        } 
    })
    
});

module.exports = router;