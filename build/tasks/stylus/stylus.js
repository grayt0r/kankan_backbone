/*
 * Grunt Task File
 * ---------------
 *
 * Task: Stylus
 * Description: Compiles styl files to CSS
 * Dependencies: stylus
 *
 */

task.registerBasicTask("stylus", "Compiles styl files to CSS", function(files, name) {
  var done = this.async(),
      exec = require('child_process').exec;
  
  var stylusCommand = 'stylus < ' + files + ' > ' + name + ' -u /usr/local/lib/node_modules/nib';
  
  // Compile the files to JS
  task.helper('child_process', stylusCommand, function(err) {
    if (err) {
      log.error(err);
      return false;
    }
    
    // Otherwise, print a success message.
    log.writeln("Stylus compilation complete.");
    
    done();
  });
});