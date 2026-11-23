import { TeacherClass, TeacherProfile } from "./teacherDetailsTypes";

export const cardClass =
  "rounded-lg border border-[#e7eaf2] bg-white p-4 dark:border-[#454a57] dark:bg-[#30343f]";
export const titleClass = "text-[15px] font-semibold text-[#111b38] dark:text-white";

export const mockStudentFeedback = [
  {
    student: "Aditi R",
    course: "UX-12",
    posted: "2h ago",
    comment: "Very clear explanations and practical examples. Loved the design systems session.",
  },
  {
    student: "Rahul M",
    course: "UX-08",
    posted: "Yesterday",
    comment: "The class was engaging and the project feedback was very helpful.",
  },
  {
    student: "Meera S",
    course: "UX-15",
    posted: "2 days ago",
    comment: "Excellent examples and a clear walkthrough of usability testing.",
  },
];

export const mockSalaryPayments = [
  { month: "Sep 2026", paidOn: "05 Sep 2026", netPaid: 24500, status: "Paid" },
  { month: "Aug 2026", paidOn: "05 Aug 2026", netPaid: 24500, status: "Paid" },
  { month: "Jul 2026", paidOn: "05 Jul 2026", netPaid: 24500, status: "Paid" },
];

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatClassTime(value?: string): string {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InfoRows({ rows }: { rows: [string, unknown][] }) {
  return (
    <dl className="divide-y divide-[#edf0f5] dark:divide-[#454a57]">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-start justify-between gap-4 py-2.5 text-[13px]"
        >
          <dt className="text-[#273653] dark:text-[#d6d9e2]">{label}</dt>
          <dd className="max-w-[62%] break-words text-right text-[#67738d] dark:text-[#c2c7d2]">
            {displayValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ClassList({
  classes,
  loading,
  emptyMessage,
}: {
  classes: TeacherClass[];
  loading: boolean;
  emptyMessage: string;
}) {
  if (loading) {
    return <p className="py-5 text-sm text-[#74809a]">Loading classes…</p>;
  }
  if (classes.length === 0) {
    return <p className="py-5 text-sm text-[#74809a]">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-[#edf0f5] dark:divide-[#454a57]">
      {classes.map((item, index) => {
        const name = item.course?.courseName || "Scheduled class";
        const status = item.scheduleStatus || item.sessionClassType || "Scheduled";
        const dateLine = [
          formatDate(item.startDate),
          formatClassTime(item.startTime?.[0]),
          item.classDay?.join(", "),
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <div
            key={item._id || item.classId || `${name}-${index}`}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#14203c] dark:text-white">
                {name}
              </p>
              <p className="mt-1 text-[12px] text-[#7d89a2]">{dateLine}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#e8f7ed] px-3 py-1 text-[11px] font-medium capitalize text-[#258342] dark:bg-[#244532] dark:text-[#9ce2b0]">
              {status.toLowerCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SalaryTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] text-left text-[12px]">
        <thead className="bg-[#4e6d98] text-white">
          <tr>
            {["Salary Month", "Paid On", "Net Paid", "Status"].map((heading) => (
              <th key={heading} className="px-3 py-3 font-medium">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockSalaryPayments.map((payment) => (
            <tr
              key={payment.month}
              className="border-b border-[#edf0f5] text-[#24324e] last:border-0 dark:border-[#454a57] dark:text-[#d6d9e2]"
            >
              <td className="px-3 py-3">{payment.month}</td>
              <td className="px-3 py-3">{payment.paidOn}</td>
              <td className="px-3 py-3">₹{payment.netPaid.toLocaleString()}</td>
              <td className="px-3 py-3">
                <span className="rounded-md bg-[#e8f9ef] px-4 py-1.5 text-[11px] font-medium text-[#258342] dark:bg-[#244532] dark:text-[#9ce2b0]">
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function getTeacherFullName(teacher: TeacherProfile): string {
  return `${teacher.candidateFirstName || ""} ${
    teacher.candidateLastName || ""
  }`.trim();
}
