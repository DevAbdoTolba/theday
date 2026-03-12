import React from "react";
import AuthGuard from "./AuthGuard";

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard check={({ isAdmin }) => isAdmin}>{children}</AuthGuard>
);

export default AdminGuard;
