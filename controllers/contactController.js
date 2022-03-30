const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendEmail = require('../utils/sendEmail');
const ErrorHandler = require('../utils/errorHandler');
const contactModel = require('../models/contactModel');
const validator = require('email-validator');
const sendToken = require('../utils/sendToken');

exports.contactLanding = asyncErrorHandler(async (req, res, next) => {

    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    const subject = req.body.subject;
    if (!email) {
        return next(
            new ErrorHandler('Bạn phải nhập email của bạn', 400)
        );
    }
    if (!name) {
        return next(
            new ErrorHandler('Bạn phải nhập name của bạn', 400)
        );
    }
    if (validator.validate(email) == false) {
        return next(new ErrorHandler('Email không có giá trị!', 400));
    }
    if (!message) {
        return next(
            new ErrorHandler('Vui lòng điền nội dung', 400)
        );
    }

    if (!subject) {
        return next(
            new ErrorHandler('Vui lòng điền tiêu đề', 400)
        );
    }

    await sendEmail(email, subject, message);

    res.status(200).json({
        success: true,
        message: `Email sent to ${req.body.email} successfully`,
    });

});