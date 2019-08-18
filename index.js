var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var CryptoJS = require("crypto-js");
var SHA256 = require("crypto-js/sha256");
var port = process.env.port || 3000;
var jsonstore = require('jsonstore.io')
const databaseurl = "c7649205f071d96627c9fdacb360e21874ad543f9b7a70c71bccf55ac9a921e8"
const key = "gg.gg"
let store = new jsonstore(databaseurl)
app.use(express.static('public'));


app.get('/', function (req, res) {
  res.sendFile('index.html');
});




io.on('connection', function (socket) {

  //This is login
  socket.on('login', function (username, password, type) {
    var hash = SHA256(username).toString()
    var hashPassword = SHA256(password).toString()
    var found = false
    store.read(type).then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, key);
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.forEach(function (p, i) {

        if (p.username == hash) {
          if (p.password == hashPassword) {
            found = true
            socket.emit('loginSuccess', p.metadata)
          } else {

            socket.emit('loginFail')
          }
        } else if (i == data.length - 1) {

          if (found) {
            return;
          }
          socket.emit('loginFail')
        }




      })
    })

  })
  socket.on('signup', function (obj) {
    obj.username = SHA256(obj.username).toString()
    obj.password = SHA256(obj.password).toString()
    var id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    obj.id = id
    obj.metadata.id = id
    store.read('patient').then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, "gg.gg");
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.push(obj)
      var dataReEnc = CryptoJS.AES.encrypt(JSON.stringify(data), key);
      store.write('patient', dataReEnc.toString())
      socket.emit('signupSuccess')

    })

  })

})
///patient dashboard
var patientDash = io.of('/patient')
patientDash.on('connection', function (socket) {
  socket.on('login', function (username, password) {
    console.log("login")
    var hash = SHA256(username).toString()
    var hashPassword = SHA256(password).toString()
    var found = false
    store.read("patient").then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, key);
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.forEach(function (p, i) {

        if (p.username == hash) {
          if (p.password == hashPassword) {
            found = true
            socket.emit('loginSuccess', p.metadata)
            socket.join(p.metadata.id)
        
          } else {

            socket.emit('loginFail')
          }
        } else if (i == data.length - 1) {

          if (found) {
            return;
          }
          socket.emit('loginFail')
        }




      })
    })

  })
  socket.on('requestChat', function(id,f,l,uid){
    console.log(uid)
    doctor.to(id).emit('requestChat',f,l,uid)
  })
  socket.on('sendMsg',function(id,msg){
    console.log(`${id},${msg}`)
    doctor.to(id).emit('chat',msg)
  })
})
///doctor dashboard
var doctor = io.of('/doctor')
doctor.on('connection', function (socket) {
  socket.on('login', function (username, password) {

    var hash = SHA256(username).toString()
    var hashPassword = SHA256(password).toString()
    var found = false
    store.read("doctor").then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, key);
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.forEach(function (p, i) {

        if (p.username == hash) {
          if (p.password == hashPassword) {
            found = true
            store.read("patient").then((dataEnc) => {
              var bytes = CryptoJS.AES.decrypt(dataEnc, key);
              var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
              socket.emit('loginSuccess', p.metadata, data)
              socket.join(p.id)
            })
            
          } else {

            socket.emit('loginFail')
          }
        } else if (i == data.length - 1) {

          if (found) {
            return;
          }
          socket.emit('loginFail')
        }




      })
    })

  })
  socket.on('acceptChat', function(id){
    patientDash.to(id).emit('acceptChat')
  })
  socket.on('sendMsg',function(id,msg){
    console.log(`${id},${msg}`)
    patientDash.to(id).emit('chat',msg)
  })
  socket.on('editApp',function(uid,edited){
    console.log("recived")
    store.read("patient").then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, key);
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.forEach(function (p, i) {
        console.log(p.metadata.id)
        console.log(uid)
        if(p.metadata.id == uid){
          console.log("editing app..")
          p.metadata.appointments[0].name = edited[0]
          p.metadata.appointments[0].notes = edited[1]
          
          var dataReEnc = CryptoJS.AES.encrypt(JSON.stringify(data), key);
          store.write('patient', dataReEnc.toString())
        }



      })
    })
  })
  socket.on('editPat',function(uid,edited){
  
    store.read("patient").then((dataEnc) => {
      var bytes = CryptoJS.AES.decrypt(dataEnc, key);
      var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
      data.forEach(function (p, i) {
        console.log(p.metadata.id)
        console.log(uid)
        if(p.metadata.id == uid){
       
          p.metadata.email = edited[0]
          p.metadata.phone[0] = edited[1]
          p.metadata.phone[1] = edited[2]
          p.metadata.healthProfile.age = edited[3]
          p.metadata.healthProfile.bloodtype = edited[4]
          p.metadata.healthProfile.dob = edited[5]
          p.metadata.healthProfile.weight = edited[6]
          p.metadata.healthProfile.medication[0].name = edited[7]
          p.metadata.healthProfile.medication[0].notes = edited[8]
          p.metadata.healthProfile.medication[0].dosage[0] = edited[9]
          p.metadata.healthProfile.medication[0].dosage[1] = edited[10]
          p.metadata.healthProfile.medication[0].dosage[2] = edited[11]
          
          
          
          var dataReEnc = CryptoJS.AES.encrypt(JSON.stringify(data), key);
          store.write('patient', dataReEnc.toString())
        }



      })
    })
  })
})







