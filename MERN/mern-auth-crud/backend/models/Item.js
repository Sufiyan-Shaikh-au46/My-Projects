// backend/models/Item.js

import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String
});

export default mongoose.model('Item', ItemSchema);