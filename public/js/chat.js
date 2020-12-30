const socket = io()

//elements
let $messageForm = document.querySelector('#messageForm')
let $messageInput =  $messageForm.querySelector('input')
let $locationButton = document.querySelector("#location")
let $sendButton = $messageForm.querySelector('button')
let $messages = document.querySelector('#messages')

//templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//options: parsing query string of URL into js object
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage',(location) => {
//    console.log(location.user)
  const html = Mustache.render($locationTemplate,{
   user:location.user,
   location:location.url,
   createdAt:moment(location.createdAt).format('h:mm a')
})
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()
})

socket.on('message',(message) => {
 //document.querySelector("#message").innerHTML=message
 //console.log(message)
 const html = Mustache.render($messageTemplate,{
     user:message.user,
     message:message.text,
     createdAt:moment(message.createdAt).format('h:mm a'),
 })
 $messages.insertAdjacentHTML('beforeend',html)
 autoscroll()
})

socket.on('roomData',({room,users}) => {
    // console.log(room,users)
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation  is not supported by your browser')
    }

    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position)
        socket.emit('location',{lat:position.coords.latitude,long:position.coords.longitude},(message) => {
            $locationButton.removeAttribute('disabled')
            return console.log(message)
        })
    })
       
})

$messageForm.addEventListener('submit',(e) => {

    $sendButton.setAttribute('disabled','disabled')

    e.preventDefault()
    const message = e.target.elements.typedMessage.value
    socket.emit('sendMessage',message,(error) => {
        $sendButton.removeAttribute('disabled')
        $messageInput.value=''
        $messageInput.focus()
        if(error){
           return alert(error)
        }
        //alert('message delivered....')
        
    })

    
})

socket.emit('join',{username , room},(error) => {
    if(error){
        alert(error);
        location.href('/')
    }
    
})