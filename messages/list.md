# summary

List the environments you’ve created or logged into.

# description

By default, the command displays active environments.

Output is displayed in multiple tables, one for each environment type.

The compute environment table shows the alias, information about the connected orgs, the project name, and more.

Use the table manipulation flags, such as --filter and --sort, to change how the data is displayed.

Run "sf env display" to view details about a specific environment.

# examples

- List all active environments:

  <%= config.bin %> <%= command.id %>

- List both active and inactive environments:

  <%= config.bin %> <%= command.id %> --all

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

# error.NoResultsFound

No results found.

# warning.RequestedColumnsNotPresentInEnvironment

The columns you specified (%s) aren't available in the table for environment "%s".

# warning.orgsNoLongerSupported

This command only lists functions environments. Use "%s org list" to list orgs.
