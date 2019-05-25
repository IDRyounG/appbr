const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new Schema({
    name: {type: "String", required: true},
    email: {type: "String", required: true},
    expirationDate: {type: "Date", required: true},
    validationCode: {type: "String", required: true},
},{collection: 'Invitations'})

module.exports = mongoose.model('Invitation', InvitationSchema)