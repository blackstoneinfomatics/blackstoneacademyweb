import Card from "./Card";
import Table from "./Table";

export default function InvoicesTab() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Card />
      </div>
      <div>
        <Table />
      </div>
    </div>
  );
}
