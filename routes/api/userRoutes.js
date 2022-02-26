const router = require('express').Router();
const { User, Thought } = require('../../models');

//get all users
router.get('/', (req, res)=>{
    User.find({}, (err, result) =>{
        if(err){
            res.status(500).json({message: err})
        }
        if(result){
            res.status(200).json(result)
            
        } 
    })
    //to turn on ability to see all users friends and thoughts when get all users
    // .populate('friends')
    // .populate('thoughts')
    // .select('-__v');
});

//get a single user by ID
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


//create new user
router.post('/new', async (req, res)=>{    
    //object specs: 
    // username
    // email 
    try{
        if((!req.body.username && req.body.email)||(req.body.username==='')||(req.body.email==='')){
            res.status(400).json({message: 'Please enter both a username and email.'})
        } else { 
            const response = await User.create(req.body)
            if(response){
                res.status(200).json(response)
            }}
    } catch (err) {
        res.status(500).json({message:`There was an error: ${err}`});
    }
})

//edit user by id
router.put('/edit/:id', (req, res)=>{
    //performs update
    const updateUser = () => {
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
                    res.status(500).json({message: `There was an error: ${err}`});
                }
                if(!response){
                    res.status(400).json({message: `Found no user with ID# ${req.params.id}.`})
                }
                if(response){
                        console.log(`User was updated!`)
                        res.status(200).json(response)
                    // }
                }
            }
        ).populate('friends')
        .populate('thoughts')
        .select('-__v');
    }
    //checks for an email, and whether or not it's formatted correctly (to avoid crashing server with validation error)
    const checkEmail = () => {
        if(req.body.email===''){
            res.status(400).json({message: 'The email you entered does not appear to be formatted correctly. If you intended to update your email, please try again. Otherwise please clear this field.'})
        } else{
            if(req.body.email){
                if(!/^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(req.body.email)){
                    res.status(400).json({message: 'The email you entered does not appear to be formatted correctly. Please try again.'})
                } else {
                    updateUser();
                }
            } else {
                updateUser();
            }
        }
    } 
    //checks for a username, and if it's already being used by someone else (to avoid crashing server with validation error)
    if(req.body.username){
        console.log('req.username', req.body.username)
        if(req.body.username===' '){
            res.status(400).json({message: 'Your username cannot be blank. Try again.'})
        } else {
            User.findOne({username: req.body.username}, (err, result) => {
                if(err){throw err}
                if(result){
                    console.log('user', result)
                    res.status(400).json({message: 'That username already exists. Try again.'})
                } else {checkEmail();}
            })
        }
    } else {checkEmail();}
})

//adds a friend to an existing user's friend array
router.post('/:id/friends/:friendId', (req, res)=>{
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
    ) 
    .populate('friends')
    .populate('thoughts')
    .select('-__v');
})

//deletes a user by id
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

//deletes friend from existing user's friend array
router.delete('/:id/friends/:friendId', (req, res)=>{
    User.findOneAndUpdate(
        //where
        {_id: req.params.id},
        //take an ID value (friendId) from set
        {$pull: {friends: req.params.friendId}},
        //send back new
        {new: true},
        (err, response)=>{
            if(err){
                console.log(`Uhoh! There was an error: ${err}`)
                res.status(500).json({message: `There was an error: ${err}`});
            } else if(!response){
                res.status(404).json({message: 'One of the IDs is not correct. Check them and try again!'});
            } else if (response){
                console.log(`User was updated!`)
                res.status(200).json(response)
            }
        }
    ) 
    .populate('friends')
    .populate('thoughts')
    .select('-__v');
})

module.exports = router;