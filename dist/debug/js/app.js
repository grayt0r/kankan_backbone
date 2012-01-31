(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.Kankan = {
    module: (function() {
      var modules;
      modules = {};
      return function(name) {
        if (modules[name]) return modules[name];
        return modules[name] = {
          Views: {}
        };
      };
    })(),
    fetchTemplate: function(path, done) {
      if (window.JST == null) window.JST = {};
      if (JST[path]) return done(JST[path]);
      return $.get(path, function(contents) {
        var tmpl;
        tmpl = _.template(contents);
        JST[path] = tmpl;
        return done(tmpl);
      });
    },
    app: _.extend({}, Backbone.Events)
  };

  $(function() {
    var Boards, Example, Login, Router, Session, app, session;
    app = Kankan.app;
    Example = Kankan.module("example");
    Login = Kankan.module("login");
    Boards = Kankan.module("boards");
    Session = Kankan.module("session");
    session = Kankan.session = new Session.Model;
    Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        "": "login",
        "login": "login",
        "example": "example"
      };

      Router.prototype.initialize = function() {
        return this.boardsRouter = new Boards.Router;
      };

      Router.prototype.login = function() {
        var login;
        if (session.isAuthorised()) {
          return Backbone.history.navigate('boards', true);
        }
        login = new Login.Views.Login;
        return login.render();
      };

      Router.prototype.logout = function() {
        return session.destroy();
      };

      return Router;

    })(Backbone.Router);
    app.router = new Router;
    Backbone.history.start({
      pushState: true
    });
    $(document).on("click", "a:not([data-bypass])", function(evt) {
      var href, protocol;
      href = $(this).attr("href");
      protocol = this.protocol + "#";
      if (href.slice(0, protocol.length) !== protocol) {
        evt.preventDefault();
        return app.router.navigate(href, true);
      }
    });
    return $.ajaxSetup({
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  });

  (function(Boards) {
    var Cards, Lanes, app;
    app = Kankan.app;
    Cards = Kankan.module("cards");
    Lanes = Kankan.module("lanes");
    Boards.Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      return Model;

    })(Backbone.Model);
    Boards.Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      Collection.prototype.model = Boards.Model;

      Collection.prototype.url = "http://localhost:3000/api/v1/boards";

      return Collection;

    })(Backbone.Collection);
    Boards.Router = (function(_super) {

      __extends(Router, _super);

      function Router() {
        Router.__super__.constructor.apply(this, arguments);
      }

      Router.prototype.routes = {
        'boards': 'index',
        'boards/:id': 'show'
      };

      Router.prototype.boards = new Boards.Collection;

      Router.prototype.index = function() {
        var index;
        if (Kankan.session.enforceAuthorisation()) {
          return index = new Boards.Views.Index({
            collection: this.boards
          });
        }
      };

      Router.prototype.show = function(id) {
        var board, cards, cardsList, lanes, show;
        if (Kankan.session.enforceAuthorisation()) {
          board = this.boards.get(id);
          lanes = new Lanes.Collection(null, {
            boardId: id
          });
          cards = new Cards.Collection(null, {
            boardId: id
          });
          show = new Boards.Views.Show({
            model: board,
            collection: lanes
          });
          return cardsList = new Boards.Views.CardsList({
            model: board,
            collection: cards
          }, lanes);
        }
      };

      return Router;

    })(Backbone.Router);
    Boards.Views.Index = (function(_super) {

      __extends(Index, _super);

      function Index() {
        Index.__super__.constructor.apply(this, arguments);
      }

      Index.prototype.template = '/app/templates/boards/index.html';

      Index.prototype.events = {
        'click .board_link': 'showBoard'
      };

      Index.prototype.initialize = function() {
        var boards;
        boards = this.collection;
        boards.bind('reset', this.render, this);
        boards.bind('add', this.render, this);
        boards.bind('remove', this.render, this);
        return boards.fetch();
      };

      Index.prototype.render = function() {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          $(view.el).html(tmpl({
            boards: view.collection.models
          }));
          return $("#main").html(view.el);
        });
      };

      Index.prototype.showBoard = function(ev) {
        ev.preventDefault();
        return Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true);
      };

      return Index;

    })(Backbone.View);
    Boards.Views.Show = (function(_super) {

      __extends(Show, _super);

      function Show() {
        Show.__super__.constructor.apply(this, arguments);
      }

      Show.prototype.template = '/app/templates/boards/show.html';

      Show.prototype.initialize = function() {
        var lanes;
        lanes = this.collection;
        lanes.bind('reset', this.render, this);
        lanes.bind('add', this.render, this);
        lanes.bind('remove', this.render, this);
        return lanes.fetch();
      };

      Show.prototype.render = function() {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          $(view.el).html(tmpl({
            board: view.model,
            lanes: view.collection.models
          }));
          $("#main").html(view.el);
          this.$('#cardModal').modal({
            backdrop: true,
            keyboard: true
          });
          return app.trigger('kankan.lanes.rendered');
        });
      };

      return Show;

    })(Backbone.View);
    Boards.Views.CardsList = (function(_super) {

      __extends(CardsList, _super);

      function CardsList() {
        this.showCard = __bind(this.showCard, this);
        this.createCard = __bind(this.createCard, this);
        CardsList.__super__.constructor.apply(this, arguments);
      }

      CardsList.prototype.template = '/app/templates/boards/cardModal.html';

      CardsList.prototype.initialize = function(opts, lanes) {
        var cards, view;
        this.lanes = lanes;
        cards = this.collection;
        cards.bind('reset', this.addAll, this);
        cards.bind('add', this.addOne, this);
        view = this;
        return app.bind('kankan.lanes.rendered', function() {
          $('form').on('submit', view.createCard);
          $('.board').on('click', '.card', view.showCard);
          return cards.fetch();
        });
      };

      CardsList.prototype.addAll = function() {
        return this.collection.each(this.addOne);
      };

      CardsList.prototype.addOne = function(card) {
        var view;
        view = new Boards.Views.Card({
          model: card
        });
        return view.render(function(el) {
          return this.$("#lane_" + (card.get('lane_id'))).append(el);
        });
      };

      CardsList.prototype.createCard = function(ev) {
        var card;
        ev.preventDefault();
        card = this.collection.create({
          title: $('#cardTitle').val(),
          lane_id: this.lanes.first().id
        });
        $('#cardTitle').val('');
        return card;
      };

      CardsList.prototype.showCard = function(ev) {
        var card, cardId;
        cardId = $(ev.target).attr('data-card-id');
        card = this.collection.get(cardId);
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          this.$('#cardModal .modal-contents').html(tmpl({
            card: card
          }));
          return this.$('#cardModal').modal('show');
        });
      };

      return CardsList;

    })(Backbone.View);
    return Boards.Views.Card = (function(_super) {

      __extends(Card, _super);

      function Card() {
        Card.__super__.constructor.apply(this, arguments);
      }

      Card.prototype.template = '/app/templates/boards/card.html';

      Card.prototype.initialize = function() {
        this.model.bind('change', this.render, this);
        return this.model.bind('destroy', this.remove, this);
      };

      Card.prototype.render = function(done) {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          $(view.el).html(tmpl({
            card: view.model
          }));
          return done(view.el);
        });
      };

      Card.prototype.addOne = function() {
        var _this = this;
        return Kankan.fetchTemplate(this.cardTemplate, function(tmpl) {});
      };

      return Card;

    })(Backbone.View);
  })(Kankan.module("boards"));

  (function(Cards) {
    var app;
    app = Kankan.app;
    Cards.Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      Model.prototype.url = "http://localhost:3000/api/v1/cards";

      return Model;

    })(Backbone.Model);
    return Cards.Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      Collection.prototype.model = Cards.Model;

      Collection.prototype.initialize = function(models, options) {
        this._meta = {};
        return this.meta('boardId', options.boardId);
      };

      Collection.prototype.url = function() {
        return "http://localhost:3000/api/v1/cards/for_board?board_id=" + (this.meta('boardId'));
      };

      Collection.prototype.meta = function(prop, val) {
        if (!(val != null)) {
          return this._meta[prop];
        } else {
          return this._meta[prop] = val;
        }
      };

      return Collection;

    })(Backbone.Collection);
  })(Kankan.module("cards"));

  (function(Lanes) {
    var app;
    app = Kankan.app;
    Lanes.Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

      Model.prototype.url = "http://localhost:3000/api/v1/lanes";

      return Model;

    })(Backbone.Model);
    return Lanes.Collection = (function(_super) {

      __extends(Collection, _super);

      function Collection() {
        Collection.__super__.constructor.apply(this, arguments);
      }

      Collection.prototype.model = Lanes.Model;

      Collection.prototype.initialize = function(models, options) {
        this._meta = {};
        return this.meta('boardId', options.boardId);
      };

      Collection.prototype.url = function() {
        return "http://localhost:3000/api/v1/lanes?board_id=" + (this.meta('boardId'));
      };

      Collection.prototype.meta = function(prop, val) {
        if (!(val != null)) {
          return this._meta[prop];
        } else {
          return this._meta[prop] = val;
        }
      };

      return Collection;

    })(Backbone.Collection);
  })(Kankan.module("lanes"));

  (function(Login) {
    var app;
    app = Kankan.app;
    return Login.Views.Login = (function(_super) {

      __extends(Login, _super);

      function Login() {
        Login.__super__.constructor.apply(this, arguments);
      }

      Login.prototype.template = "app/templates/login.html";

      Login.prototype.events = {
        "submit form": "login"
      };

      Login.prototype.render = function() {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          $(view.el).html(tmpl());
          return $('#main').html(view.el);
        });
      };

      Login.prototype.login = function(ev) {
        var email, password, view;
        view = this;
        ev.preventDefault();
        email = this.$('input[name=email]').val();
        password = this.$('input[name=password]').val();
        return Kankan.session.authenticate(email, password, function(err) {
          if (!err) {
            Kankan.session.addHeaderAndAuthTokenToAjaxCalls();
            return Backbone.history.navigate('boards', true);
          } else {
            return console.log('login error', err);
          }
        });
      };

      return Login;

    })(Backbone.View);
  })(Kankan.module("login"));

  (function(Session) {
    var SessionStore, app, session;
    app = Kankan.app;
    SessionStore = (function() {

      SessionStore.prototype.storeId = 'sessions';

      SessionStore.prototype.key = 'currentUser';

      function SessionStore() {
        this.store = localStorage.getItem(this.storeId);
        this.data = (this.store && JSON.parse(this.store)) || {};
      }

      SessionStore.prototype.save = function() {
        return localStorage.setItem(this.storeId, JSON.stringify(this.data));
      };

      SessionStore.prototype.create = function(session) {
        this.data[this.key] = session;
        this.save();
        return session;
      };

      SessionStore.prototype.update = function(session) {
        this.data[this.key] = session;
        this.save();
        return session;
      };

      SessionStore.prototype.retrieve = function() {
        return this.data[this.key];
      };

      SessionStore.prototype.destroy = function(session) {
        delete this.data[this.key];
        this.save();
        return session;
      };

      return SessionStore;

    })();
    session = new SessionStore;
    return Session.Model = (function() {

      function Model() {
        var currentUser;
        currentUser = session.retrieve();
        if (currentUser) {
          this.email = currentUser.email;
          this.token = currentUser.token;
          this.addHeaderAndAuthTokenToAjaxCalls();
        } else {
          this.email = '';
          this.token = '';
        }
      }

      Model.prototype.authenticate = function(email, password, callback) {
        var self;
        self = this;
        return self.getTokenFromApi(email, password, function(err) {
          if (!err) {
            return callback.call(self);
          } else {
            return callback.call(self, err);
          }
        });
      };

      Model.prototype.isAuthorised = function() {
        if (this.token) return true;
        if (this.email) {
          this.getTokenFromLocalStorage();
          if (this.token) return true;
        }
        return false;
      };

      Model.prototype.enforceAuthorisation = function() {
        if (this.isAuthorised()) {
          return true;
        } else {
          Backbone.history.navigate('login', true);
          return false;
        }
      };

      Model.prototype.getTokenFromLocalStorage = function() {
        var result;
        result = session.retrieve();
        if (result.token) {
          this.token = result.token;
          return session.update(this);
        }
      };

      Model.prototype.getTokenFromApi = function(email, password, callback) {
        var self;
        self = this;
        return $.ajax({
          type: 'POST',
          url: 'http://localhost:3000/api/v1/tokens.json',
          data: {
            'email': email,
            'password': password
          },
          success: function(data) {
            if (data.status === 'ok') {
              self.email = data.user.email;
              self.token = data.user.authentication_token;
              session.create(self);
              return callback.call(self);
            } else {
              return callback.call(self, 'Login failed');
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            return callback.call(self, 'Login error');
          },
          dataType: 'json'
        });
      };

      Model.prototype.addHeaderAndAuthTokenToAjaxCalls = function() {
        return $.ajaxSetup({
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          },
          beforeSend: function(jqXHR, s) {
            var separator;
            separator = /\?/.test(s.url) ? '&' : '?';
            return s.url += "" + separator + "auth_token=" + Kankan.session.token;
          }
        });
      };

      Model.prototype.destroy = function() {
        session.destroy(this);
        this.email = '';
        return this.token = '';
      };

      return Model;

    })();
  })(Kankan.module("session"));

}).call(this);
