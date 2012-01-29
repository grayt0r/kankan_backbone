Kankan
====================

Backbone.js client for the [Kankan API](https://github.com/grayt0r/kankan_api).

Please note that this project is in the very early days of development. There is likely to be bugs and a lot of the functionality is yet to be implemented - see the TODOs below for more information.

Built using:

* [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate)
* [Backbone.js](http://documentcloud.github.com/backbone/)
* [Bootstrap](http://twitter.github.com/bootstrap/)
* [CoffeeScript](http://coffeescript.org/)
* [jQuery](http://jquery.com/)
* [Stylus](http://learnboost.github.com/stylus/) and [nib](http://visionmedia.github.com/nib/)


## Installation

* Install the [Kankan API](https://github.com/grayt0r/kankan_api)
* git clone git://github.com/grayt0r/kankan_backbone.git
* cd kankan_backbone
* npm install -d
* coffee build/server debug
* Open http://localhost:8000 in your browser and check you see the login page

## TODOs

* ~~Redirect 401s to login page~~
* ~~Store auth token in sensible place~~
* ~~Finish board rendering~~
* ~~Modal dialogue for card details~~
* ~~Add nib mixins~~
* ~~Persist auth token across page refreshes - localstorage?~~
* ~~Check direct access to a board show page can retrieve the board json~~
* ~~Document install steps~~
* ~~Add some dummy data to the default Kankan API install~~
* Document build steps
* Add validations to API and client
* Port the build process to CoffeeScript
* Improve error handling
* Use Zepto instead of jQuery?
* Use HTTPS to avoid sending passwords in plain text?
* Ability to add cards to a board
* Ability to add, delete and modify a board's lanes
* Add drag & drop functionality to move cards between lanes
* Allow tagging of cards and filtering of cards displayed depending on their tags
* Add groups and allow board access to be granted to groups
* Check cross-browser compatibility, adding polyfills using yepnope.js where necessary
* Use Socket.IO to add realtime events
* More to come...