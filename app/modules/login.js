(function(Login) {
  
  var app = Kankan.app;

  Login.Views.Login = Backbone.View.extend({
    template: "app/templates/login.html",
    
    events: {
      "submit form": "login"
    },

    render: function(done) {
      var view = this;

      Kankan.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl();
        done(view.el);
      });
    },
    
    login: function(ev) {
      var view = this;
      ev.preventDefault();
      
      var email = this.$('input[name=email]').val(),
          password = this.$('input[name=password]').val();
      
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/api/v1/tokens.json',
        data: {
          'email': email,
          'password': password
        },
        success: function(data) {
          if(data.status === 'ok') {
            view.saveCredentials(data);
          }
          // TODO: Handle error case
        },
        dataType: 'json'
      });
    },
    
    saveCredentials: function(data) {
      Kankan.auth_token = data.user.authentication_token;
      
      // Set jQuery ajax defaults for CORs
      $.ajaxSetup({
        data: { auth_token: Kankan.auth_token }
      });
      
      Backbone.history.navigate('boards', true);
    }
  });

})(Kankan.module("login"));