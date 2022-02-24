const router = require('express').Router();
const { User, Thought } = require('../../models');


router.get('/', (req, res)=>{
    User.find({}, (err, result) =>{
        if(err){
            res.status(500).json({message: err})
        }
        if(result){
            res.status(200).json(result)
            
        } 
    }).populate('friends')
    .populate('thoughts')
    .select('-__v');
});

router.get('/:userId', (req, res)=>{
    User.findOne({_id: req.params.userId}, (err, result) =>{
        if(err){
            res.status(500).json({message: `There was an error!!${err}`})
        }
        if(!result){
            res.status(404).json({message: `There was no user with id ${req.params.id}`})
        }
        if(result){
            res.status(200).json(result);
        } 
    }).populate('friends')
    .populate('thoughts')
    .select('-__v')
});

router.post('/new', async (req, res)=>{     
    // username
    // email
    // 
    try{
        const response = await User.create(req.body);
        if(response){
            res.status(200).json(response).populate('friends')
            .populate('thoughts')
            .select('-__v')
           
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

router.put('/edit/:id', (req, res)=>{
    User.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //new value
        {
        username: req.body.username,
        email: req.body.email
        },
        //send back new
        {runValidators: true, new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json(err);
            }
            if(!response){
                res.status(400).json({message: `Found no user with ID# ${req.params.id}.`})
            }
            if(response){
                if((req.body.username)&&(response.thoughts.length>0)){
                    response.thoughts.forEach(thought=>{
                        Thought.findOneAndUpdate(
                            //where
                            {_id: thought._id},
                            //new value
                            {username: User.username},
                            //send back new
                            {new: true})
                    })
                    console.log(`User and thought(s) was updated!`)
                    res.status(200).json(response)
                }else{
                    console.log(`User was updated!`)
                    res.status(200).json(response)
                }
            }
        }
    ).populate('friends')
    .populate('thoughts')
    .select('-__v');
})


router.put('/:id/friends/:friendId', (req, res)=>{
    User.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //add new value (friendId) to set
        {$addToSet: {friends: req.params.friendId}},
        //send back new
        {new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json(err);
            }
            if(response){
                console.log(`User was updated!`)
                res.status(200).json(response)
               
            }
        }
    ) .populate('friends')
    .populate('thoughts')
    .select('-__v');
})


router.delete('/delete/:id', (req, res)=>{
    User.findOneAndDelete({_id: req.params.id}, (err, result)=>{
        if(err){
            console.log(`Something went wrong! error: ${err}`);
            res.status(500).json({message: ` There was a problem!: ${err}`});
        }
        if(result){
            Thought.deleteMany({ _id: { $in: result.thoughts}});
            User.findOneAndUpdate(
                {friends: req.params.id},
                {$pull: {friends: req.params.id}},
                {new: true})
            console.log(`User #${req.params.id} and their associated thoughts were deleted.`);
            res.status(200).json(result);
        } else {
            res.status(404).json({message:`No user with id#${req.params.id} found!`})
        }
    })
})

module.exports = router;