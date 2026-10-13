import React from "react";

const notifications = [
  {
    title: "Total Notifications",
    count: 128,
    description: "Received this month",
    color: "#3192ff",
    bg: "#e2f0ff",
    darkBg: "#1c3553",
    icon: "bell",
  },
  {
    title: "Seen",
    count: 28,
    description: "Notifications acknowledged",
    color: "#35bd65",
    bg: "#e2f5e8",
    darkBg: "#1c3d30",
    icon: "eye",
  },
  {
    title: "Unseen",
    count: 28,
    description: "Needs attention",
    color: "#ff9f13",
    bg: "#fff3e2",
    darkBg: "#46351f",
    icon: "eye",
  },
];

function NotificationIcon({ type }: { type: string }) {
  if (type === "bell") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[17px] w-[17px]"
        fill="currentColor"
      >
        <path d="M12 22a2.2 2.2 0 0 0 2.15-1.8h-4.3A2.2 2.2 0 0 0 12 22Zm7-5-1.8-2.2V10a5.2 5.2 0 0 0-4.2-5.1V4a1 1 0 0 0-2 0v.9A5.2 5.2 0 0 0 6.8 10v4.8L5 17v1h14v-1Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[19px] w-[19px]"
      fill="currentColor"
    >
      <path d="M12 5C6.5 5 2 12 2 12s4.5 7 10 7 10-7 10-7-4.5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <circle cx="12" cy="12" r="2.1" />
    </svg>
  );
}

export default function NotificationCards() {
  return (
    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {notifications.map((item) => (
        <div
          key={item.title}
          className="flex h-[88px] min-w-0 flex-col justify-between rounded-[13px] bg-white px-3 py-3 shadow-[0_6.36px_19.09px_0_rgba(153,153,153,0.15)] transition-colors dark:border-[#30394b] dark:bg-[#343434] dark:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ color: item.color }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full dark:hidden"
                style={{ backgroundColor: item.bg }}
              >
                <NotificationIcon type={item.icon} />
              </div>

              <div
                className="hidden h-full w-full items-center justify-center rounded-full dark:flex"
                style={{ backgroundColor: item.darkBg }}
              >
                <NotificationIcon type={item.icon} />
              </div>
            </div>

            <div className="min-w-0">
              <p
                className="text-[12px] font-medium"
                style={{ color: item.color }}
              >
                {item.title}
              </p>

              <p className="mt-0.5 text-[14px] font-bold leading-5 text-[#202020] dark:text-white">
                {item.count}
              </p>
            </div>
          </div>

          <p className="truncate text-right text-[10px] text-[#555555] dark:text-[#aeb9ce]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}