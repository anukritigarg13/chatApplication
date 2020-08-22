const socket=io()
//Elements
const $messageForm=document.querySelector('#message')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const msg=e.target.elements.message.value
    //console.log(msg)
    socket.emit('sendMessage',msg,(msg)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(!msg){
            return console.log("Message Delivered!")
        }
        
        alert(msg)
        location.href="/"
    })

})
const autoscroll=()=>{
    //New message element

    const $newMessage=$messages.lastElementChild

    //get the height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin


    //Visible height
    const visibleHeight=$messages.offsetHeight

    //Height of messages container
    const containerHeight=$messages.scrollHeight


    //How far have I scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight


    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }
    console.log(newMessageMargin)

}
socket.on("Message",(msg)=>{
    console.log(msg)
    const html=Mustache.render(messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on("locationMessage",(msg)=>{
    console.log(msg)
    const html=Mustache.render(locationTemplate,{
        username:msg.username,
        link:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
   const html=Mustache.render(sidebarTemplate,{
       room,
       users
   })
   document.querySelector("#sidebar").innerHTML=html
})


const $locationSelect=document.querySelector('#send-location')
$locationSelect.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        
         return alert("Geolocation not supported by browser!")
    }
    $locationSelect.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position.coords)
        socket.emit('sendLocation',position.coords.latitude,position.coords.longitude,(error)=>{
            if(error){
                console.log(error)
            }
            console.log("Location shared")
            $locationSelect.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})