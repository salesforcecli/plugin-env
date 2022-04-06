# summary

Resume a scratch org.

# description

If you already started a scratch org, but it did not complete, you can resume where you left off.

# examples

- Resume a scratch org with a job id ()

  <%= config.bin %> <%= command.id %> --job-id 2SR3u0000008fBDGAY

- Resume your most recent incomplete scratch org

  <%= config.bin %> <%= command.id %> --use-most-recent

# flags.job-id.summary

ID of the ScratchOrgInfo record from your previous job

# flags.use-most-recent.summary

Use the most recent ScratchOrgInfo record

# error.NoRecentJobId

There are no recent ScratchOrgInfo requests in your cache. Maybe it completed or already resumed?

# success

Your scratch org is ready.
