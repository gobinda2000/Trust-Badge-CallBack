import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Redirect to your desired URL after successful authentication
  return redirect("/app"); // or wherever you want to redirect
};