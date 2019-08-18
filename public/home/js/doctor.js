var socket = io("/doctor");
var metaData = null

var title = document.getElementById('titleDash')


socket.emit("login", sessionStorage.getItem("username"), sessionStorage.getItem("sID"))
socket.on('loginSuccess', function (meta, patients) {
    patients.forEach(function(data){
        meta2 = data.metadata
        var edi = `
        <div class="card">
        <div class="card-header" id="headingOne">
          <h5 class="mb-0">
            <h1>${meta2.firstName} ${meta2.lastName}</h1>
          </h5>
        </div>
    
        <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
          <div id="${meta2.firstName}-data" class="card-body">
                <ul>
                  <li>Email: <span contenteditable="true">${meta2.email}</span></li>
                  <li>Phone1: <span contenteditable="true">${meta2.phone[0]}</span></li>
                  <li>Phone2:  <span contenteditable="true">${meta2.phone[1]}</span></li>
                  <li>Age:  <span contenteditable="true">${meta2.healthProfile.age}</span></li>
                  <li>Bloodtype:  <span contenteditable="true">${meta2.healthProfile.bloodtype}</span></li>
                  <li>Date Of Birth:  <span contenteditable="true">${meta2.healthProfile.dob}</span></li>
                  <li>Weight:  <span contenteditable="true">${meta2.healthProfile.weight}</span> Pounds</li>
                </ul>
                <h4>Medications</h4>
                <ul
                <li>Name: <span contenteditable="true">${meta2.healthProfile.medication[0].name}</span></li>
                <li>Notes:<span contenteditable="true">${meta2.healthProfile.medication[0].notes}</span></li>
                <li>Morning Dose: <span contenteditable="true">${meta2.healthProfile.medication[0].dosage[0]}</span></li>
                <li>Afternoon Dose: <span contenteditable="true">${meta2.healthProfile.medication[0].dosage[1]}</span></li>
                <li>Evening Dose: <span contenteditable="true">${meta2.healthProfile.medication[0].dosage[2]}</span></li>
             
                <button onclick="saveMetaDataChanges('${meta2.firstName}-data','${meta2.id}')" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>`;
    
    
        var e = document.createElement('div')
        e.innerHTML = edi
        document.getElementById('patientManager').appendChild(e)
        var edi2 = `<div class="card card-inline" style="min-width:250px">
        <div class="card-header">
            <h4 style="margin-bottom:0;text-align:center" id='app-data1' contenteditable="true" class="card-title">${meta2.appointments[0].name}</h4>
            <h5 style="margin-bottom:0;text-align:center" class="card-title">With: ${meta2.firstName} ${meta2.lastName}</h5>
        </div>
        <div class="card-body">
            <h5 style="margin-bottom:0;text-align:center" class="card-title font-weight-light"><b class="font-weight-bold">Date: </b>${meta2.appointments[0].date}</h5>
            <hr>
            <h6 class="font-weight-light"><b class="font-weight-bold">Doctor's Notes: </b><span id='app-data2' contenteditable="true">${meta2.appointments[0].notes}<span></h6>
        </div>
        <div class="card-footer" style="text-align:center"><button onclick="modifyAppt('${meta2.id}')" class="btn btn-success">Modify</button></div>
    </div>`
    
    
    
        var e2 = document.createElement('div')
        e2.innerHTML = edi2
        document.getElementById('appointments').appendChild(e2)
    })
    metaData = meta
    title.innerText = `${metaData.firstName}'s Dashboard`
   
   



     //This should be last
     spinner.classList.add("hide")


})
socket.on('loginFail', function () {
    sessionStorage.clear()
    location.href = "../index.html"
})

var divs = ["home", "appointments", "chat", "patientManager"]

function change(open) {
    divs.forEach(function (div) {
        if (div == open) {
            document.getElementById(div).classList.remove("hide")
        } else {
            document.getElementById(div).classList.add("hide")
        }
    })

}

function saveMetaDataChanges(id,uid){
  var dataObjs = document.getElementById(id).querySelectorAll("span");
  
  var data = [];
  dataObjs.forEach((item,i)=>{
    data.push(item.innerText);
    if(i == dataObjs.length-1){
        Swal.fire(
            'Success',
            'Info Saved',
            'success'
          )
          
        socket.emit('editPat',uid,data)
    }
  });
  
}

function modifyAppt(uid) {
    var idA = ['app-data1', 'app-data2']
    var edited = []
    idA.forEach(function(id,i){
        var span = document.getElementById(id).innerText
        edited.push(span)
     
        if(edited.length == idA.length){
            Swal.fire(
                'Success',
                'Info Saved',
                'success'
              )
            socket.emit('editApp',uid,edited)
   
        }



}); 


}