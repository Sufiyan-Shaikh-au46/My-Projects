// backend/controllers/itemController.js
import Item from "../models/Item.js";

export const createItem = async (req, res) => {
  const newItem = new Item({ ...req.body, userId: req.user.id });
  await newItem.save();
  res.json(newItem);
};

export const getItems = async (req, res) => {
  const items = await Item.find({ userId: req.user.id });
  res.json(items);
};

export const updateItem = async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

export const deleteItem = async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Item deleted' });
};