http.listen(3000, function () {
  console.log('listening on ' + port.toString());
});
store.write('patient',"U2FsdGVkX19Itm4Jp9CJeVMFD0kVhdPjOBd3W7/3yQV+a8GpUvQHQ6cQUozZ7CVNTLc6NpoAqqzyw16/w8QRunQMat9xARcXI61SwA0IOr/TqOXEqy7YcPQZRo0jmKzI0HOGwLT3ta6u/IFs+xKXRootCdafAvdUFruyqYQeC8XNLmiec8TmlIewGM0eG8GUQQ6EhgmNrjbFJwRHKTvePWwfChgTjzfMzkIaFh0SjDNhuPqO3SSQ94+gEtjq6uijxeES3JQMhwJDJGOYdtFTRysD8TdukB8jLZyK/E1MQNIyt48bbKBc8SUC8Zmjb/dyB78kTjRXOzni0aHZSpTHzASCnx6YRRPvCbvmo6H88Y7/aiXN5K913YHu6hFfOivKcCyetSY9jzOxsI4wR8Mybamf0OtQd2EkA6yX68FW4NMYRx7aqFtZPbiBCkZ4mZs70453l6LksGNsRb4+mrzt38QvuqaXDn89GF79sNnxSGTQC8fBrU+DWFEk+XEuuuN/udaHDcxE8WD3MufLrty57cyR/qKqvRQPRUtcQfQa0krx3/ArVvlsq6HPtJyy6sPcscA8YQE/rXKBcAzWcN73CElpuztnCkmsz3wQHB8D3XC9VzpnuyQO7Wa9nHASmgz/io082GZG+yGsrlie4HSuU9g75uSK4oQ9wlCmWH66mnwe3m/+aPdj+boBOaj8GsPmqUNGVBmLzQOwxb8PIKVdOXDmIEClHuTSJaQPmaABZ/wo2cCbysqI5yrPSDCbbSK7AmrkDWVwWNICydcAoxVgTXc7j46aQMwNR3iKjMLZMZMZ+dk/gb8CUvlUzuRdv4aECUIlDAZuGl8rss5qlq5ro+ooFSbvOOEuL4yb5gqvUm+dkeQh8KJtMGMGi8T6adIAPmbtxMNZzyzjtBxbjNpTCju1tW3eP88uM7XTauw5QNI=")

