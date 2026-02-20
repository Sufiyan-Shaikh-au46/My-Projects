const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: {
    type: Array,
    required: true
  },
  groupName: {
    type: String
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupPicture: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
