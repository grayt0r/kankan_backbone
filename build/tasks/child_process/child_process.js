var exec = require('child_process').exec;

task.registerHelper('child_process', function(cmd, done) {
  exec(cmd, function (error, stdout, stderr) {
    if(error) {
      done(null);
    } else {
      done(error);
    }
  });
});