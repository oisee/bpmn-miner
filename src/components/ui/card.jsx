import React from 'react';

export const Card = ({ children }) => (
  <div className="border rounded shadow p-4 bg-white">
    {children}
  </div>
);

export const CardHeader = ({ children }) => (
  <div className="mb-4">
    <h2 className="text-xl font-bold">{children}</h2>
  </div>
);

export const CardContent = ({ children }) => (
  <div>{children}</div>
);

export const CardTitle = ({ children }) => (
  <div className="text-lg font-semibold">{children}</div>
);
