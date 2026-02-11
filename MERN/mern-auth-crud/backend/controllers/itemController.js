// backend/controllers/itemController.js
import Item from "../models/Item.js";

export const createItem = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const newItem = new Item({
      title,
      description: description || "",
      userId: req.user.id,
    });

    await newItem.save();
    return res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    return next(err);
  }
};

export const getItems = async (req, res, next) => {
  try {
    const items = await Item.find({ userId: req.user.id });
    return res.json({ success: true, data: items });
  } catch (err) {
    return next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    return res.json({ success: true, data: item });
  } catch (err) {
    return next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Item.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    return res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    return next(err);
  }
};
