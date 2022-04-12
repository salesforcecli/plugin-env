# summary

Delete a sandbox.

# description

Specify an environment with either the username you used when you logged into the environment with "sf login", or the alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

# examples

- Delete a sandbox with alias my-sandbox:

  <%= config.bin %> <%= command.id %> --target-org=my-sandbox

- Specify a username instead of an alias:

  <%= config.bin %> <%= command.id %> --target-org=myusername@example.com.qa

- Delete the org without prompting to confirm :

  <%= config.bin %> <%= command.id %> --target-org=my-sandbox --no-prompt

# flags.target-org.summary

Environment alias or login user.

# flags.no-prompt.summary

Do not prompt the user to confirm the deletion

# prompt.confirm

Delete sandbox with name: %s? Are you sure?

# success

Successfully marked sandbox %s for deletion

# error.isNotSandbox

The target org, %s, is not a sandbox.
