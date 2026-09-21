import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import WhatsApp from "@mui/icons-material/WhatsApp";

interface SupportContact {
  readonly phone: string;
  readonly whatsappUrl: string;
}

export default function CVSupportContact() {
  const [contact, setContact] = useState<SupportContact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revealContact = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cv-support", { method: "POST" });
      if (!response.ok) throw new Error("Could not load the support number.");
      setContact((await response.json()) as SupportContact);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load the support number.");
    } finally {
      setIsLoading(false);
    }
  };

  if (contact) {
    return (
      <Box sx={{ mt: 2.25, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 1.25 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.78)", fontWeight: 800 }}>{contact.phone}</Typography>
        <Button component="a" href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" startIcon={<WhatsApp />} variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.75)", textTransform: "none", fontWeight: 900, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}>Chat on WhatsApp</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2.25, textAlign: "center" }}>
      <Button onClick={() => void revealContact()} disabled={isLoading} startIcon={<HelpOutlineRounded />} variant="text" sx={{ color: "rgba(255,255,255,0.8)", textTransform: "none", fontWeight: 850 }}>{isLoading ? "Loading support…" : "Need help?"}</Button>
      {error && <Typography role="alert" sx={{ mt: 0.5, color: "#ff8a80", fontSize: "0.85rem" }}>{error}</Typography>}
    </Box>
  );
}
