const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new Schema({
    name: {type: "String", required: true},
    email: {type: "String", required: true},
    randomPassword: {type: "String", required: true},
    expirationDate: {type: "Date", required: true},
},{collection: 'Invitations'})

module.exports = mongoose.model('Invitation', InvitationSchema)