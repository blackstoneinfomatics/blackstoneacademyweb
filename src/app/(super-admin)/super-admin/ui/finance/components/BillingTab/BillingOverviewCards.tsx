"use client";

import BillingCard from "@/app/(super-admin)/super-admin/components/BillingCard";

const billingStats = [
  {
    title: "Total Invoices",
    value: 28,
    percentage: 14,
    isPositive: true,
    image: "/assets/images/Vector (1).svg",
    iconBg: "bg-[#5225FC24]",
    titleColor: "text-[#5225FC]",
  },
  {
    title: "Paid Invoices",
    value: 28,
    percentage: 14,
    isPositive: true,
    image: "/assets/images/Vector (2).svg",
    iconBg: "bg-[#40BD5F24]",
    titleColor: "text-[#40BD5F]",
  },
  {
    title: "Pending Invoices",
    value: 28,
    percentage: 14,
    isPositive: false,
    image: "/assets/images/Vector (3).svg",
    iconBg: "bg-[#FCAA2524]",
    titleColor: "text-[#FCAA25]",
  },
];

function BillingOverviewCards() {
  return (
    <section className="w-full">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 xl:grid-cols-3">
          {billingStats.map((card) => (
            <BillingCard
              key={card.title}
              title={card.title}
              value={card.value}
              percentage={card.percentage}
              isPositive={card.isPositive}
              image={card.image}
              iconBg={card.iconBg}
              titleColor={card.titleColor}
            />
          ))}
        </div>
      </section>
  );
}

export default BillingOverviewCards;