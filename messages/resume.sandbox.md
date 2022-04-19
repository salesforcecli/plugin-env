# summary

Check the status of a sandbox creation, and log in to it if it's ready.

# description

Sandbox creation can take a long time. If the original "sf env create sandbox" command either times out, or you specified the --async flag, the command displays a job ID. Use this job ID to check whether the sandbox creation is complete, and if it is, the command then logs into it.

You can also use the sandbox name to check the status or the --use-most-recent flag to use the job ID of the most recent sandbox creation.

# examples

- Check the status of sandbox creation using the sandbox name and a production org with alias "prodOrg":

  <%= config.bin %> <%= command.id %> --name mysandbox --target-org prodOrg

- Check the status using the job ID:

  <%= config.bin %> <%= command.id %> --job-id 0GRxxxxxxxx

- Check the status of the most recent sandbox create request:

  <%= config.bin %> <%= command.id %> --use-most-recent

# flags.setDefault.summary

Set the sandbox org as your default org.

# flags.id.summary

Job ID of the incomplete sandbox creation that you want to check the status of.

# flags.id.description

The job ID is valid for 24 hours after you start the sandbox creation.

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

# flags.wait.summary

Number of minutes to wait for the sandbox org to be ready.

# flags.wait.description

If the command continues to run after the wait period, the CLI returns control of the terminal window to you and returns the job ID. To resume checking the sandbox creation, rerun this command.

# flags.use-most-recent.summary

Use the most recent sandbox create request.

# error.pollIntervalGreaterThanWait

The poll interval (%d seconds) can't be larger that wait (%d in seconds).

# error.NoSandboxNameOrJobId

No sandbox name or job ID were provided.

# error.LatestSandboxRequestNotFound

Retry the command using either the --name or --job-id flags.

#error.NoSandboxRequestFound

Couldn't find a sandbox creation request using the provided sandbox name or job ID.

# error.ResumeTimeout

The wait timeout (%d minutes) has expired. Check command results for more information.
