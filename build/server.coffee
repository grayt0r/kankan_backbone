# Require libraries
fs = require "fs"
express = require "express"
site = express.createServer()

# Determine which dist directory to use
dir = process.argv.length > 2 && "./dist/" + process.argv[2]

# Use custom JS folder based off debug or release
dir && site.use("/assets/js", express.static(dir + "/js"))
dir && site.use("/assets/css", express.static(dir + "/css"))

# Serve static files
site.use "/app", express.static("./app")
site.use "/assets", express.static("./assets")
site.use "/dist", express.static("./dist")

#Serve favicon.ico
site.use express.favicon("./favicon.ico")

# Ensure all routes go home, client side app..
# RAG: Easier to debug with this turned off
site.get "/", (req, res) ->
  fs.createReadStream("./index.html").pipe(res)

# Actually listen
site.listen 8000

console.log "Server listening on http://localhost:8000"
