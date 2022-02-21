# summary

Delete a scratch org.

# description

Specify an environment with either the username you used when you logged into the environment with "sf login", or the alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

# examples

- Delete a scratch org with alias my-scratch-org:

  <%= config.bin %> <%= command.id %> --target-org=my-scratch-org

- Specify a username instead of an alias:

  <%= config.bin %> <%= command.id %> --target-org=test-123456-abcdefg@example.com

- Delete the org without prompting to confirm :

  <%= config.bin %> <%= command.id %> --target-org=my-scratch-org --no-prompt

# flags.target-org.summary

Org alias or login user.

# flags.no-prompt.summary

Do not prompt the user to confirm the deletion

# prompt.confirm

Enqueue scratch org with name: %s for deletion? Are you sure?

# success

Successfully marked scratch org %s for deletion.

# success.Idempotent

Successfully deleted scratch org %s.
