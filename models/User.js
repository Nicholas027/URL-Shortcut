const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema({
  userName: {
    type: "string",
    lowercase: true,
    required: true,
  },
  email: {
    type: "string",
    lowercase: true,
    required: true,
    unique: true,
    index: { unique: true },
  },
  password: {
    type: "string",
    required: true,
  },
  tokenConfirm: {
    type: "string",
    default: null,
  },
  cuentaConfirmada: {
    type: "boolean",
    default: false,
  },
  imagen: {
    type: String,
    default: null,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
