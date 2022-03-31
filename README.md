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

- [`sf env create scratch`](#sf-env-create-scratch)
- [`sf env delete sandbox`](#sf-env-delete-sandbox)
- [`sf env delete scratch`](#sf-env-delete-scratch)
- [`sf env display`](#sf-env-display)
- [`sf env list`](#sf-env-list)
- [`sf env open`](#sf-env-open)

## `sf env create scratch`

Create a scratch org.

```
USAGE
  $ sf env create scratch [--json] [-a <value>] [-d] [-f <value>] [-v <value>] [-c] [-e
    developer|enterprise|group|professional|partner-developer|partner-enterprise|partner-group|partner-professional]
    [-m] [-y <value>] [-w <value>] [--api-version <value>] [-i <value>]

FLAGS
  -a, --alias=<value>            Alias for the scratch org.
  -d, --set-default              Set the scratch org as your default org
  -e, --edition=<option>         Salesforce edition of the scratch org.
                                 <options: developer|enterprise|group|professional|partner-developer|partner-enterprise|
                                 partner-group|partner-professional>
  -f, --definition-file=<value>  Path to a scratch org definition file.
  -i, --client-id=<value>        Consumer key of the Dev Hub connected app.
  -v, --target-dev-hub=<value>   Username or alias of the Dev Hub org.
  -w, --wait=<value>             [default: 5 minutes] Number of minutes to wait for the scratch org to be ready.
  -y, --duration-days=<value>    [default: 7 days] Number of days before the org expires.
  --api-version=<value>          Override the api version used for api requests made by this command

PACKAGING FLAGS
  -c, --no-ancestors  Don't include second-generation managed package (2GP) ancestors in the scratch org.
  -m, --no-namespace  Create the scratch org with no namespace, even if the Dev Hub has a namespace.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create a scratch org.

  There are two ways to create a scratch org: specify a definition file that contains the options or use the --edition
  flag to specify the one required option. If you want to set options other than the edition, such as org features or
  settings, you must use a definition file.

  You must specify a Dev Hub to create a scratch org, either with the --target-dev-hub flag or by setting your default
  Dev Hub with the target-dev-hub configuration variable.

EXAMPLES
  Create a Developer edition scratch org using your default Dev Hub and give the scratch org an alias:

    $ sf env create scratch --edition=developer --alias my-scratch-org

  Specify the Dev Hub using its alias and a scratch org definition file. Set the scratch org as your default and
  specify that it expires in 3 days:

    $ sf env create scratch --target-dev-hub=MyHub --definition-file config/project-scratch-def.json --set-default \
      --duration-days 3

FLAG DESCRIPTIONS
  -a, --alias=<value>  Alias for the scratch org.

    New scratch orgs include one administrator by default. The admin user's username is auto-generated and looks
    something like test-wvkpnfm5z113@example.com. When you set an alias for a new scratch org, it's assigned this
    username.

  -e, --edition=developer|enterprise|group|professional|partner-developer|partner-enterprise|partner-group|partner-professional

    Salesforce edition of the scratch org.

    The editions that begin with "partner-" are available only if the Dev Hub org is a Partner Business Org.

  -f, --definition-file=<value>  Path to a scratch org definition file.

    The scratch org definition file is a blueprint for the scratch org. It mimics the shape of an org that you use in
    the development life cycle, such as acceptance testing, packaging, or production. See
    <https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file.htm> for
    all the option you can specify in the definition file.

  -v, --target-dev-hub=<value>  Username or alias of the Dev Hub org.

    Overrides the value of the target-dev-hub configuration variable, if set.
```

## `sf env delete sandbox`

Delete a sandbox.

```
USAGE
  $ sf env delete sandbox [--json] [-o <value>] [-p]

FLAGS
  -o, --target-org=<value>  Environment alias or login user.
  -p, --no-prompt           Do not prompt the user to confirm the deletion

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Delete a sandbox.

  Specify an environment with either the username you used when you logged into the environment with "sf login", or the
  alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

EXAMPLES
  Delete a sandbox with alias my-sandbox:

    $ sf env delete sandbox --target-org=my-sandbox

  Specify a username instead of an alias:

    $ sf env delete sandbox --target-org=myusername@example.com.qa

  Delete the org without prompting to confirm :

    $ sf env delete sandbox --target-org=my-sandbox --no-prompt
```

## `sf env delete scratch`

Delete a scratch org.

```
USAGE
  $ sf env delete scratch [--json] [-o <value>] [-p]

FLAGS
  -o, --target-org=<value>  Org alias or login user.
  -p, --no-prompt           Do not prompt the user to confirm the deletion

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Delete a scratch org.

  Specify an environment with either the username you used when you logged into the environment with "sf login", or the
  alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

EXAMPLES
  Delete a scratch org with alias my-scratch-org:

    $ sf env delete scratch --target-org=my-scratch-org

  Specify a username instead of an alias:

    $ sf env delete scratch --target-org=test-123456-abcdefg@example.com

  Delete the org without prompting to confirm :

    $ sf env delete scratch --target-org=my-scratch-org --no-prompt
```

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

  Output depends on the type of environment. For example, scratch org details include the access token, alias, username
  of the associated Dev Hub, the creation and expiration date, the generated scratch org username, and more. Compute
  environment details include the alias, connected orgs, creation date, project name, and more.

EXAMPLES
  Display details about a scratch org with alias my-scratch-org:

    $ sf env display --target-env=my-scratch-org

  Specify a username instead of an alias:

    $ sf env display --target-env=test-123456-abcdefg@example.com

  Specify JSON format and redirect output into a file:

    $ sf env display --target-env=my-scratch-org --json > tmp/MyOrdDesc.json
```

## `sf env list`

List the environments you’ve created or logged into.

```
USAGE
  $ sf env list [--json] [-a] [--columns <value>] [--csv] [--filter <value>] [--no-header] [--no-truncate]
    [--output csv|json|yaml] [--sort <value>]

FLAGS
  -a, --all             Show all environments, even inactive ones.
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

  By default, the command displays active environments. For orgs, active means unexpired scratch orgs and orgs you’re
  currently logged into.

  Output is displayed in multiple tables, one for each environment type. For example, the Salesforce Orgs table lists
  the non-scratch orgs you’re logged into, such as sandboxes, Dev Hubs, production orgs, and so on. Scratch orgs and
  compute environments get their own tables.

  The two org tables show similar information, such as aliases, information about the org, and how you authorized
  (logged into) it, such as with a web browser or JWT. The scratch org table also shows the expiration date. For
  non-scratch orgs, the Username column refers to the user you logged into the org with. For scratch orgs it refers to
  the username that was generated for you when you created the scratch org. Your default scratch org or Dev Hub org is
  indicated with the "target-org" or "target-dev-hub" configuration variable, respectively, in the Config column.

  The compute environment table shows the alias, information about the connected orgs, the project name, and more.

  Use the table manipulation flags, such as --filter and --sort, to change how the data is displayed.

  Run "sf env display" to view details about a specific environment.

EXAMPLES
  List all active environments:

    $ sf env list

  List both active and inactive environments:

    $ sf env list --all

  Filter the output to list only orgs you authorized using a web browser; "Auth Method" is the name of a column:

    $ sf env list --filter "Auth Method=web"

  Display only the Aliases column and sort the aliases in descending order:

    $ sf env list --sort "-Aliases" --columns "Aliases"

  Don't truncate the displayed output and instead wrap text that's wider than your terminal:

    $ sf env list --no-truncate

  Display only the table data, not the headers, in comma-separated value (csv) format:

    $ sf env list --csv --no-header
```

## `sf env open`

Open an environment in a web browser.

```
USAGE
  $ sf env open [--json] [-p <value>] [-r] [-e <value>] [--browser <value>]

FLAGS
  -e, --target-env=<value>  Login user or alias of the environment to open.
  -p, --path=<value>        Path to append to the end of the login URL.
  -r, --url-only            Display the URL, but don’t launch it in a browser.
  --browser=<value>         Browser in which to open the environment.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Open an environment in a web browser.

  You can open the following types of environments in a web browser: scratch orgs, sandboxes, Dev Hubs, and production
  orgs. Run "sf env list" to view your environments and their aliases and login usernames.

  Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific
  web page, specify the portion of the URL after "<URL>/" with the --path flag, such as /apex/YourPage to open a
  Visualforce page.

EXAMPLES
  Open the Visualforce page /apex/StartHere in a scratch org with alias test-org:

    $ sf env open --target-env test-org --path /apex/StartHere

  View the URL but don't launch it in a browser:

    $ sf env open --target-env test-org --path /apex/StartHere --url-only

  Open the environment in the Google Chrome browser:

    $ sf env open --target-env test-org --path /apex/StartHere --browser chrome

FLAG DESCRIPTIONS
  -e, --target-env=<value>  Login user or alias of the environment to open.

    Specify the login user or alias that’s associated with the environment. For scratch orgs, the login user is
    generated by the command that created the scratch org. You can also set an alias for the scratch org when you create
    it.

    For Dev Hubs, sandboxes, and production orgs, specify the alias you set when you logged into the org with "sf
    login".

  --browser=<value>  Browser in which to open the environment.

    You can specify that the environment open in one of the following browsers: Firefox, Safari, Google Chrome, or
    Windows Edge. If you don’t specify --browser, the environment opens in your default browser. The exact names of the
    browser applications differ depending on the operating system you're on; check your documentation for details.
```

<!-- commandsstop -->
