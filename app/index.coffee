# This contains the module definition factory function, application state,
# events, and the router.
window.Kankan =
  # Assist with code organization, by breaking up logical components of code
  # into modules.
  module: do ->
    # Internal module cache.
    modules = {}

    # Create a new module reference scaffold or load an existing module.
    (name) ->
      # If this module has already been created, return it.
      if modules[name] then return modules[name]

      # Create a module and save it under this name
      (modules[name] = { Views: {} })

  # This is useful when developing if you don't want to use a
  # build process every time you change a template.
  #
  # Delete if you are using a different template loading method.
  fetchTemplate: (path, done) ->
    window.JST ?= {}

    # Should be an instant synchronous way of getting the template, if it
    # exists in the JST object.
    if JST[path] then return done(JST[path])

    # Fetch it asynchronously if not available from JST
    $.get path, (contents) ->
      tmpl = _.template contents
      JST[path] = tmpl
      done tmpl

  # Keep active application instances namespaced under an app object.
  app: _.extend {}, Backbone.Events

# Treat the jQuery ready function as the entry point to the application.
# Inside this function, kick-off all initialization, everything up to this
# point should be definitions.
$ ->
  # Shorthand the application namespace
  app = Kankan.app

  # Include the example module
  Example = Kankan.module "example"
  Login = Kankan.module "login"
  Boards = Kankan.module "boards"

  # Defining the application router, you can attach sub routers here.
  class Router extends Backbone.Router
    routes:
      "": "login"
      "example": "example"

    initialize: ->
      @boardsRouter = new Boards.Router

    login: (hash) ->
      login = new Login.Views.Login

      login.render (el) ->
        $("#main").html(el)

    # TODO: Delete the example route
    example: (hash) ->
      tutorial = new Example.Views.Tutorial

      # Attach the tutorial to the DOM
      tutorial.render (el) ->
        $("#main").html(el)

  # Define your master router on the application namespace and trigger all
  # navigation from this instance.
  app.router = new Router

  # Trigger the initial route and enable HTML5 History API support
  Backbone.history.start({ pushState: true })

  # All navigation that is relative should be passed through the navigate
  # method, to be processed by the router.  If the link has a data-bypass
  # attribute, bypass the delegation completely.
  $(document).on "click", "a:not([data-bypass])", (evt) ->
    # Get the anchor href and protcol
    href = $(this).attr("href")
    protocol = this.protocol + "#"

    # Ensure the protocol is not part of URL, meaning its relative.
    if (href.slice(0, protocol.length) != protocol)
      # Stop the default event to ensure the link will not cause a page
      # refresh.
      evt.preventDefault()

      # This uses the default router defined above, and not any routers
      # that may be placed in modules.  To have this work globally (at the
      # cost of losing all route events) you can change the following line
      # to: Backbone.history.navigate(href, true);
      app.router.navigate href, true

  # RAG: Set jQuery ajax defaults for CORs
  $.ajaxSetup
    headers: { "X-Requested-With": "XMLHttpRequest" }