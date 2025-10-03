"use client";

import React from "react";

export default function HomePage() {
  return (
    <div className="h-full w-full">
      <h1 className="text-3xl font-bold mb-4">{{APP_NAME}}</h1>
      <p className="text-muted-foreground mb-6">
        {{DESCRIPTION}}
      </p>
    </div>
  );
}
