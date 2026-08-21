import StatsCard from "../../../../components/StatsCard";
import { FaClipboardCheck } from "react-icons/fa6";
import { LuIndianRupee } from "react-icons/lu";



const cards = [
  {
    title: "Total Revenue",
    value: "200",
    image: "/assets/images/TotalSub.svg",
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Collected",
    value: "150",
    icon: FaClipboardCheck,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Pending",
    value: "50",
    icon: LuIndianRupee,
    iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
    titleColor: "text-[#F59E0B]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Refunded",
    value: "$2,500",
    image: "/assets/images/goalert.svg",
    iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
    titleColor: "text-[#D34645]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
];
const AnalyticsOverviewCard = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          percentage={Number.parseInt(card.trendValue, 10)}
          isPositive={card.title !== "Refunded"}
          icon={card.icon}
          image={card.image}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
};

export default AnalyticsOverviewCard;
