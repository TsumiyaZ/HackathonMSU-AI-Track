"use client";

import dynamic from "next/dynamic";

const TravelBuddyWidget = dynamic(
  () => import("./TravelBuddyWidget").then((mod) => mod.TravelBuddyWidget),
  { ssr: false },
);

export function TravelBuddyMount() {
  return <TravelBuddyWidget />;
}
