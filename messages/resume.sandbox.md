# summary

Check sandbox create status and complete authorization, if possible.

# description

Sandbox creation can take a long time, so we check the status of the sandbox creation using <%= config.bin %> <%= command.id %>.

# examples

- Check the status of sandbox creation using the sandbox name.

  <%= config.bin %> <%= command.id %> --name <sandbox name> [--target-org <production org username>]

- Check the status of sandbox creation using the sandbox request job id.

  <%= config.bin %> <%= command.id %> --job-id 0GRxxxxxxxxxxxxxxx [--target-org <production org username>]

- Check the status of sandbox creation using the latest sandbox request.

  <%= config.bin %> <%= command.id %> --use-latest-request

# flags.setDefault.summary

Set the sandbox org as your default org.

# flags.id.summary

The sandbox process object Id.

# flags.id.description

The sandbox process object Id.

# flags.alias.summary

Alias for the sandbox org.

# flags.alias.description

When you create a sandbox, the generated usernames are based on the usernames present in the production org. To ensure uniqueness, the new usernames are appended with the name of the sandbox. For example, the username "user@example.com" in the production org results in the username "user@example.com.mysandbox" in a sandbox named "mysandbox". When you set an alias for a sandbox org, it's assigned to the resulting username of the user running this command.

# flags.targetOrg.summary

Username or alias of the production org that contains the sandbox license.

# flags.targetOrg.description

When it creates the sandbox org, Salesforce copies the metadata, and optionally data, from your production org to the new sandbox org.

# flags.name.summary

Name of the sandbox org.

# flags.name.description

Name of the sandbox org.

# flags.wait.summary

Number of minutes to wait for the sandbox org to be ready.

# flags.poll-interval.summary

Number of seconds to wait between retries.

# flags.async.summary

Don't wait for the sandbox create to complete.

# flags.use-most-recent.summary

Use the most recent sandbox create request.

# flags.use-most-recent.description

Use the most recent sandbox create request.

# error.pollIntervalGreaterThanWait

The poll interval (%d seconds) can't be larger that wait (%d in seconds).

# error.NoSandboxNameOrJobId

No sandbox name or job ID were provided.

# error.LatestSandboxRequestNotFound

Please retry the command using either the --name or --job-id flags.

#error.NoSandboxRequestFound

Could not find a sandbox request using the provided sandbox name or job ID.
