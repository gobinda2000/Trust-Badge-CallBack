import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.json();
  const { badges } = formData;

  await prisma.trustBadge.deleteMany({ where: { shop } });
  await prisma.trustBadge.createMany({
    data: badges.map((badge) => ({
      imageUrl: badge.image_url,
      shop,
    })),
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
