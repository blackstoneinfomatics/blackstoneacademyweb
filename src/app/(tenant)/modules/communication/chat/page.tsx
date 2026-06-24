import SectionPage from "@/app/_components/SectionPage";

export default function ChatPage() {
  return (
    <SectionPage
      title="Chat"
      description="Real-time or near real-time messaging area."
      routePath="/modules/communication/chat"
      highlights={["Direct messages", "Groups", "Notifications"]}
    />
  );
}