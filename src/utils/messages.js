const generateMessage= (text,user) => {
    return {
        user,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage= (text,user) => {
    const x ={
        user,
        url:`https://google.com/maps?q=${text.lat},${text.long}`,
        createdAt: new Date().getTime()
    }
    console.log(x)
    return x;
}
module.exports = {
    generateMessage,
    generateLocationMessage

}