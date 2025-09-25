import {prisma} from "../db.server";

export const loader = async () => {
  const badges = await prisma.trustBadge.findMany();
  return new Response(JSON.stringify(badges), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};