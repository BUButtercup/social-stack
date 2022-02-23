const { Schema, model } = require('mongoose');

const reactionSchema = new Schema({
    reactionBody: {
        type: String,
        required: [true, 'You have to write something!'],
        max: 280,
    }
})

// Schema to create Post model
const thoughtSchema = new Schema(
  {
    text: String,
    username: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    reactions: [{ type: Schema.Types.ObjectId, ref: 'reaction' }],
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

// Initialize our Post model
const Thought = model('thought', thoughtSchema);

module.exports = Thought;