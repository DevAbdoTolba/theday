import React from "react";
import AuthGuard from "./AuthGuard";

const SuperAdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard check={({ isSuperAdmin }) => isSuperAdmin}>{children}</AuthGuard>
);

export default SuperAdminGuard;
