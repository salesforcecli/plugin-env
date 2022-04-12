# sandboxSuccess

The sandbox org creation was successful.

# sandboxSuccess.actions

The username for the sandbox is %s.
You can open the org by running "sf env open -e %s"

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

# error.DnsTimeout.actions

- Run "sf env resume sandbox --job-id %s -o %s" to check for status.
  If the org is ready, checking the status also authorizes the org for use with Salesforce CLI.

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
