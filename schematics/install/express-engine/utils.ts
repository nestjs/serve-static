/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getSourceNodes } from '@schematics/angular/utility/ast-utils';
import * as ts from 'typescript';

/**
 * These snippets had to be copied from the @nguniversal/express-engine package
 * in order to fix issue with external schematics evaluation chain. When external
 * schematic calls another external schematic, it leads to an error (missing dependencies?)
 * without any console output (blank line).
 */

export function findAppServerModuleExport(
  host: Tree,
  mainPath: string
): ts.ExportDeclaration | null {
  const mainBuffer = host.read(mainPath);
  if (!mainBuffer) {
    throw new SchematicsException(`Main file (${mainPath}) not found`);
  }
  const mainText = mainBuffer.toString('utf-8');
  const source = ts.createSourceFile(
    mainPath,
    mainText,
    ts.ScriptTarget.Latest,
    true
  );

  const allNodes = getSourceNodes(source as any);

  let exportDeclaration: ts.ExportDeclaration | null = null;

  for (const node of allNodes) {
    let exportDeclarationNode: ts.Node | any = node;

    // Walk up the parent until ExportDeclaration is found.
    while (
      exportDeclarationNode &&
      exportDeclarationNode.parent &&
      exportDeclarationNode.parent.kind !== ts.SyntaxKind.ExportDeclaration
    ) {
      exportDeclarationNode = exportDeclarationNode.parent;
    }

    if (
      exportDeclarationNode !== null &&
      exportDeclarationNode.parent !== undefined &&
      exportDeclarationNode.parent.kind === ts.SyntaxKind.ExportDeclaration
    ) {
      exportDeclaration = exportDeclarationNode.parent as ts.ExportDeclaration;
      break;
    }
  }

  return exportDeclaration;
}

export function findAppServerModulePath(host: Tree, mainPath: string): string {
  const exportDeclaration = findAppServerModuleExport(host, mainPath);
  if (!exportDeclaration) {
    throw new SchematicsException('Could not find app server module export');
  }

  const moduleSpecifier = exportDeclaration.moduleSpecifier.getText();
  return moduleSpecifier.substring(1, moduleSpecifier.length - 1);
}
