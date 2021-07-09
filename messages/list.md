# summary
  
List the environments you’ve created or logged into.

# description

By default, the command displays only active environments. For orgs, active means unexpired scratch orgs and orgs you’re currently logged into. For compute environments, active means the environments connected to orgs you’re currently logged into. Use the --all flag to list expired or deleted scratch orgs and compute environments that aren’t connected to logged-in orgs. Warning: the latter list could be very long.

Output is displayed in multiple tables, one for each environment type.  For example, the Salesforce Orgs table lists the non-scratch orgs you’re logged into, such as sandboxes, Dev Hubs, production orgs, and so on. Scratch orgs and compute environments get their own tables.

For non-scratch orgs, the Username column refers to the user you logged into the org with. For scratch orgs it refers to the username that was generated for you when you created the scratch org. The first column indicates the default environment for each type.

Run "sf env display" to view details about a specific environment.

# examples

- List all environments:

  <%= config.bin %> <%= command.id %> --all

- Filter the output to list only connected orgs. Rows from only the Salesforce Orgs table are displayed because it’s the only table with a "Status" column.

  <%= config.bin %> <%= command.id %> --filter "Status=Connected"

- List only scratch orgs that expire after May 30, 2021:

  <%= config.bin %> <%= command.id %> --filter "Expiration>2021-05-30"

- Display only the Alias column and sort the aliases in descending order:

  <%= config.bin %> <%= command.id %> --sort "-Alias" --columns "Alias"

# flags.all.summary

Show all environments, even inactive ones.

# error.NoAuthsAvailable

There are no authentications available.

# error.NoResultsFound

No results found.
