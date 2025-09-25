import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import {
  Page,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Button,
  Layout,
} from "@shopify/polaris";

// Available badges
const badgeImages = [
  { id: "badge5", src: "/badges/image1.jpg", alt: "Badge 5" },
  { id: "badge6", src: "/badges/image01.png", alt: "Badge 6" },
];

// ✅ Loader: fetch saved badges for this shop
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const savedBadges = await prisma.trustBadge.findMany({
    where: { shop },
  });

  return { savedBadges };
}

// ✅ Action: save to Prisma DB
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.json();
  const { badges } = formData;

  const badgesWithShop = badges.map((badge) => ({
    badgeId: badge.id,
    imageUrl: badge.image_url,
    shop,
  }));

  // Overwrite old badges for this shop
  await prisma.trustBadge.deleteMany({
    where: { shop },
  });

  await prisma.trustBadge.createMany({
    data: badgesWithShop,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

// ✅ React component
export default function TrustBadge() {
  const { savedBadges } = useLoaderData();
  const [selectedBadges, setSelectedBadges] = useState(
    savedBadges.map((b) => b.badgeId) // pre-select saved
  );

  const saveSelectedBadges = async () => {
    const now = new Date().toISOString();
    const selectedBadgeObjects = selectedBadges
      .map((id) => {
        const badge = badgeImages.find((b) => b.id === id);
        return badge
          ? {
              id: badge.id,
              image_url: badge.src,
              created_at: now,
              updated_at: now,
            }
          : null;
      })
      .filter(Boolean);

    await fetch("/app/trustBadge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ badges: selectedBadgeObjects }),
    });

    console.log("Badges saved to DB");
  };

  return (
    <Page title="New trust badges">
      <Layout>
        {/* Selection section */}
        <Layout.Section>
          <Card title="Select Badges">
            <Text variant="headingMd">Select Badges</Text>
            <BlockStack gap="400">
              {badgeImages.map((badge) => (
                <label
                  key={badge.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="badge"
                    value={badge.id}
                    checked={selectedBadges[0] === badge.id}
                    onChange={() => setSelectedBadges([badge.id])}
                    style={{ marginRight: "16px" }}
                  />
                  <img
                    src={badge.src}
                    alt={badge.alt}
                    style={{
                      width: "80%",
                      height: "80%",
                      objectFit: "contain",
                      marginRight: "2px",
                    }}
                  />
                </label>
              ))}
              <InlineStack>
                <Button variant="primary" onClick={saveSelectedBadges}>
                  Save Badges
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Preview section */}
        <Layout.Section variant="oneThird">
          <Card title="Preview">
            <Text variant="headingMd">Preview</Text>
            <BlockStack gap="200">
              {selectedBadges.length === 0 ? (
                <Text>No badges selected</Text>
              ) : (
                selectedBadges.map((id) => {
                  const badge = badgeImages.find((b) => b.id === id);
                  return (
                    <img
                      key={id}
                      src={badge?.src}
                      alt={badge?.alt}
                      style={{
                        width: "100%",
                        height: 80,
                        objectFit: "contain",
                        background: "none",
                        border: "none",
                        boxShadow: "none",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    />
                  );
                })
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
