const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mời nhập tên người dùng'],
  },
  email: {
    type: String,
    unique: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error({ error: 'Định dạng email sai' });
      }
    },
  },
  phone: {
    type: String,
    unique: [true, 'Mời nhập phone của bạn'],
  },
  password: {
    type: String,
    minLength: [8, 'Mật khẩu ít nhất 8 chữ cái'],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
  },
  role: {
    type: String,
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  resetPasswordCode: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  address: {
    type: String,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordCode = async function () {
  // generate token
  const code = await Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
  this.resetPasswordCode = code.toString();
  this.resetPasswordExpire = Date.now() + 2 * 60000;
  return this;
};

module.exports = mongoose.model('User', userSchema);
