import Image from "next/image";

const ticketStats = [
  {
    title: "Total Tickets",
    count: 28,
    change: "↑ 14%",
    subtitle: "vs last Month",
    titleColor: "#5B4CFF",
    iconBg: "#EEE9FF",
    icon: "/assets/images/k (1).png",
  },
  {
    title: "Open Tickets",
    count: 28,
    change: "↑ 14%",
    subtitle: "vs last Month",
    titleColor: "#34C759",
    iconBg: "#EAF8EE",
    icon: "/assets/images/k (4).png",
  },
  {
    title: "InProgress",
    count: 28,
    change: "↑ 14%",
    subtitle: "vs last Month",
    titleColor: "#F5A623",
    iconBg: "#FFF5E8",
    icon: "/assets/images/k (2).png",
  },
  {
    title: "Resolved",
    count: 28,
    change: "↑ 14%",
    subtitle: "vs last Month",
    titleColor: "#5B6CFF",
    iconBg: "#EEF1FF",
    icon: "/assets/images/k (3).png",
  },
];

export default function TicketAnalyticsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

      {ticketStats.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-[#343434]  rounded-xl px-4 py-4 h-[120px]"
        >
          <div className="flex items-start gap-3">

            {/* Image */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              
            >
              {/* Replace with your image */}

              <Image
                src={item.icon}
                alt={item.title}
                width={45}
                height={45}
              />

              {/* OR

              <Image
                src="/images/your-image.png"
                alt=""
                width={22}
                height={22}
              />

              */}
            </div>

            <div>

              <p
                className="text-[15px] font-semibold"
                style={{ color: item.titleColor }}
              >
                {item.title}
              </p>

              <h3 className="text-lg font-semibold leading-none mt-2 text-[#1F2937] dark:text-white">
                {item.count}
              </h3>

            </div>

          </div>

          <div className="flex items-center gap-3 mt-4 ml-[48px]">

            <span className="text-[#22A447] text-[13px] font-semibold">
              {item.change}
            </span>

            <span className="text-[#7A7A7A] dark:text-gray-300 text-[13px]">
              {item.subtitle}
            </span>

          </div>
        </div>
      ))}

    </div>
  );
}