// Template to replace values with:
const messageTemplate = '<div class="message {sender}"><div data-time="{time}" class="contain">{messageBody}</div></div>'; 

var messageContainer = document.getElementById("messagebox");
var patID = null
// Show a message in the UI.
function createMessage(sender, messageBody){
    var tmp = messageTemplate; // Make a copy of the template
    tmp = tmp.replace("{sender}", sender); // Bot Or User Sending Message?
    tmp = tmp.replace("{messageBody}", messageBody); // Message Text
    var date = new Date();
    var hoursAM = convertHours(date.getHours());
    var timeString = (hoursAM[0] + ":" + date.getMinutes() + " " + hoursAM[1]);
    tmp = tmp.replace("{time}", timeString);
    var e = document.createElement("div")
    e.innerHTML = tmp;
    messageContainer.appendChild(e)
    messageContainer.lastElementChild.style.opacity = "1";
    messageContainer.lastElementChild.scrollIntoView();
    
}

// Call user function
var input = document.getElementById("message");

function userMessage(text){
    if(text.trim() == "") return false;
    var escaped = he.encode(text);
    createMessage("user", escaped);
    return true;
}

document.getElementById("send").onclick = ()=>{
    socket.emit('sendMsg',patID,input.value.trim())
    if(userMessage(input.value)){
        input.value = "";
    }
    
}

input.onkeydown = (ev)=>{
    if(ev.key == "Enter" || ev.code == "Enter"){
        document.getElementById("send").click();
    }
}

// utils
function convertHours(hours){
    if(hours > 12) return [hours - 12, "PM"];
    if(hours == 12) return [12, "PM"];
    if(hours == 0) return [12, "AM"];
    if(hours < 12) return [hours, "AM"];
}

// starting code
socket.on('requestChat',function(f,l,uid){
    var e = document.createElement("div")
    e.classList.add('card')
    e.classList.add('card-inline')

    e.innerHTML = `<div class="card-body"> <h5 class="card-title">${f} ${l}</h5> <h6 class="card-subtitle mb-2 text-muted">Would Like To Chat</h6> <button class="btn btn-success" onclick="acceptChat(this,'${uid}')">Accept</button> </div>`
    document.getElementById('requests').appendChild(e);
    document.getElementById("chatreqnum").innerText = parseInt(document.getElementById("chatreqnum").innerText) + 1;
    Swal.fire({
        type: 'info',
        title: 'Chat Request',
        text: `${f} ${l} Sent a request to chat with you`,
        footer: '<a style="color:blue;"onclick="change(\'chat\')">Click here to view</a>'
      })

})
function acceptChat(requestBtn,id){
    console.log(id)
    requestBtn.parentElement.parentElement.parentElement.parentElement.removeChild(requestBtn.parentElement.parentElement.parentElement)
    socket.emit('acceptChat', id)
    patID = id
    document.getElementById('chats').classList.remove('hide')
}
socket.on("chat",function(msg){
    createMessage("bot",msg)
})
