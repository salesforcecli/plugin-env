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

# flags.target-hub.summary

Org alias or username for the DevHub

# flags.alias.description

alias for the created env

# flags.set-default.description

Set the org as your default org

# flags.no-ancestors.description

Do not include second-generation package ancestors

# flags.edition.description

Optional values are: developer (default), enterprise, group, and professional. Additionally, partners can create partner edition scratch orgs from a partner business org as using: partner-developer, partner-enterprise, partner-group, and partner-professional.

# flags.definition-file.description

path to an org definition file

# flags.client-id.description

connected app consumer key

# flags.wait.description

how long to wait for the scratch org to be ready

# flags.track-source.description

enable/disable source tracking

# flags.no-namespace.description

Create the scratch org with no namespace

# flags.duration-days.description

Duration of the scratch org in days

# prompt.secret

OAuth client secret of personal connected app

# success

Successfully marked scratch org %s for deletion.

# success.Idempotent

Successfully deleted scratch org %s.
