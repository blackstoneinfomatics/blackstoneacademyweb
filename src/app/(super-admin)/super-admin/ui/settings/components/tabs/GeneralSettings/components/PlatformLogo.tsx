import React, { useRef, useState } from "react";
import SettingsCard from "./SettingsCard";

const PlatformLogo = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  return (
    <SettingsCard
      title="Platform Logo"
      description="Make basic information and default platform settings"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-[98px] w-[98px] items-center justify-center overflow-hidden rounded-xl bg-black">
          {logo ? (
            <img
              src={logo}
              alt="Platform Logo"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="text-center">
              <p className="text-[12px] font-extrabold text-white">
                BLACKST<span className="text-yellow-400">O</span>NE
              </p>
              <div className="bg-white text-[8px] font-bold text-black">
                NEXUS
              </div>
            </div>
          )}
        </div>

        <p className="mt-2 text-[9px] text-[#263755] dark:text-gray-300">
          Maximum File Size: 5MB
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />

        <div className="mt-2 flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-[#687ED5] bg-[#F5F6FC] px-3 py-1.5 text-[11px] font-semibold text-[#536AC4] hover:bg-[#E9ECFA]"
          >
            Change Logo
          </button>

          <button
            onClick={() => setLogo(null)}
            className="rounded-md border border-red-400 bg-red-50 px-5 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-100"
          >
            Remove
          </button>
        </div>
      </div>
    </SettingsCard>
  );
};

export default PlatformLogo;