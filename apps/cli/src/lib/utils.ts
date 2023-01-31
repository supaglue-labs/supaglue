import chalk from 'chalk';
import fs from 'fs';
import globalDirectories from 'global-dirs';
import stringWidth from 'string-width';
import checkForUpdate from 'update-check';

// returns if current bin is installed globally
export function isCurrentBinInstalledGlobally(): 'npm' | 'yarn' | false {
  try {
    const realPath = fs.realpathSync(process.argv[1]);
    const usingGlobalYarn = realPath.indexOf(globalDirectories.yarn.packages) === 0;
    const usingGlobalNpm = realPath.indexOf(fs.realpathSync(globalDirectories.npm.packages)) === 0;

    if (usingGlobalNpm) {
      return 'npm';
    }
    if (usingGlobalYarn) {
      return 'yarn';
    } else {
      false;
    }
  } catch (e) {
    //
  }
  return false;
}

const isInstalledGlobally = isCurrentBinInstalledGlobally();

export async function printUpdateMessage(): Promise<void> {
  const boxHeight = 5;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require('../../package.json');
  const packageName = pkg.name;
  const currentVersionInstalled = pkg.version;

  let update = null;
  try {
    update = await checkForUpdate(pkg);
  } catch (err) {
    // noop
  }

  if (!update) {
    return;
  }

  const latestVersionAvailable = update.latest;

  const cliCommand = makeInstallCommand(packageName, latestVersionAvailable);

  const boxText = `\n${chalk.blue(
    'Update available'
  )} ${currentVersionInstalled} -> ${latestVersionAvailable}\nRun the following to update
  ${chalk.bold(cliCommand)}`;

  const boxedMessage = drawBox({
    height: boxHeight,
    width: 40,
    str: boxText,
    horizontalPadding: 2,
  });

  // eslint-disable-next-line no-console
  console.error(boxedMessage);
}

function makeInstallCommand(packageName: string, tag: string): string {
  // Examples
  // yarn 'yarn/1.22.4 npm/? node/v12.14.1 darwin x64'
  // npm 'npm/6.14.7 node/v12.14.1 darwin x64'
  const yarnUsed = process.env.npm_config_user_agent?.includes('yarn');

  let command = '';
  if (isInstalledGlobally === 'yarn') {
    command = `yarn global add ${packageName}`;
  } else if (isInstalledGlobally === 'npm') {
    command = `npm i -g ${packageName}`;
  } else if (yarnUsed) {
    command = `yarn add ${packageName}`;
  } else {
    command = `npm i ${packageName}`;
  }

  command += `@${tag}`;

  return command;
}

export type BoxOptions = {
  title?: string;
  width: number;
  height: number;
  str: string;
  horizontalPadding?: number;
  verticalPadding?: number;
};

const chars = {
  topLeft: '┌',
  topRight: '┐',
  bottomRight: '┘',
  bottomLeft: '└',
  vertical: '│',
  horizontal: '─',
};

function maxLineLength(str: string): number {
  return str.split('\n').reduce((max, curr) => Math.max(max, stringWidth(curr)), 0) + 2;
}

export function drawBox({ title, width, height, str, horizontalPadding }: BoxOptions): string {
  const actualHorizontalPadding = horizontalPadding ?? 0;
  width = Math.max(width, maxLineLength(str) + actualHorizontalPadding * 2);
  const topLine = title
    ? chalk.grey(chars.topLeft + chars.horizontal) +
      ' ' +
      chalk.reset.bold(title) +
      ' ' +
      chalk.grey(chars.horizontal.repeat(width - title.length - 2 - 3) + chars.topRight) +
      chalk.reset()
    : chalk.grey(chars.topLeft + chars.horizontal) + chalk.grey(chars.horizontal.repeat(width - 3) + chars.topRight);

  const bottomLine = chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight;

  const lines = str.split('\n');

  if (lines.length < height) {
    lines.push(...new Array(height - lines.length).fill(''));
  }

  const mappedLines = lines
    .slice(-height)
    .map((l) => {
      const lineWidth = Math.min(stringWidth(l), width);
      const paddingRight = Math.max(width - lineWidth - 2, 0);
      return `${chalk.grey(chars.vertical)}${' '.repeat(actualHorizontalPadding)}${chalk.reset(l)}${' '.repeat(
        paddingRight - actualHorizontalPadding
      )}${chalk.grey(chars.vertical)}`;
    })
    .join('\n');

  return chalk.grey(topLine + '\n' + mappedLines + '\n' + bottomLine);
}
