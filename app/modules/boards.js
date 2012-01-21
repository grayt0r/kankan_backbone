(function(Boards) {
  
  var app = Kankan.app;

  Boards.Model = Backbone.Model.extend({});
  
  Boards.Collection = Backbone.Collection.extend({
    model: Boards.Model,
    url: 'http://localhost:3000/api/v1/boards'
  });
  
  Boards.Router = Backbone.Router.extend({
    routes: {
      'boards': 'index',
      'boards/:id': 'show'
    },

    index: function(hash) {
      var boards = new Boards.Collection();
      var index = new Boards.Views.Index(boards);
      boards.fetch();
    },
    
    show: function(id) {
      var show = new Boards.Views.Show(id);
      show.render(function(el) {
        $("#main").html(el);
      });
    }
  });

  Boards.Views.Index = Backbone.View.extend({
    template: '/app/templates/boardsIndex.html',
    
    events: {
      'click .board_link': 'showBoard'
    },
    
    initialize: function(boards) {
      boards.bind('reset', this.addAll, this);
    },

    render: function(boards, done) {
      var view = this;

      Kankan.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl({ boards: boards.models });
        done(view.el);
      });
    },
    
    addAll: function(boards) {
      this.render(boards, function(el) {
        $("#main").html(el);
      });
    },
    
    showBoard: function(ev) {
      ev.preventDefault();
      Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true);
    }
  });
  
  Boards.Views.Show = Backbone.View.extend({
    template: '/app/templates/boardsShow.html',

    render: function(done) {
      var view = this;

      Kankan.fetchTemplate(this.template, function(tmpl) {
        $(view.el).html(tmpl());
        done(view.el);
      });
    }
  });

})(Kankan.module("boards"));