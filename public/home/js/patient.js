var socket = io("/patient");
var metaData = null
var requestBtn = document.getElementById("requestBtn");
socket.emit("login",sessionStorage.getItem("username"),sessionStorage.getItem("sID"))
socket.on('loginSuccess',function(meta){
    metaData = meta
    title.innerText = `${metaData.firstName}'s Dashboard`
    setup();
    chatSetup();
    Swal.fire({
        title: "How are you 'doin today?", 
        text: "Please be honest with your answer.",
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: 'lightcoral',
        confirmButtonText: 'I\'m doing great!',
        cancelButtonText: 'Not so good.'
    }).then((result)=>{
        if(result.value){
            Swal.fire(
                'That\'s great to hear!',
                'Keep up the attitude!',
            );
        }
        else{
            Swal.fire(
                'That\'s not good!',
                'You can always talk to a doctor!',
            );
        }
    });
   
})
socket.on('loginFail',function(){
    sessionStorage.clear()
    location.href="../index.html"
})





var divs = ["home","appointments","chat","medication"]
function change(open){
    divs.forEach(function(div){
        if(div == open){
            document.getElementById(div).classList.remove("hide")
        }else{
            document.getElementById(div).classList.add("hide")
        }
    })
    
}//onclick="change('patientManager')"

var contactUl = document.querySelector("#contactUl");
var generalUl = document.querySelector("#generalUl");
var medicalUl = document.querySelector("#medicalUl");
var replaceLi = "<li>*</li>"

function moreMedicalInfo(){

}

function setup(){
    createMeds();
    var phone2 = metaData.phone[1] || "None";  
    var med1 = "None"
    try{
        med1 = metaData.healthProfile.medication[0].name;
    }catch(ex){}
    var med2 = "None";  
    try{
        med2 = metaData.healthProfile.medication[1].name
    }
    catch(ex){}
    var contactUlData = [
        "Phone #1: " + metaData.phone[0],
        "Phone #2: " + phone2,
        "Full Name: " + metaData.firstName + " " + metaData.lastName,
        "Email: " + metaData.email
    ];
    var generalUlData = [
        "Weight: " + metaData.healthProfile.weight,
        "Height: " + metaData.healthProfile.height,
        "Age: " + metaData.healthProfile.age,
        "DOB: " + metaData.healthProfile.dob
    ];
    var medicalUlData = [
        "Blood Type: " + metaData.healthProfile.bloodtype,
        "Med #1: " + med1,
        "Med #2: " + med2,
        "<a onclick='moreMedicalInfo();'>View More Information</a>"
    ];
    contactUlData.forEach(function(item){
        var next = replaceLi.replace("*", item);
        contactUl.innerHTML = contactUl.innerHTML + next;
    });
    generalUlData.forEach(function(item){
        var next = replaceLi.replace("*", item);
        generalUl.innerHTML = generalUl.innerHTML + next;
    });
    medicalUlData.forEach(function(item){
        var next = replaceLi.replace("*", item);
        medicalUl.innerHTML = medicalUl.innerHTML + next;
    });
    spinner.classList.add("hide")
}

// Medications
var medContainer = document.getElementById("med-container");
var medCard = `<div class="card"> <div class="card-body"> <h4 class="card-title">[MEDNAME]</h4> <hr> <h6 class="font-weight-light"> <b class="font-weight-bold">Doctor's Note: </b>[MEDNOTE]</h6><hr> <h6 class="font-weight-light"> <b class="font-weight-bold"> Dosage Schedule: </b> <ul> <li> Morning: [DOSE1] Dose(s) </li> <li> Afternoon: [DOSE2] Dose(s) </li> <li> Evening: [DOSE3] Dose(s) </li> </ul> </h6> </div> </div>`
function createMeds(){
    createAppts();
    metaData.healthProfile.medication.forEach((item)=>{
        var tmpCard = medCard;
        tmpCard = tmpCard.replace("[MEDNAME]", item.name).replace("[MEDNOTE]", item.notes).replace("[DOSE1]", item.dosage[0]).replace("[DOSE2]", item.dosage[1]).replace("[DOSE3]", item.dosage[2]);
        medContainer.innerHTML = medContainer.innerHTML + tmpCard;
    });
}

// appointments
var apptContainer = document.getElementById("appointment-container");
var apptCard = '<div class="card card-inline" style="min-width:250px"><div class="card-header"><h4 style="margin-bottom:0;text-align:center" class="card-title">[APPTITLE]</h4></div><div class="card-body"><h5 style="margin-bottom:0;text-align:center" class="card-title font-weight-light"><b class="font-weight-bold">Date: </b>[APPDATE]</h5><hr><h6 class="font-weight-light"><b class="font-weight-bold">Doctor\'s Notes: </b>[APPNOTES]</h6></div><div class="card-footer" style="text-align:center"></div></div>'
function createAppts(){
    metaData.appointments.forEach((item, index)=>{
        var tmpCard = apptCard;
        tmpCard = tmpCard.replace("[APPTITLE]", item.name).replace("[APPDATE]", item.date).replace("[APPNOTES]", item.notes).replace("[INDEX]", index).replace("[INDEX]", index);
        apptContainer.innerHTML = apptContainer.innerHTML + tmpCard;
    });
}

//Chat
function chatSetup(){
    requestBtn.addEventListener('click', requestChat)
}
function requestChat(){
    requestBtn.disabled = true
    requestBtn.classList.add('disabled')
    socket.emit('requestChat', metaData.doctor,metaData.firstName,metaData.lastName,metaData.id)
    Swal.fire({
        type: 'success',
        title: 'Chat Request Sent',
        text: `A request to chat with your doctor was sent, if they are online they will be able to chat with you`
      })
}

socket.on('acceptChat',function(){
    Swal.fire({
        type: 'success',
        title: 'Chat Request Accepted',
        text: `You can now chat with your doctor!`
      })
      document.getElementById('chats').classList.remove('hide')
})