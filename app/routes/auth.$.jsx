import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
    return redirect("/app");
  } catch (error) {
    // If authentication fails, let Shopify handle the OAuth flow
    throw error;
  }
};