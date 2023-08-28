# Nextjs + Inngest

In many situations, you will not [read directly](../integration-patterns/managed-syncs#query-patterns) from the raw data that Supaglue lands into a database. Instead, you will want to transform and enrich that data into more convenient models for your application using a transformation pipeline. You'll likely need to implement queueing, retries, fault tolerance, and other best practices to ensure your transformation pipeline is scalable and reliable. Instead of building that infrastructure from scratch, you can leverage existing workflow engines like Inngest.

:::info
This is under construction.
:::
