# plugin-env

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-env.svg?label=@salesforce/plugin-env)](https://www.npmjs.com/package/@salesforce/plugin-env) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-env/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-env/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-env.svg)](https://npmjs.org/package/@salesforce/plugin-env) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-env/main/LICENSE.txt)

## Install

```bash
sfdx plugins:install plugin-env@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-env

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run env
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

## Commands

<!-- commands -->
* [`sf env:display`](#sf-envdisplay)
* [`sf env:list`](#sf-envlist)
* [`sf env:open`](#sf-envopen)

## `sf env:display`

Display details about a specific environment

```
USAGE
  $ sf env:display

OPTIONS
  -e, --environment=environment  Environment name or alias to display.

EXAMPLES
  sf env display -e my-scratch-org
  sf env display -e user@name.com
```

_See code: [src/commands/env/display.ts](https://github.com/salesforcecli/plugin-env/blob/v0.0.4/src/commands/env/display.ts)_

## `sf env:list`

List the environments you’ve created or logged into.

```
USAGE
  $ sf env:list

OPTIONS
  -a, --all               Show all environments, including inactive orgs.
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)

EXAMPLES
  sf env list
  sf env list --all
```

_See code: [src/commands/env/list.ts](https://github.com/salesforcecli/plugin-env/blob/v0.0.4/src/commands/env/list.ts)_

## `sf env:open`

You can open the following types of environments in a web browser: scratch orgs, sandboxes, Dev Hubs, and production orgs.

```
USAGE
  $ sf env:open

OPTIONS
  -e, --target-env=target-env  Environment name or alias to open.
  -p, --path=path              Path to append to the end of the login URL.
  -r, --url-only               Display the URL, but don’t launch it in a browser.
  --browser=browser            Browser in which to open the environment.

DESCRIPTION
  If you run the command without flags, it attempts to open your default environment in your default web browser.

  Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific 
  web page at that URL, specify the portion of the URL after "<URL>/" with the --path flag, such as /apex/YourPage to 
  open a Visualforce page.
  You can open the following types of environments in a web browser: scratch orgs, sandboxes, Dev Hubs, and production 
  orgs.

  If you run the command without flags, it attempts to open your default environment in your default web browser.

  Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific 
  web page at that URL, specify the portion of the URL after "<URL>/" with the --path flag, such as /apex/YourPage to 
  open a Visualforce page.

EXAMPLES
  To open your default environment, run the command without flags:
  sf env open
  This example opens the Visualforce page /apex/StartHere in a scratch org
  with alias "test-org":
  sf env open --target-env test-org --path /apex/StartHere
  If you want to view the URL for the preceding command, but not launch it in a browser,
  add the --url-only flag:
  sf env open --target-env test-org --path /apex/StartHere --url-only
  The preceding examples open the environment in your default web browser. To use
  a different browser, set the --browser flag to its OS-specific name. For example,
  to use Chrome on macOS:
  sf env open --target-env test-org --path /apex/StartHere --browser "google chrome"
```

_See code: [src/commands/env/open.ts](https://github.com/salesforcecli/plugin-env/blob/v0.0.4/src/commands/env/open.ts)_
<!-- commandsstop -->
