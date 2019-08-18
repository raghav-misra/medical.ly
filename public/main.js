var socket = io();
var spinner = document.getElementById('spinner')
var errorAlert = document.getElementById('errorAlert')
var currentChoice = "patient";

function login(){
    var radioValue = $("input[name='user']:checked").val();
    if(radioValue){
         currentChoice = radioValue;
    }
    socket.emit(
        "login", 
        document.getElementById("username").value,
        document.getElementById("password").value,
        currentChoice
    );
    spinner.classList.remove("hide")
}
        

//send uername and passwrod to socekt login
//il send back a succes or fail
socket.on('loginSuccess',function(){
    spinner.classList.add("hide")
    errorAlert.classList.add("hide")
    sessionStorage.setItem("login", true);
    sessionStorage.setItem("username",  document.getElementById("username").value);
    sessionStorage.setItem("sID",  document.getElementById("password").value);
    location.href=`home/${currentChoice}.html`
    
})
socket.on('loginFail',function(){
    spinner.classList.add("hide")
    errorAlert.classList.remove("hide")
})



function signup(){
    var template = {
        "metadata": {
          "appointments":[{
            "date": "N/A",
            "name": "Appointments",
            "notes": "This page is where you see your appointments"
          }],
          "email": "CHANtGETHIS",
          "id": "CHANGETHIS",
          "firstName": "CHtANGETHIS",
          "lastName": "CHAtNGETHIS",
          "phone": [],
          "doctor": "OZLJMMiQyP",
          "address": "CHANGtEDIS",
          "healthProfile": {
            "age": 0,
            "bloodtype": "CHANGETHIS",
            "dob": "CHANGETHIS",
            "height": 0,
            "medication": [{}],
            "weight": 0
          }
        },
        "password": "CHtANGETHIS",
        "username": "CHtANGETHIS"
    }
    template.metadata.email = document.getElementById('emailSign').value;
    template.username = document.getElementById('usernameSign').value;
    template.metadata.phone.push(document.getElementById('phoneSign').value);
    template.password = document.getElementById('passwordSign').value;
    template.metadata.firstName = document.getElementById('usernameSign').value;
    template.metadata.address = document.getElementById('addressSign').value;
    template.metadata.lastName = document.getElementById('usernameSign').value;
    template.metadata.healthProfile.age = document.getElementById('ageSign').value;
    template.metadata.healthProfile.bloodtype = document.getElementById('bloodSign').value;
    template.metadata.healthProfile.dob = document.getElementById('dobSign').value;
    template.metadata.healthProfile.weight = document.getElementById('weightSign').value;
    template.metadata.healthProfile.height = document.getElementById('heightSign').value;
    template.metadata.healthProfile.medication[0].name = "None"
    template.metadata.healthProfile.medication[0].notes = "None"
    template.metadata.healthProfile.medication[0].dosage = [0,0,0]
    
    socket.emit("signup", template)
}
socket.on('signupSuccess',function(){
    Swal.fire(
        'Success',
        'You have been signed up!',
        'success'
      )
})