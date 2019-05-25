const userModel =  require('../model/user');
const invitationModel =  require('../model/invitation');
const crypto = require('crypto');
const nodemailer = require('nodemailer')

const registerUser = (req,res)=>{

    let response = {
        emailAlreadyExists:false,
        emailNotSended:false

    }
    let user = req.body;
    user.email = user.email.toLowerCase();

    emailVerfy(user.email,(response)=>{
        console.log(response)
        if(response.valid == true){
            crypto.scrypt(Math.random().toString(),user.email,3,(err,hashPass)=>{
                user.randomPassword = hashPass.toString('hex');
                let dt = new Date();
                dt.setMinutes(dt.getMinutes() + 5);
                
                const invitation = new invitationModel({
                    name:user.name,
                    email:user.email,
                    expirationDate: dt,
                    validationCode:user.randomPassword
                })

                invitation.save();
                sendEmailConfirmation2({name:user.name,email:user.email,validationCode:user.randomPassword},(result)=>{
                if(result.send == true){
                    res.status(200).send({result})
                }else{
                    invitationModel.deleteOne({email:user.email},(err,result)=>{
                        if(result){
                            response.emailNotSended = true;
                            res.status(400).send(response);
                        }
                    })
                    
                }
            })            
            })
        }else{
            response.emailAlreadyExists = true;
            res.status(400).send(response);
        }
    })

}

const sendEmailConfirmation2 = (invitation,callback)=>{
    const mailOptions = {
        from: 'ian.d.rocha@gmail.com',
        to: invitation.email,
        subject: 'E-mail de confirmaçâo',
        text: 'Olá '+ invitation.name + ', seu código de confirmaçâo é: ' + invitation.validationCode,
        send:true
      };

      callback(mailOptions);
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

const sendEmailConfirmation = (user, callback) => {
    let email = user.email;
    let name = user.name;

    let sha256 = crypto.createHash("sha256");
    let validationCode = sha256.update(email + "confirmRegister").digest("hex");

    let emailVariables = { validationCode, name, email }

    sendEmail(emailVariables,(err,result)=>{
        if (err) {
            callback(err)
          } else {
            callback(null,true);
          }
    })
}

const sendEmail = (emailVariables, callback)=>{

    const transporter = nodemailer.createTransport({
        host: "gmail.com",
        auth: {
            user: "ian.d.rocha@gmail.com",
            pass: ""
        },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: 'ian.d.rocha@gmail.com',
        to: emailVariables.email,
        subject: 'E-mail de confirmaçâo',
        text: 'Olá'+ emailVariables.name + 'Seu código de confirmaçâo é:' + emailVariables.validationCode
      };

      transporter.sendMail(mailOptions, function(err, info){
        if (err) {
          callback(err)
        } else {
          callback(null,{sucess:true});
        }
      });

}

const confirmUser = (req,res)=>{
    let response = {
        inviteExpired:false,
        invalidCode:false,
        nonMatchingPasswords:false,
        userCreated:false,
        encryptionError:false,
        noInvitation: false
    }
    let user = req.body;
    user.email = user.email.toLowerCase();

    let dateNow = new Date();
       console.log(req.body);
    invitationModel.findOne({email:user.email},(err, invitation)=>{
        if(invitation == null){
            response.noInvitation = true;
            res.status(400).send(response);
        }else{
            if(dateNow > invitation.expirationDate){
                    invitationModel.deleteOne({email:user.email},(err,result)=>{
                        response.inviteExpired = true;
                        res.status(400).send(response);
                    })
                }else{

                    if(user.code == invitation.validationCode){
                        if(user.password == user.passwordConfirm){
                            crypto.scrypt(user.password.toString(),user.email,32,(err,hashPass)=>{
                                if(err){
                                    response.encryptionError = true;
                                    res.status(400).send(response)
                                }else{
                                    hashPass = hashPass.toString('hex');
                                    const newUser = new userModel({
                                        name:user.name,
                                        email:user.email,
                                        password: hashPass
                                    })

                                    newUser.save();
                                    invitationModel.deleteOne({email:user.email},(err,result)=>{
                                        response.userCreated = true;
                                        res.status(200).send(response)
                                    })
                                }
                                
                            })

                            
                        }else{
                            response.nonMatchingPasswords = true;
                            res.status(400).send(response)
                        }  
                    }else{
                        response.invalidCode = true;
                        res.status(400).send(response)
                    }

                    
                }
        }
    })
}

const login = (req,res)=>{
    let response = {
        encryptionError:false,
        queryError:false,
        wrongPassword:false,
        noMatchingUser:false
    }

    let user = req.body;
    user.email = user.email.toLowerCase();

    crypto.scrypt(user.password.toString(),user.email,32,(err,hashPass)=>{
        if(err){
            response.encryptionError = true;
            res.status(400).send(response);
        }else{
            hashPass = hashPass.toString('hex');
            userModel.findOne({email:user.email,password:hashPass},(err,userFound)=>{
                console.log(user)
                if(err){
                    response.queryError = true;
                    res.status(400).send(response);
                }else if(userFound != null){
                    res.redirect('/index').send(userFound.email);
                }else{
                    userModel.findOne({email:user.email},(err,result)=>{
                        if(result){
                            response.wrongPassword = true;
                            res.status(400).send(response);
                        }else{
                            response.noMatchingUser = true;
                            res.status(400).send(response);
                        }
                    })
                    
                }
            })
        }
    })

    
}

module.exports = {
    registerUser,
    confirmUser,
    login
}