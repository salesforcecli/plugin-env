# summary

List the environments you’ve created or logged into.

# description

By default, the command displays active environments. For orgs, active means unexpired scratch orgs and orgs you’re currently logged into.

Output is displayed in multiple tables, one for each environment type. For example, the Salesforce Orgs table lists the non-scratch orgs you’re logged into, such as sandboxes, Dev Hubs, production orgs, and so on. Scratch orgs and compute environments get their own tables.

The two org tables show similar information, such as aliases, information about the org, and how you authorized (logged into) it, such as with a web browser or JWT. The scratch org table also shows the expiration date. For non-scratch orgs, the Username column refers to the user you logged into the org with. For scratch orgs it refers to the username that was generated for you when you created the scratch org. Your default scratch org or Dev Hub org is indicated with the "target-org" or "target-dev-hub" configuration variable, respectively, in the Config column.

The compute environment table shows the alias, information about the connected orgs, the project name, and more.

Use the table manipulation flags, such as --filter and --sort, to change how the data is displayed.

Run "sf env display" to view details about a specific environment.

# examples

- List all active environments:

  <%= config.bin %> <%= command.id %>

- List both active and inactive environments:

  <%= config.bin %> <%= command.id %> --all

- Filter the output to list only orgs you authorized using a web browser; "Auth Method" is the name of a column:

  <%= config.bin %> <%= command.id %> --filter "Auth Method=web"

- Display only the Aliases column and sort the aliases in descending order:

  <%= config.bin %> <%= command.id %> --sort "-Aliases" --columns "Aliases"

- Don't truncate the displayed output and instead wrap text that's wider than your terminal:

  <%= config.bin %> <%= command.id %> --no-truncate

- Display only the table data, not the headers, in comma-separated value (csv) format:

  <%= config.bin %> <%= command.id %> --csv --no-header

# flags.all.summary

Show all environments, even inactive ones.

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

No authenticated environments found. Log in or create an environment, and then try again.

# error.NoResultsFound

No results found.

# warning.RequestedColumnsNotPresentInEnvironment

The columns you specified (%s) aren't available in the table for environment "%s".
