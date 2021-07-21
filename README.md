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
* [`sf env display`](#sf-env-display)
* [`sf env list`](#sf-env-list)
* [`sf env open`](#sf-env-open)

## `sf env display`

Specify an environment with either the username you used when you ran the "sf login" command or the environment's alias. Run "sf env list" to view all your environments and their aliases.

```
USAGE
  $ sf env display [--json] [-e <value>]

FLAGS
  -e, --target-env=<value>  Environment alias or login user.

GLOBAL FLAGS
  --json  format output as json

DESCRIPTION
  Display details about an environment.

  Specify an environment with either the username you used when you ran the "sf login" command or the environment's
  alias. Run "sf env list" to view all your environments and their aliases.

  Output depends on the type of environment. For example, scratch org details include the access token, alias, username
  of the associated Dev Hub, the creation and expiration date, the generated scratch org username, and more. Compute
  environment details include the associated orgs, the list of functions, the project name, and more.

EXAMPLES
  Display details about a scratch org with alias my-scratch-org:

    $ sf env display --target-env=my-scratch-org

  Specify a username instead of an alias:

    $ sf env display --target-env=test-123456-abcdefg@example.com

  Specify JSON format and redirect output into a file:

    $ sf env display --target-env=my-scratch-org --json > tmp/MyOrdDesc.json
```

## `sf env list`

By default, the command displays only active environments. For orgs, active means unexpired scratch orgs and orgs you’re currently logged into. For compute environments, active means the environments connected to orgs you’re currently logged into. Use the --all flag to list expired or deleted scratch orgs and compute environments that aren’t connected to logged-in orgs. Warning: the latter list could be very long.

```
USAGE
  $ sf env list [--json] [-x] [--columns <value>] [--csv] [--filter <value>] [--no-header] [--no-truncate]
    [--output csv|json|yaml] [--sort <value>]

FLAGS
  -x, --extended        Show extra columns.
  --columns=<value>...  Only show provided columns.
  --csv                 Output in csv format [alias: --output=csv]
  --filter=<value>      Filter property by partial string matching.
  --no-header           Hide table header from output.
  --no-truncate         Do not truncate output to fit screen.

  --output=<option>     Output in a more machine friendly format.
                        <options: csv|json|yaml>

  --sort=<value>        Property to sort by (prepend '-' for descending).

GLOBAL FLAGS
  --json  format output as json

DESCRIPTION
  List the environments you’ve created or logged into.

  By default, the command displays only active environments. For orgs, active means unexpired scratch orgs and orgs
  you’re currently logged into. For compute environments, active means the environments connected to orgs you’re
  currently logged into. Use the --all flag to list expired or deleted scratch orgs and compute environments that aren’t
  connected to logged-in orgs. Warning: the latter list could be very long.

  Output is displayed in multiple tables, one for each environment type. For example, the Salesforce Orgs table lists
  the non-scratch orgs you’re logged into, such as sandboxes, Dev Hubs, production orgs, and so on. Scratch orgs and
  compute environments get their own tables.

  For non-scratch orgs, the Username column refers to the user you logged into the org with. For scratch orgs it refers
  to the username that was generated for you when you created the scratch org. The first column indicates the default
  environment for each type.

  Run "sf env display" to view details about a specific environment.

EXAMPLES
  List all environments:

    $ sf env list --all

  Filter the output to list only connected orgs. Rows from only the Salesforce Orgs table are displayed because it’s
  the only table with a "Status" column.

    $ sf env list --filter "Status=Connected"

  List only scratch orgs that expire after May 30, 2021:

    $ sf env list --filter "Expiration>2021-05-30"

  Display only the Alias column and sort the aliases in descending order:

    $ sf env list --sort "-Alias" --columns "Alias"
```

## `sf env open`

You can open the following types of environments in a web browser: scratch orgs, sandboxes, Dev Hubs, and production orgs.

```
USAGE
  $ sf env open [--json] [-p <value>] [-r] [-e <value>] [--browser <value>]

FLAGS
  -e, --target-env=<value>  Environment login user or alias to open.
  -p, --path=<value>        Path to append to the end of the login URL.
  -r, --url-only            Display the URL, but don’t launch it in a browser.
  --browser=<value>         Browser in which to open the environment.

GLOBAL FLAGS
  --json  format output as json

DESCRIPTION
  Open an environment in your web browser.

  You can open the following types of environments in a web browser: scratch orgs, sandboxes, Dev Hubs, and production
  orgs.

  If you run the command without flags, it attempts to open your default environment in your default web browser. Run
  "sf env list" to view your default environment.

  Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific
  web page, specify the portion of the URL after "<URL>/" with the --path flag, such as /apex/YourPage to open a
  Visualforce page.

EXAMPLES
  Open your default environment:

    $ sf env open

  Open the Visualforce page /apex/StartHere in a scratch org with alias test-org:

    $ sf env open --target-env test-org --path /apex/StartHere

  View the URL but don't launch it in a browser:

    $ sf env open --target-env test-org --path /apex/StartHere --url-only

  Open the environment in the Google Chrome browser:

    $ sf env open --target-env test-org --path /apex/StartHere --browser chrome

FLAG DESCRIPTIONS
  -e, --target-env=<value>  Environment login user or alias to open.

    Specify the login user or alias that’s associated with the environment. For scratch orgs, the login user is
    generated by the command that created the scratch org. You can also set an alias for the scratch org when you create
    it.

    For Dev Hubs, sandboxes, and production orgs, specify the alias you set when you logged into the org with "sf
    login".

  --browser=<value>  Browser in which to open the environment.

    You can specify that the environment open in one of the following browsers: Firefox, Safari, Google Chrome, or
    Windows Edge. If you don’t specify --browser, the environment opens in your default browser.
```
<!-- commandsstop -->
