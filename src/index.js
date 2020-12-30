const path = require('path')
const http = require('http')
const express=require('express')
const socketio = require("socket.io")
const Filter = require('bad-words')
const { generateMessage,generateLocationMessage } = require('./utils/messages')
const { addUser,removeUser,getUser,getUserInRoom, getUsersInRoom} = require("./utils/users")

const app=express()
const server = http.createServer(app)
const io = socketio(server)


const port =process.env.PORT||3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection' , (socket) => {
    console.log('new websocket connection')

   
    socket.on('join',(options,callback) => {
        const {error,user} = addUser({id:socket.id,...options});
        if(error){
            return callback(error)
        }
         socket.join(user.room) //'join' can be used only on server for creating and manipulating chat rooms 

         socket.emit('message',generateMessage('welcome!','Admin'))
         socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
         
         io.to(user.room).emit('roomData',{
             room:user.room,
             users:getUsersInRoom(user.room)
         })

         callback();
        //socket.emit, io.emit, socket.brodcast.emit
        //'join' gives us two new way of emitting event (suitable for rooms) --> io.to.emit:{it emits an event to everybody in a specific room i.e we can send message to everybody in a room without effecting other rroms}, socket.brodcast.to.emit:{eminting to everybody but not the client in a specific room}
    })

    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id)
       
        const filter = new Filter()
       
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
  
        io.to(user.room).emit('message',generateMessage(message,user.username))
        callback()
    })


    socket.on('location',(position,callback) => {
        const user = getUser(socket.id)
        console.log(position)
        io.to(user.room).emit('locationMessage',generateLocationMessage(position,user.username))
        callback('Location shared!')
    })

    socket.on('disconnect',() => {
        const user = removeUser(socket.id)
        if(user){
          io.to(user.room).emit('message', generateMessage(`${user.username} has left!!`))
          io.to(user.room).emit('roomData', {
              room:user.room,
              users:getUsersInRoom(user.room)
          })
        }
        
    })
})


server.listen(port,()=>{
    console.log(`server started on ${port}`)
    
})  