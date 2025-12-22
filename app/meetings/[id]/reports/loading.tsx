"use client";

import { DNA } from "react-loader-spinner";

export default function Loading() {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-transparent">
      <div className="flex items-center justify-center h-full">
        <DNA
          height={100}
          width={100}
          dnaColorOne="#27a9d9"
          dnaColorTwo="#c125e3"
          ariaLabel="ball-triangle-loading"
        />
      </div>
    </div>
  );
}
