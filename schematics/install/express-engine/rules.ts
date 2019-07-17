/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalize } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  addSymbolToNgModuleMetadata,
  insertImport
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  getWorkspace,
  getWorkspacePath
} from '@schematics/angular/utility/config';
import { getProject } from '@schematics/angular/utility/project';
import { getProjectTargets } from '@schematics/angular/utility/project-targets';
import { BrowserBuilderOptions } from '@schematics/angular/utility/workspace-models';
import * as ts from 'typescript';
import { Schema as UniversalOptions } from './../schema';
import { findAppServerModulePath } from './utils';

/**
 * These snippets had to be copied from the @nguniversal/express-engine package
 * in order to fix issue with external schematics evaluation chain. When external
 * schematic calls another external schematic, it leads to an error (missing dependencies?)
 * without any console output (blank line).
 */

const BROWSER_DIST = 'dist/browser';
const SERVER_DIST = 'dist/server';

export function updateConfigFile(options: UniversalOptions): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    if (!workspace.projects[options.clientProject]) {
      throw new SchematicsException(
        `Client app ${options.clientProject} not found.`
      );
    }

    const clientProject = workspace.projects[options.clientProject];
    if (!clientProject.architect) {
      throw new Error('Client project architect not found.');
    }

    // We have to check if the project config has a server target, because
    // if the Universal step in this schematic isn't run, it can't be guaranteed
    // to exist
    if (!clientProject.architect.server) {
      return;
    }

    clientProject.architect.server.configurations = {
      production: {
        fileReplacements: [
          {
            replace: 'src/environments/environment.ts',
            with: 'src/environments/environment.prod.ts'
          }
        ]
      }
    };
    clientProject.architect.server.options.outputPath = SERVER_DIST;
    (clientProject.architect.build
      .options as BrowserBuilderOptions).outputPath = BROWSER_DIST;

    const workspacePath = getWorkspacePath(host);
    host.overwrite(workspacePath, JSON.stringify(workspace, null, 2));
    return host;
  };
}

export function addModuleMapLoader(options: UniversalOptions): Rule {
  return (host: Tree) => {
    const clientProject = getProject(host, options.clientProject);
    const clientTargets = getProjectTargets(clientProject);
    if (!clientTargets.server) {
      return;
    }
    const mainPath = normalize('/' + clientTargets.server.options.main);

    const appServerModuleRelativePath = findAppServerModulePath(host, mainPath);
    const modulePath = normalize(
      `/${clientProject.root}/src/${appServerModuleRelativePath}.ts`
    );

    // Add the module map loader import
    let moduleSource = getTsSourceFile(host, modulePath);
    const importModule = 'ModuleMapLoaderModule';
    const importPath = '@nguniversal/module-map-ngfactory-loader';
    const moduleMapImportChange = insertImport(
      moduleSource as any,
      modulePath,
      importModule,
      importPath
    ) as InsertChange;
    if (moduleMapImportChange) {
      const recorder = host.beginUpdate(modulePath);
      recorder.insertLeft(
        moduleMapImportChange.pos,
        moduleMapImportChange.toAdd
      );
      host.commitUpdate(recorder);
    }

    // Add the module map loader module to the imports
    const importText = 'ModuleMapLoaderModule';
    moduleSource = getTsSourceFile(host, modulePath);
    const metadataChanges = addSymbolToNgModuleMetadata(
      moduleSource as any,
      modulePath,
      'imports',
      importText
    );
    if (metadataChanges) {
      const recorder = host.beginUpdate(modulePath);
      metadataChanges.forEach((change: InsertChange) => {
        recorder.insertRight(change.pos, change.toAdd);
      });
      host.commitUpdate(recorder);
    }
  };
}

function getTsSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not read file (${path}).`);
  }
  const content = buffer.toString();
  const source = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  return source;
}
