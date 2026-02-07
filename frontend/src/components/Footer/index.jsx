import React from "react";
import SettingsButton from "../SettingsButton";
import { isMobile } from "react-device-detect";
import { Tooltip } from "react-tooltip";

export default function Footer({ minimal = false }) {
  return (
    <div className="flex justify-center mb-2">
      <div className="flex space-x-4">
        {!minimal && !isMobile && <SettingsButton />}
      </div>
      <Tooltip
        id="footer-item"
        place="top"
        delayShow={300}
        className="tooltip !text-xs z-99"
      />
    </div>
  );
}
