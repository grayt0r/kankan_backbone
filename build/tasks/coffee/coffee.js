/*
 * Grunt Task File
 * ---------------
 *
 * Task: Coffee
 * Description: Compiles coffeescript files to JS
 * Dependencies: coffee-script
 *
 */

task.registerBasicTask("coffee", "Compiles coffeescript files to JS", function(files, name) {
  if(!_.isArray(files)) {
    log.writeln('Converting files to an array');
    files = [files];
  }
  
  // Compile the files to JS
  file.write(name, task.helper('coffee', files, name));

  // Fail task if errors were logged.
  if (task.hadErrors()) { return false; }

  // Otherwise, print a success message.
  log.writeln("File \"" + name + "\" created.");
});

task.registerHelper("coffee", function(files, name) {
  var exec = require('child_process').exec;
  var fileString = files.join(' ');
  
  exec('coffee -j ' + name + ' -c ' + fileString, function (error, stdout, stderr) {
    if(error) {
      log.error(error);
      log.error(stderr);
    }
    log.writeln(stdout);
  });
});
