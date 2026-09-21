import React from "react";
import { isCvPaymentAdminEmail } from "../../lib/constants";
import AuthGuard from "./AuthGuard";

const CvPaymentsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard check={({ email }) => isCvPaymentAdminEmail(email)}>
    {children}
  </AuthGuard>
);

export default CvPaymentsGuard;
