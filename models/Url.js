const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const { Schema } = mongoose;

const urlSchema = new Schema({
  origin: {
    type: String,
    unique: true,
    required: true,
  },
  shortURL: {
    type: String,
    unique: true,
    required: true,
    default: nanoid(7),
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// urlSchema.pre("save", function (next) {
//     if (!this.shortURL) this.shortURL = nanoid(7);
//     next();
// });

const Url = mongoose.model("Url", urlSchema);
module.exports = Url;
