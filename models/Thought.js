const { Schema, model } = require('mongoose');

const reactionSchema = new Schema({
    reactionBody: {
        type: String,
        required: [true, 'You have to write something!'],
        maxlength: 280,
    },
    username: {
        type: String,
        required: [true, 'Please enter your username.'],
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
})

// Schema to create Post model
const thoughtSchema = new Schema(
  {
    thoughtText: String,
    createdAt: {
        type: Date,
        default: Date.now 
    },
    username: {
        type: String,
        required: [true, 'Please enter your username.']
    },
    reactions: [reactionSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

// Create a virtual property `commentCount` that gets the amount of comments per post
thoughtSchema.virtual('reactionsCount').get(function () {
  return this.reactions.length;
});

// Initialize our Thought model
const Thought = model('thought', thoughtSchema);

module.exports = Thought;