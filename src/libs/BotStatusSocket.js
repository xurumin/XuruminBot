const net = require("net")
const crypto = require("crypto");

module.exports = {
    init: (port, hostname, user_login) => {
        this.botStatus = {}

        this.server = net.createServer((socket) => {
            console.log(`${socket.address().address} connected`)
            socket.on("data", (data) => {
                try {
                    var user_response = JSON.parse(data.toString())
                    const user_expected_hash = crypto.createHash("sha512").update(JSON.stringify(user_response.login)).digest("hex")
                    if ((user_expected_hash != user_response.hash) || (JSON.stringify(user_response.login) != JSON.stringify(user_login))) {
                        console.log("connection closed - wrong login")
                       socket.destroy()
                    } else {
                        socket.write(JSON.stringify(this.botStatus))
                        socket.end()
                    }

                } catch (error) {
                    console.log(error)
                    socket.destroy()
                }

            })
            socket.on("close", () => {
                console.log("connection closed")
                socket.destroy()
            })

        })
        this.server.listen(port, hostname)
    },
    setStatus: (status)=>{
        this.botStatus = status
    }
}