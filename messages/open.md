# summary

Open an environment in a web browser.

# description

Each of your environments is associated with an instance URL, such as https://login.salesforce.com. To open a specific web page, specify the portion of the URL after "<URL>/" with the --path flag.

# examples

- Open the compute environment with alias "test-compute":

  <%= config.bin %> <%= command.id %> --target-env test-compute

- View the URL but don't launch it in a browser:

  <%= config.bin %> <%= command.id %> --target-env test-compute --url-only

- Open the environment in the Google Chrome browser:

  <%= config.bin %> <%= command.id %> --target-env test-compute --url-only --browser chrome

# flags.path.summary

Path to append to the end of the login URL.

# flags.url-only.summary

Display the URL, but don’t launch it in a browser.

# flags.target-env.summary

Login user or alias of the environment to open.

# flags.browser.summary

Browser in which to open the environment.

# flags.browser.description

You can specify that the environment open in one of the following browsers: Firefox, Safari, Google Chrome, or Windows Edge. If you don’t specify --browser, the environment opens in your default browser. The exact names of the browser applications differ depending on the operating system you're on; check your documentation for details.

# error.NoDefaultEnv

No default environment found. Use -e or --target-env to specify an environment to open.

# error.NoEnvFound

No environment found for %s.

# error.EnvironmentNotSupported

The environment %s doesn't support being opened.

# error.ApplicationNotFound

Can't find application named %s.

# warning.orgsNoLongerSupported

This command only opens a function's environment. Use "%s org open" to open an org.
