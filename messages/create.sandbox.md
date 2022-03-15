# summary

Create a sandbox org

# description

Creates a sandbox org using the values specified in a configuration file or --name and --license-type flags.

When creating sandboxes, the --target-org (-o) must be a production org with sandbox licenses.

# examples

- $ sf env create sandbox -f config/dev-sandbox-def.json -a MyDevSandbox --target-org prodOrg

- $ sf env create sandbox -f config/dev-sandbox-def.json -a MyDevSandbox -o prodOrg

- $ sf env create sandbox --name mysandbox --license-type Developer -a MyDevSandbox -o prodOrg

# flags.setDefault.summary

Set the created org as the default username

# flags.alias.summary

Alias for the created org

# flags.targetOrg.summary

Username or alias of the org for which a sandbox will be created.

# flags.definitionFile.summary

Path to a sandbox definition file

# flags.definitionJson.summary

Sandbox definition in JSON format

# flags.name.summary

Name of the sandbox

# flags.licenseType.summary

Sandbox license type

# flags.wait.summary

The streaming client socket timeout (in minutes)

# flags.noPrompt.summary

Prevents command from prompting user for config confirmation.

# sandboxSuccess

The sandbox org creation process %s is in progress. Run "sf env resume sandbox --job-id %s -o %s" to check for status. If the org is ready, checking the status also authorizes the org for use with Salesforce CLI.

# isConfigurationOk

Is the configuration correct?

# warning.NoSandboxNameDefined

No SandboxName defined, generating new SandboxName: %s

# error.RequiresTargetOrg

This command requires a target-org. Specify it with the -e parameter or with the "sf config set target-org=<username>" command.

# error.MissingLicenseType

The sandbox license type is required, but you didn't provide a value. Specify the license type in the sandbox definition file with the "licenseType" option, or specify the option as a name-value pair at the command-line. See https://developer.salesforce.com/docs/atlas.en-us.sf_dev.meta/sf_dev/sf_dev_sandbox_definition.htm for more information.

# error.DnsTimeout

The sandbox was successfully created and authenticated. However, the sandbox DNS records aren't ready yet and so the sandbox may not be available. Run "force:org:list" and check if the sandbox is listed correctly. If it isn't listed, run "force:org:status" to view its status and, if necessary, authenticate to it again. If this issue happens frequently, try setting the SFDX_DNS_TIMEOUT environment variable to a larger number; the default value is 3 seconds.

# error.PartialSuccess

If you specified the -a or -s parameters, but the sandbox wasn't immediately available, the "env create sandbox" command may not have finished setting the alias or target-org.
If so, set the alias manually with "sf alias set" and the target-org with "sf config set".

# error.NoConfig

Please specify an org configuration via file and/or key=value pairs.

# error.DefPropertiesNotFormattedProperly

The proper format of --def-property entries is "keyword=value". Found "%s".

# error.SandboxNameLength

The sandbox name "%s" should be 10 or fewer characters.

# error.UserNotSatisfiedWithSandboxConfig

The sandbox request configuration is not acceptable.
