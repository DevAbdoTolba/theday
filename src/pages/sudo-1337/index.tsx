import React, { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import SuperAdminGuard from "../../components/admin/SuperAdminGuard";
import UserManagement from "../../components/admin/UserManagement";
import ClassManagement from "../../components/admin/ClassManagement";

export default function SudoPage() {
  const [tab, setTab] = useState(0);

  return (
    <SuperAdminGuard>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Typography variant="h4" gutterBottom>
          sudo-1337
        </Typography>
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Users" />
          <Tab label="Classes" />
        </Tabs>
        {tab === 0 && <UserManagement />}
        {tab === 1 && <ClassManagement />}
      </Box>
    </SuperAdminGuard>
  );
}
