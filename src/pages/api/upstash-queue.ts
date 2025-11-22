import { qstashClient, scheduleRebuild } from "@/lib/QStash";
import { verifyWebhookSignature } from "@hygraph/utils";
import {
  getRedisLastQueuedQStachJobId,
  setRedisQueueQStachJobId,
} from "@/lib/redis";
import type { APIRoute } from "astro";
import { HYGRAPH_SIGNATURE } from "astro:env/server";
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  // validate hygraph webhook key
  const secret = HYGRAPH_SIGNATURE;
  const body = await request.json();
  //const url = new URL(request.url).toString();
  const signature = request.headers.get("gcms-signature") || "";
  const isValid = verifyWebhookSignature({
    body,
    secret,
    signature,
  });
  if (!isValid) {
    return new Response(
      JSON.stringify({
        message: "Invalid signature",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // schedule qstach job
  const lastQueuedJobId = await getRedisLastQueuedQStachJobId();

  if (lastQueuedJobId) {
    try {
      await qstashClient.messages.delete(String(lastQueuedJobId));
      console.log("deleted last queued job id", lastQueuedJobId);
    } catch (e) {
      console.log("Job yet processed or not found");
    }
  }
  const scheduledJobId = await scheduleRebuild({
    body: {
      trigger: "hygraph-webhook",
      timespamp: Date.now(),
    },
  });
  await setRedisQueueQStachJobId(scheduledJobId);
  console.log("New qstach scheduled", scheduledJobId);

  return new Response(
    JSON.stringify({
      message: "Rebuild scheduled for 5 minutes",
      jobId: scheduledJobId,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
