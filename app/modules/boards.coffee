((Boards) ->
  
  app = Kankan.app

  class Boards.Model extends Backbone.Model
  
  class Boards.Collection extends Backbone.Collection
    model: Boards.Model
    url: 'http://localhost:3000/api/v1/boards'
  
  class Boards.Router extends Backbone.Router    
    routes:
      'boards': 'index',
      'boards/:id': 'show'

    index: (hash) ->
      boards = new Boards.Collection
      index = new Boards.Views.Index(boards)
      boards.fetch()
    
    show: (id) ->
      show = new Boards.Views.Show(id)
      show.render (el) ->
        $("#main").html(el)

  class Boards.Views.Index extends Backbone.View
    template: '/app/templates/boards/index.html'
    
    events:
      'click .board_link': 'showBoard'
    
    initialize: (boards) ->
      boards.bind('reset', this.addAll, this)

    render: (boards, done) ->
      view = this

      Kankan.fetchTemplate this.template, (tmpl) ->
        view.el.innerHTML = tmpl({ boards: boards.models })
        done(view.el)
    
    addAll: (boards) ->
      this.render boards, (el) ->
        $("#main").html(el)
    
    showBoard: (ev) ->
      ev.preventDefault()
      Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true)
  
  class Boards.Views.Show extends Backbone.View
    template: '/app/templates/boards/show.html'

    render: (done) ->
      view = this

      Kankan.fetchTemplate this.template, (tmpl) ->
        $(view.el).html(tmpl())
        done(view.el)

) Kankan.module("boards")