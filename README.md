# plugin-env;

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
* [`sf env:connect`](#sf-envconnect)
* [`sf env:list`](#sf-envlist)

## `sf env:connect`

connect to a Salesforce account or environment

```
USAGE
  $ sf env:connect

OPTIONS
  -f, --jwt-key-file=jwt-key-file  path to a file containing the private key
  -i, --client-id=client-id        OAuth client ID (sometimes called the consumer key)
  -r, --instance-url=instance-url  [default: https://login.salesforce.com] the login URL
  -u, --username=username          authentication username

EXAMPLE
```

_See code: [src/commands/env/connect.ts](https://github.com/salesforcecli/plugin-env/blob/v0.0.1/src/commands/env/connect.ts)_

## `sf env:list`

list environments

```
USAGE
  $ sf env:list

OPTIONS
  -a, --all               show all environments regardless of whether they're connected or not
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

_See code: [src/commands/env/list.ts](https://github.com/salesforcecli/plugin-env/blob/v0.0.1/src/commands/env/list.ts)_
<!-- commandsstop -->
