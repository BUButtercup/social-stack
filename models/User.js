const { Schema, model } = require('mongoose');

// Schema to create Post model
const userSchema = new Schema(
  {
    
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required!'],
        trim: true
    },
    email: {
        type: String,
        validate: {
            validator: v => {
                return /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(v)
            },

        },
        required: [true, 'Email is required!'],
        unique: true,
    },
    thoughts: [{ type: Schema.Types.ObjectId, ref: 'thought' }],
    friends: [{type: Schema.Types.ObjectId, ref: 'user' }]
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

// userSchema.pre('save', function(){
//     const trimmedUN = username.trim();
//     return trimmedUN;
// })

const User = model('user', userSchema);

// User.on('index', function(err) { // <-- Wait for model's indexes to finish
//     if(err){throw err};
//     User.create([{ username: 'Val' }, { username: 'Val' }], function(err) {
//       console.log(err);
//     });
//   });

// Create a virtual property `commentCount` that gets the amount of comments per post
// postSchema.virtual('commentCount').get(function () {
//   return this.comments.length;
// });

// Initialize our Post model


module.exports = User;