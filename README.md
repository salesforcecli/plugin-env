# plugin-env

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-env.svg?label=@salesforce/plugin-env)](https://www.npmjs.com/package/@salesforce/plugin-env) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-env.svg)](https://npmjs.org/package/@salesforce/plugin-env) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-env/main/LICENSE.txt)

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

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev env
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

- [`sf env display`](#sf-env-display)
- [`sf env list`](#sf-env-list)
- [`sf env open`](#sf-env-open)

## `sf env display`

Display details about an environment.

```
USAGE
  $ sf env display [--json] [-e <value>]

FLAGS
  -e, --target-env=<value>  Environment alias or login user.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Display details about an environment.

  Specify an environment with either the username you used when you logged into the environment with "sf login", or the
  alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

  Output depends on the type of environment.

EXAMPLES
  Display details about the "myEnv" environment:

    $ sf env display --target-env myEnv
```

_See code: [src/commands/env/display.ts](https://github.com/salesforcecli/plugin-env/blob/3.0.29/src/commands/env/display.ts)_

## `sf env list`

List the environments you’ve created or logged into.

```
USAGE
  $ sf env list [--json] [-a] [--columns <value>] [--csv] [--filter <value>] [--no-header] [--no-truncate]
    [--output csv|json|yaml] [--sort <value>]

FLAGS
  -a, --all                 Show all environments, even inactive ones.
      --columns=<value>...  List of columns to display.
      --csv                 Output in csv format [alias: --output=csv]
      --filter=<value>      Filter property by partial string matching.
      --no-header           Hide table header from output.
      --no-truncate         Don't truncate output to fit screen.
      --output=<option>     Format in which to display the output.
                            <options: csv|json|yaml>
      --sort=<value>        Column to sort by (prepend '-' for descending).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List the environments you’ve created or logged into.

  By default, the command displays active environments.

  Output is displayed in multiple tables, one for each environment type.

  The compute environment table shows the alias, information about the connected orgs, the project name, and more.

  Use the table manipulation flags, such as --filter and --sort, to change how the data is displayed.

  Run "sf env display" to view details about a specific environment.

EXAMPLES
  List all active environments:

    $ sf env list

  List both active and inactive environments:

    $ sf env list --all

  Don't truncate the displayed output and instead wrap text that's wider than your terminal:

    $ sf env list --no-truncate

  Display only the table data, not the headers, in comma-separated value (csv) format:

    $ sf env list --csv --no-header
```

_See code: [src/commands/env/list.ts](https://github.com/salesforcecli/plugin-env/blob/3.0.29/src/commands/env/list.ts)_

## `sf env open`

Open an environment in a web browser.

```
USAGE
  $ sf env open [--json] [-p <value>] [-r] [-e <value>] [--browser <value>]

FLAGS
  -e, --target-env=<value>  Login user or alias of the environment to open.
  -p, --path=<value>        Path to append to the end of the login URL.
  -r, --url-only            Display the URL, but don’t launch it in a browser.
      --browser=<value>     Browser in which to open the environment.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Open an environment in a web browser.

  Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific
  web page, specify the portion of the URL after "<URL>/" with the --path flag.

EXAMPLES
  Open the compute environment with alias "test-compute":

    $ sf env open --target-env test-compute

  View the URL but don't launch it in a browser:

    $ sf env open --target-env test-compute --url-only

  Open the environment in the Google Chrome browser:

    $ sf env open --target-env test-compute --url-only --browser chrome

FLAG DESCRIPTIONS
  --browser=<value>  Browser in which to open the environment.

    You can specify that the environment open in one of the following browsers: Firefox, Safari, Google Chrome, or
    Windows Edge. If you don’t specify --browser, the environment opens in your default browser. The exact names of the
    browser applications differ depending on the operating system you're on; check your documentation for details.
```

_See code: [src/commands/env/open.ts](https://github.com/salesforcecli/plugin-env/blob/3.0.29/src/commands/env/open.ts)_

<!-- commandsstop -->
