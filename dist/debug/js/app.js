(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

      Collection.prototype.url = 'http://localhost:3000/api/v1/boards';

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

      Router.prototype.index = function() {
        var boards, index;
        if (Kankan.session.enforceAuthorisation()) {
          boards = new Boards.Collection;
          index = new Boards.Views.Index(boards);
          return boards.fetch();
        }
      };

      Router.prototype.show = function(id) {
        var cards, lanes, show;
        lanes = new Lanes.Collection(null, {
          boardId: id
        });
        cards = new Cards.Collection(null, {
          boardId: id
        });
        show = new Boards.Views.Show(lanes, cards);
        return lanes.fetch();
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

      Index.prototype.initialize = function(boards) {
        return boards.bind('reset', this.addAll, this);
      };

      Index.prototype.render = function(boards, done) {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          view.el.innerHTML = tmpl({
            boards: boards.models
          });
          return done(view.el);
        });
      };

      Index.prototype.addAll = function(boards) {
        return this.render(boards, function(el) {
          return $("#main").html(el);
        });
      };

      Index.prototype.showBoard = function(ev) {
        ev.preventDefault();
        return Backbone.history.navigate('boards/' + $(ev.target).attr('data-board-id'), true);
      };

      return Index;

    })(Backbone.View);
    return Boards.Views.Show = (function(_super) {

      __extends(Show, _super);

      function Show() {
        Show.__super__.constructor.apply(this, arguments);
      }

      Show.prototype.template = '/app/templates/boards/show.html';

      Show.prototype.cardTemplate = '/app/templates/boards/card.html';

      Show.prototype.cardModalTemplate = '/app/templates/boards/cardModal.html';

      Show.prototype.events = {
        'click .card': 'showCard'
      };

      Show.prototype.initialize = function(lanes, cards) {
        this.lanes = lanes;
        this.cards = cards;
        this.lanes.bind('reset', this.addAllLanes, this);
        return this.cards.bind('reset', this.addAllCards, this);
      };

      Show.prototype.render = function() {
        var view;
        view = this;
        Kankan.fetchTemplate(this.template, function(tmpl) {
          $(view.el).html(tmpl({
            lanes: view.lanes.models
          }));
          $("#main").html(view.el);
          return this.$('#my-modal').modal({
            backdrop: true
          });
        });
        return this.cards.fetch();
      };

      Show.prototype.addAllLanes = function(lanes) {
        return this.render();
      };

      Show.prototype.addAllCards = function(cards) {
        var _this = this;
        return $.each(cards.models, function(i, c) {
          return Kankan.fetchTemplate(_this.cardTemplate, function(tmpl) {
            return _this.$("#lane_" + (c.get('lane_id'))).append(tmpl({
              card: c
            }));
          });
        });
      };

      Show.prototype.showCard = function(ev) {
        var card, cardId;
        cardId = $(ev.target).attr('data-card-id');
        card = this.cards.get(cardId);
        return Kankan.fetchTemplate(this.cardModalTemplate, function(tmpl2) {
          this.$('#my-modal .modal-contents').html(tmpl2({
            c: card
          }));
          return this.$('#my-modal').modal('show');
        });
      };

      return Show;

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

  (function(Example) {
    return Example.Views.Tutorial = (function(_super) {

      __extends(Tutorial, _super);

      function Tutorial() {
        Tutorial.__super__.constructor.apply(this, arguments);
      }

      Tutorial.prototype.template = "app/templates/example.html";

      Tutorial.prototype.render = function(done) {
        var view;
        view = this;
        return Kankan.fetchTemplate(this.template, function(tmpl) {
          view.el.innerHTML = tmpl();
          return done(view.el);
        });
      };

      return Tutorial;

    })(Backbone.View);
  })(Kankan.module("example"));

  (function(Lanes) {
    var app;
    app = Kankan.app;
    Lanes.Model = (function(_super) {

      __extends(Model, _super);

      function Model() {
        Model.__super__.constructor.apply(this, arguments);
      }

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
            Kankan.session.addAuthTokenToAjaxCalls();
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
          this.addAuthTokenToAjaxCalls();
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

      Model.prototype.addAuthTokenToAjaxCalls = function() {
        return $.ajaxSetup({
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          },
          data: {
            auth_token: this.token
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
