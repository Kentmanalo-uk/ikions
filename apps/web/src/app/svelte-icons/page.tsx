import { TopicPage, topicMetadata } from "@/components/landing/topic-page";

export const metadata = topicMetadata("svelte-icons");

export default function Page() {
  return <TopicPage slug="svelte-icons" />;
}
