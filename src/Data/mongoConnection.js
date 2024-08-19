const mongoose = require('mongoose');

const connectToDB = async () => {
  const options = {};
  const URI = process.env.MONGODB_URI;
  const conn = await mongoose.connect(URI, options);

  const ItemsSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['file', 'folder'] },
    mimeType: { type: String }, // Only for files
    files: [{ type: String }], // Only for folders
    subfolders: [{ type: String }], // Only for folders
    owner: { type: String },
    trashed: { type: Boolean, default: false },
    createdAt: {type: Date}

  });

  // Middleware to remove empty arrays
  ItemsSchema.pre('validate', function(next) {
    if (this.type === 'file') {
      this.files = undefined;
      this.subfolders = undefined;
    }

    if (this.type === 'folder') {
      this.mimeType = undefined;
      this.owner = undefined;
    }
    next();
  });

  let itemsModel = null;

  try {
    itemsModel = conn.model('items');
  } catch (err) {
    itemsModel = mongoose.model('items', ItemsSchema);
  }

  return itemsModel;
};

// Export the async function
module.exports = connectToDB;