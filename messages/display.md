# summary

Display details about an environment.

# description

Specify an environment with either the username you used when you logged into the environment with "sf login", or the alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

Output depends on the type of environment. For example, scratch org details include the access token, alias, username of the associated Dev Hub, the creation and expiration date, the generated scratch org username, and more. Compute environment details include the alias, connected orgs, creation date, project name, and more.

# examples

- Display details about a scratch org with alias my-scratch-org:

  <%= config.bin %> <%= command.id %> --target-env=my-scratch-org

- Specify a username instead of an alias:

  <%= config.bin %> <%= command.id %> --target-env=test-123456-abcdefg@example.com

- Specify JSON format and redirect output into a file:

  <%= config.bin %> <%= command.id %> --target-env=my-scratch-org --json > tmp/MyOrdDesc.json

# flags.target-env.summary

Environment alias or login user.

# error.NoResultsFound

No results found.

# error.NoEnvFound

No environment found for %s.

# error.NoDefaultEnv

No default environment found. Use -e or --target-env to specify an environment to display.
