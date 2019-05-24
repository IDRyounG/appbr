const userModel =  require('../model/user');
const invitationModel =  require('../model/invitation');
const crypto = require('crypto');
const moment = require('moment');

const registerUser = (req,res)=>{
    let response = {

    }

    let user = req.body;

    emailVerfy(user.email,(response)=>{
        console.log(response)
        if(response.valid == false){
            crypto.scrypt(Math.random().toString(),user.email,32,(err,hashPass)=>{
                user.randomPassword = hashPass.toString('hex');

                const invitation = new invitationModel({
                    name:user.name,
                    email:user.email,
                    randomPassword:user.randomPassword,
                    expirationDate: moment(Date.now()).add(1,'m')
                })

                if(Date.now() > invitation.expirationDate){
                    console.log("Convite expirou")
                }else{
                    console.log(Date.now());
                    console.log(invitation.expirationDate);
                }
                // console.log(invitation.expirationDate);
                // console.log(moment(Date.now()));
                invitation.save();
            })
        }
    })

}


const emailVerfy = (email,callback)=>{
    let response = {
        valid:false,
        error:false
    }

    if(email){
        userModel.findOne({email},(err,result)=>{
            if(result){
                response.valid = false;
                callback(response)
            }else{
                invitationModel.findOne({email},(err,result)=>{
                    if(result){
                        response.valid = false;
                        callback(response)
                    }else{
                        response.valid = true;
                        callback(response)
                    }
                })
            }
        })
    }else{
        response.error = true;
        callback(response)
    }
}



module.exports = {
    registerUser
}