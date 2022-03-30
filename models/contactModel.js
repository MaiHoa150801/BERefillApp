const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Mời nhập tên người dùng'],
    },
    email: {
        type: String,
        required: [true, 'Mời nhập email người dùng'],
        unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Định dạng email sai' })
            }
        }
    },
    subject: {
        type: String,
        unique: [true, 'Mời nhập tiêu đề của bạn'],
    },
    message: {
        type: String,
        unique: [true, 'Mời nhập nôi dung của bạn'],
    }
});

module.exports = mongoose.model('Contact', contactSchema);
