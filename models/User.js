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
        required: [true, 'Email is required!'],
        unique: true,
    }
    comments: [{ type: Schema.Types.ObjectId, ref: 'comment' }],
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

User.on('index', function(err) { // <-- Wait for model's indexes to finish
    assert.ifError(err);
    User.create([{ username: 'Val' }, { username: 'Val' }], function(err) {
      console.log(err);
    });
  });

// Create a virtual property `commentCount` that gets the amount of comments per post
// postSchema.virtual('commentCount').get(function () {
//   return this.comments.length;
// });

// Initialize our Post model


module.exports = User;