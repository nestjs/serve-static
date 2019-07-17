import { experimental, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  externalSchematic,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getWorkspace } from '@schematics/angular/utility/config';
import {
  addPackageJsonDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies';
import { addModuleMapLoader, updateConfigFile } from './express-engine/rules';
import { Schema as UniversalOptions } from './schema';

const BROWSER_DIST = 'dist/browser';
const SERVER_DIST = 'dist/server';

function addDependenciesAndScripts(options: UniversalOptions): Rule {
  return (host: Tree) => {
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/common',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/core',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: 'reflect-metadata',
      version: '^0.1.13'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjs/platform-express',
      version: '^6.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nguniversal/express-engine',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nguniversal/module-map-ngfactory-loader',
      version: '^7.0.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'ts-loader',
      version: '^5.2.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'wait-on',
      version: '^3.2.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'webpack-cli',
      version: '^3.1.0'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'string-replace-loader',
      version: '^2.1.1'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'rimraf',
      version: '^2.6.3'
    });
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'nodemon',
      version: '^1.18.11'
    });

    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());
    pkg.scripts['serve'] = 'node serve-script';
    pkg.scripts['compile:server'] =
      'webpack --config webpack.server.config.js --progress --colors';
    pkg.scripts['serve:ssr'] = `node dist/server`;
    pkg.scripts['build:ssr'] =
      'npm run build:client-and-server-bundles && npm run compile:server';
    pkg.scripts[
      'build:client-and-server-bundles'
    ] = `ng build --prod && ng run ${options.clientProject}:server:production`;

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return host;
  };
}

function getClientProject(
  host: Tree,
  options: UniversalOptions
): experimental.workspace.WorkspaceProject {
  const workspace = getWorkspace(host);
  const clientName = options.clientProject.trim();
  const clientProject = workspace.projects[clientName];
  if (!clientProject) {
    throw new SchematicsException(
      `Client app ${options.clientProject} not found.`
    );
  }

  return clientProject;
}

export default function(options: UniversalOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const clientProject = getClientProject(host, options);
    if (clientProject.projectType !== 'application') {
      throw new SchematicsException(
        `Universal requires a project type of "application".`
      );
    }

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    const rootSource = apply(url('./files/root'), [
      template({
        ...strings,
        ...(options as object),
        stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
        getBrowserDistDirectory: () => BROWSER_DIST,
        getServerDistDirectory: () => SERVER_DIST,
        getClientProjectName: () => options.clientProject
      })
    ]);

    return chain([
      externalSchematic('@schematics/angular', 'universal', options),
      updateConfigFile(options),
      mergeWith(rootSource),
      addDependenciesAndScripts(options),
      addModuleMapLoader(options)
    ]);
  };
}
