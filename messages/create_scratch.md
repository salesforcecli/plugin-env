# summary

Create a scratch org.

# description

Blah.

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

# flags.alias.description

alias for the created env

# flags.no-ancestors.description

Do not include second-generation package ancestors

# prompt.secret

OAuth client secret of personal connected app

# success

Successfully marked scratch org %s for deletion.

# success.Idempotent

Successfully deleted scratch org %s.
