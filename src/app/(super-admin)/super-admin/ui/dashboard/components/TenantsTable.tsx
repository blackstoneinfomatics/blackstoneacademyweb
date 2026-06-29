import React from "react";

const TenantsTable = () => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold mb-4">New Tenants</h2>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th>Name</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Expiry</th>
          </tr>
        </thead>

        <tbody>
          {[1, 2, 3].map((item) => (
            <tr key={item} className="border-b">
              <td>Kongu National School</td>
              <td>Premium</td>
              <td>Active</td>
              <td>15 Dec 2026</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TenantsTable;