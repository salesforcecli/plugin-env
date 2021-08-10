# summary

List the environments you’ve created or logged into.

# description

The command displays only active environments. For orgs, active means unexpired scratch orgs and orgs you’re currently logged into.

Output is displayed in multiple tables, one for each environment type. For example, the Salesforce Orgs table lists the non-scratch orgs you’re logged into, such as sandboxes, Dev Hubs, production orgs, and so on. Scratch orgs get their own table.

For non-scratch orgs, the Username column refers to the user you logged into the org with. For scratch orgs it refers to the username that was generated for you when you created the scratch org. The table also displays the default environment for each type, the instance URL, and how you authorized (logged into) the org, either using a web browser or JWT.

Use the table-manipulation flags, such as --filter and --sort, to change how the data is displayed.

Run "sf env display" to view details about a specific environment.

# examples

- List all active environments:

  <%= config.bin %> <%= command.id %>

- List all environments:

  <%= config.bin %> <%= command.id %> --all

- Filter the output to list only orgs you authorized using a web browser; "OAuth Method" is the name of a column:

  <%= config.bin %> <%= command.id %> --filter "OAuth Method=web"

- Display only the Alias column and sort the aliases in descending order:

  <%= config.bin %> <%= command.id %> --sort "-Alias" --columns "Alias"

- Don't truncate the displayed output:

  <%= config.bin %> <%= command.id %> --no-truncate

- Display only the table data, not the headers, in comma-separated value (csv) format:

  <%= config.bin %> <%= command.id %> --csv --no-header

# flags.all.summary

Show all envs regardless of status.

# flags.extended.summary

Show extra columns.

# flags.columns.summary

List of columns to display.

# flags.csv.summary

Output in csv format [alias: --output=csv]

# flags.filter.summary

Filter property by partial string matching.

# flags.no-header.summary

Hide table header from output.

# flags.no-truncate.summary

Don't truncate output to fit screen.

# flags.output.summary

Format in which to display the output.

# flags.sort.summary

Column to sort by (prepend '-' for descending).

# error.NoAuthsAvailable

There are no authentications available.

# error.NoResultsFound

No results found.
