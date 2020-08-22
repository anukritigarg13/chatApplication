const express=require("express")
const http=require("http")
const path=require("path")
const socketio=require("socket.io")
const Filter=require("bad-words")
const {generateMessage,generateLocationMessage}=require("./utils/messages.js")
const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users")

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT||3000

app.use(express.static(path.join(__dirname,'../public')))

// app.get('',(req,res)=>{
//     res.render("index")
// })
//let count=0

io.on('connection',(socket)=>{
    console.log("New websocket connection")
    
    
    
    socket.on("join",({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
           return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('Message',generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit('Message',generateMessage("Admin",`${user.username} has joined!`))
        
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(data,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(data)){
            return callback("Profane messages not allowed!")
        }
        const user=getUser(socket.id)
        if(!user){
            return callback("An error occured")
        }
        io.to(user.room).emit("Message",generateMessage(user.username,data))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('Message',generateMessage("Admin",`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

        
    })
    socket.on('sendLocation',(lat,long,callback)=>{
        if(lat===null || long===null)
        {
            return callback("Location not delivered!")
        }
        const user=getUser(socket.id)
        if(!user){
            return callback("An error occured")
        }
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,lat,long))
        callback()
    })
})
server.listen(port,()=>{
    console.log("Server is up on port "+port)
})