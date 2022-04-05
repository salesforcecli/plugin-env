# summary

Create a sandbox org.

# description

There are two ways to create a sandbox org: specify a definition file that contains the sandbox options or use the --name and --license-type flags to specify the two required options. If you want to set an option other than name or license type, such as apexClassId, you must use a definition file.

# examples

- Create a sandbox org using a definition file and give it the alias "MyDevSandbox". The production org that contains the sandbox license has the alias "prodOrg".

  <%= config.bin %> <%= command.id %> -f config/dev-sandbox-def.json --alias MyDevSandbox --target-org prodOrg

- Create a sandbox org by directly specifying its name and type of license (Developer) instead of using a definition file. Set the sandbox org as your default.

  <%= config.bin %> <%= command.id %> --name mysandbox --license-type Developer --alias MyDevSandbox --target-org prodOrg --set-default

# flags.setDefault.summary

Set the sandbox org as your default org.

# flags.alias.summary

Alias for the sandbox org.

# flags.alias.description

When you create a sandbox, the generated usernames are based on the usernames present in the production org. To ensure uniqueness, the new usernames are appended with the name of the sandbox. For example, the username "user@example.com" in the production org results in the username "user@example.com.mysandbox" in a sandbox named "mysandbox". When you set an alias for a sandbox org, it's assigned to the resulting username of the user running this command.

# flags.targetOrg.summary

Username or alias of the production org that contains the sandbox license.

# flags.targetOrg.description

When it creates the sandbox org, Salesforce copies the metadata, and optionally data, from your production org to the new sandbox org.

# flags.definitionFile.summary

Path to a sandbox definition file.

# flags.definitionFile.description

The sandbox definition file is a blueprint for the sandbox. You can create different definition files for each sandbox type that you use in the development process. See https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_sandbox_definition.htm for all the options you can specify in the defintion file.

# flags.name.summary

Name of the sandbox org.

# flags.name.description

The name must be a unique alphanumeric string (10 or fewer characters) to identify the sandbox. You can’t reuse a name while a sandbox is in the process of being deleted.

# flags.licenseType.summary

Type of sandbox license.

# flags.wait.summary

Number of minutes to wait for the sandbox org to be ready.

# flags.poll-interval.summary

Number of seconds to wait between retries.

# flags.async.summary

Don't wait for the sandbox create to complete.

# flags.noPrompt.summary

Don't prompt for confirmation about the sandbox configuration.

# sandboxSuccess

The sandbox org creation %s is in progress.

# checkSandboxStatus

Run "sf env resume sandbox --job-id %s -o %s" to check for status.
If the org is ready, checking the status also authorizes the org for use with Salesforce CLI.

# isConfigurationOk

Is the configuration correct?

# warning.NoSandboxNameDefined

No SandboxName defined, generating new SandboxName: %s.

# error.RequiresTargetOrg

This command requires a target-org. Specify it with the --target-org flag or by running the "sf config set target-org=<username>" command.

# error.MissingLicenseType

The sandbox license type is required, but you didn't provide a value. Specify the license type in the sandbox definition file with the "licenseType" option, or specify the --license-type and --name flags at the command-line. See https://developer.salesforce.com/docs/atlas.en-us.sf_dev.meta/sf_dev/sf_dev_sandbox_definition.htm for more information.

# error.DnsTimeout

The sandbox creation failed because the DNS name resolution timed out.

# error.PartialSuccess

If you specified the -a or -s flags, but the sandbox wasn't immediately available, the "env create sandbox" command may not have finished setting the alias or target-org.
If so, set the alias manually with "sf alias set" and the target-org with "sf config set".

# error.NoConfig

Specify either a sandbox definition file or the --name and --license-type flags together.

# error.SandboxNameLength

The sandbox name "%s" should be 10 or fewer characters.

# error.UserNotSatisfiedWithSandboxConfig

The sandbox request configuration isn't acceptable.

# error.pollIntervalGreaterThanWait

The poll interval (%d seconds) can't be larger that wait (%d in seconds).
