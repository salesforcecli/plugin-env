# summary

Create a scratch org.

# description

Using a DevHub, create a scratch org based on a configuration file or an edition.

# examples

- Create a Developer edition org from your default Dev hub

  <%= config.bin %> <%= command.id %> --edition=developer

- Specify a DevHub and a scratch org definition file. Set the org to expire in 3 days and be as your default org

  <%= config.bin %> <%= command.id %> --target-hub=myHub --definition-file config/project-scratch-def.json --duration-days 3 --set-default

# flags.target-hub.summary

Org alias or username for the DevHub

# flags.alias.summary

alias for the created env

# flags.set-default.summary

set the org as your default org

# flags.no-ancestors.summary

do not include second-generation package ancestors

# flags.edition.summary

the options beginning with "partner-" are available if the DevHub is a partner business org

# flags.definition-file.summary

path to an org definition file. <https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file.htm>

# flags.client-id.summary

connected app consumer key

# flags.wait.summary

how long to wait for the scratch org to be ready

# flags.track-source.summary

enable/disable source tracking

# flags.no-namespace.summary

create the scratch org with no namespace, even if the DevHub has a namespace

# flags.duration-days.summary

Duration of the scratch org in days

# prompt.secret

OAuth client secret of personal connected app

# success

Your scratch org is ready.
