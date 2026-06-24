// components/admin/LeaveForm.tsx
import React from "react";

type Props = {
  onClose: () => void;
};

const LeaveForm = ({ onClose }: Props) => {
  return (
    <div>
      <h2>Leave Request Form</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default LeaveForm;
