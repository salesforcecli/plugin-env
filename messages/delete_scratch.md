# summary

Delete a scratch org.

# description

Specify an environment with either the username you used when you logged into the environment with "sf login", or the alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

# examples

- Delete a scratch org with alias my-scratch-org:

  <%= config.bin %> <%= command.id %> --target-env=my-scratch-org

- Specify a username instead of an alias:

  <%= config.bin %> <%= command.id %> --target-env=test-123456-abcdefg@example.com

- Delete the org without prompting to confirm :

  <%= config.bin %> <%= command.id %> --target-env=my-scratch-org --no-prompt

# flags.target-env.summary

Environment alias or login user.

# flags.no-prompt.summary

Do not prompt the user to confirm the deletion

# error.NoDefaultEnv

No default environment found. Use -e or --target-env to specify an environment to display.

# prompt.confirm

Enqueue scratch org with name: %s for deletion? Are you sure?

# success

Successfully marked scratch org %s for deletion.

# success.Idempotent

Successfully deleted scratch org %s.
