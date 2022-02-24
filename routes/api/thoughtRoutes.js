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
        } 
    }).populate('reactions')
    .select('-__v');
    
});

//get one thought by ID
router.get('/:id', (req, res)=>{
    Thought.findOne({_id: req.params.id}, (err, result) =>{
        if(err){
            res.status(500).json({message: `There was an error!!${err}`})
        }
        if(!result){
            res.status(404).json({message: `There was no thought with id ${req.params.id}`})
        }
        if(result){
            res.status(200).json(result);
        } 
    }).populate('reactions')
    .select('-__v')
    
});

//create new thought and associate w/ user
router.post('/new/:userId', async (req, res)=>{     
    // thoughtText
    // username
    // userId
    try{
        const response = await Thought.create(req.body)
            if(response){
                const resp = User.findOneAndUpdate(
                    //where
                    {_id: req.params.userId},
                    //new value
                    {$addToSet: {thoughts: response._id}},
                    //send back new
                    {new: true}
                )
                if(resp){
                    res.status(200).json(response)
                }
                if(!resp){
                    res.status(404).json({message: `No user with ID# ${req.params.userId} found.`})
                } 
            }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.post('/:id/reactions', (req, res)=>{
    Thought.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //new value: reactionBody & username
        {$addToSet: {reactions: req.body}},
        //send back new
        {new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json(err);
            }
            if(!response){
                res.status(404).json({message:`A thought with ID# ${req.params.id} could not be found.`})
            }
            if(response){
                console.log(`Reaction was added!`)
                res.status(200).json(response)
            }
        }
    )
})

//edit a thought by id
router.put('/edit/:id', (req, res)=>{
    Thought.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //new value
        {thoughtText: req.body.thoughtText},
        //send back new
        {new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json(err);
            }
            if(response){
                console.log(`Thought was updated!`)
                res.status(200).json(response)
            }
        }
    )
    .populate('reactions')
    .select('-__v');
})


//delete a thought
router.delete('/delete/:id', (req, res)=>{
    Thought.findOneAndDelete({_id: req.params.id}, (err, result)=>{
        if(err){
            console.log(`Something went wrong! error: ${err}`);
            res.status(500).json({message: ` There was a problem!: ${err}`});
        }
        if(result){
            // Reactions.deleteMany({ _id: { $in: result.thoughts}});
            User.findOneAndUpdate(
                {thoughts: req.params.id},
                {$pull: {thoughts: req.params.id}},
                {new: true})
            console.log(`Thought #${req.params.id} was deleted.`);
            res.status(200).json(result);
        } else {
            res.status(404).json({message:`No thought with id#${req.params.id} found!`})
        }
    })
})

router.delete('/:id/reactions/:reactionId', (req, res)=>{
    Thought.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //pulling out the reaction from the array
        {$pull: {reactions: {_id: req.params.reactionId}}},
        //send back new
        {new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json(err);
            }
            if(!response){
                res.status(404).json({message:`A thought with ID# ${req.params.id} could not be found.`})
            }
            if(response){
                console.log(`Reaction was deleted!`)
                res.status(200).json(response)
            }
        }
    )
})

module.exports = router;