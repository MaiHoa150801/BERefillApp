const ValidatePhone = async (phoneNumber) => {
    var phoneno = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (phoneNumber.match(phoneno)) {
        return true;
    }
    else {
        return false;
    }
};

module.exports = ValidatePhone;