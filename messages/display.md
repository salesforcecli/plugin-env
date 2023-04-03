# summary

Display details about an environment.

# description

Specify an environment with either the username you used when you logged into the environment with "sf login", or the alias you gave the environment when you created it. Run "sf env list" to view all your environments and their aliases.

Output depends on the type of environment.

# examples

- Display details about the "myEnv" environment:

  <%- config.bin %> <%- command.id %> --target-env myEnv

# flags.target-env.summary

Environment alias or login user.

# error.NoResultsFound

No results found.

# error.NoEnvFound

No environment found for %s.

# warning.orgsNoLongerSupported

This command only displays functions environments. Use "%s org display" to display an org.
