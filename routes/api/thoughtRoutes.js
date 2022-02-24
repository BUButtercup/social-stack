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
        const response = await Thought.create(req.body, async (err, result)=>{
            if(response){
                const resp = await User.findOneAndUpdate(
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
        });
    } catch (err) {
        res.status(500).json(err);
    }
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
            console.log(`User #${req.params.id} and their associated thoughts were deleted.`);
            res.status(200).json(result);
        } else {
            res.status(404).json({message:`No used with id#${req.params.id} found!`})
        }
    })
})

module.exports = router;