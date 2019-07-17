const { LiveReloadCompiler } = require('@nestjs/serve-static');

const compiler = new LiveReloadCompiler({
  projectName: '<%= getClientProjectName() %>'
});
compiler.run();
