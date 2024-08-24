'use client';

import { Divider } from 'antd';
import CreateBlink from './create-blink';
import FetchBlink from './fetch-blink';

export default function DashboardBlink() {
  return (
    <div className="mt-10 mx-10">
      <CreateBlink />
      <Divider className="bg-white my-10" />
      <div className="w-full">
        <span className="flex align-middle text-center">
          <span className="w-full font-semibold text-4xl text-[#6495ED]">
            Created Blinks
          </span>
        </span>
        <FetchBlink />
      </div>
    </div>
  );
}
