import StatsCard from "../../../../components/StatsCard";
import { LuIndianRupee } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";

const cards = [
  {
    title: "Monthly Revenue",
    value: "200",
    image: "/assets/images/TotalSub.svg",
    iconBg: "bg-[#EEE9FF] dark:bg-[#40386B]",
    titleColor: "text-[#5225FC]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Annual Revenue",
    value: "150",
    icon: FaCheckCircle,
    iconBg: "bg-[#E8F8EA] dark:bg-[#294D32]",
    titleColor: "text-[#40BD5F]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Pending Revenue",
    value: "50",
    icon: LuIndianRupee,
    iconBg: "bg-[#FFF3DF] dark:bg-[#5A4524]",
    titleColor: "text-[#F59E0B]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
  {
    title: "Overdue Revenue",
    value: "$2,500",
    image: "/assets/images/goalert.svg",
    iconBg: "bg-[#FDEAEA] dark:bg-[#5A3030]",
    titleColor: "text-[#D34645]",
    trendValue: "14%",
    trendLabel: "vs last Month",
    trendColor: "text-[#377E36]",
  },
];
const RevenueOverviewCards = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          percentage={Number.parseInt(card.trendValue, 10)}
          isPositive={card.title !== "Overdue Revenue"}
          image={card.image}
          icon={card.icon}
          iconBg={card.iconBg}
          titleColor={card.titleColor}
        />
      ))}
    </div>
  );
};

export default RevenueOverviewCards;
