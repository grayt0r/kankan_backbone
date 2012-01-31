# Require libraries
fs = require "fs"
express = require "express"

app = express.createServer
  key: fs.readFileSync './keys/server.key'
  cert: fs.readFileSync './keys/server.crt'

# Determine which dist directory to use
dir = process.argv.length > 2 && "./dist/" + process.argv[2]

# Use custom JS folder based off debug or release
dir && app.use("/assets/js", express.static(dir + "/js"))
dir && app.use("/assets/css", express.static(dir + "/css"))

# Serve static files
app.use "/app", express.static("./app")
app.use "/assets", express.static("./assets")
app.use "/dist", express.static("./dist")

#Serve favicon.ico
app.use express.favicon("./favicon.ico")

# Handle unauthorised requests
#app.get "/401", (req, res) ->
#  res.send '401', 401

# Ensure all routes go home, client side app..
app.get "*", (req, res) ->
  fs.createReadStream("./index.html").pipe(res)

# Actually listen
app.listen 8000

console.log "Server listening on http://localhost:8000"
