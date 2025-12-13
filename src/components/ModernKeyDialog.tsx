import React, { useState, useContext } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button, TextField, CircularProgress, 
  Alert, Box, Typography, useTheme, IconButton
} from '@mui/material';
import { VpnKey, Check, Close, Translate } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { DataContext } from '../context/TranscriptContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const translations = {
  en: {
    title: "Access Key",
    desc: "Enter the secret key provided by your class admin to unlock your semester materials.",
    label: "Transcript Key",
    submit: "Unlock",
    confirmTitle: "Confirm Class",
    confirmDesc: (cls: string) => `Is "${cls}" your correct class?`,
    existsTitle: "Already Saved",
    existsDesc: "This class is already on your device. Switch to it?",
    switch: "Switch",
    save: "Save & Continue"
  },
  ar: {
    title: "مفتاح الدفعة",
    desc: "أدخل المفتاح السري الخاص بدفعتك للوصول إلى المواد الدراسية.",
    label: "مفتاح المنهج",
    submit: "تفعيل",
    confirmTitle: "تأكيد الدفعة",
    confirmDesc: (cls: string) => `هل "${cls}" هي دفعتك؟`,
    existsTitle: "موجود بالفعل",
    existsDesc: "هذه الدفعة مسجلة بالفعل. هل تريد الانتقال إليها؟",
    switch: "انتقال",
    save: "حفظ ومتابعة"
  }
};

export default function ModernKeyDialog({ open, onClose }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const { setClassName } = useContext(DataContext);
  
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  
  // Logic States
  const [foundClass, setFoundClass] = useState<{ id: string, name: string } | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  const t = translations[lang];

  const handleReset = () => {
    setKey("");
    setError("");
    setFoundClass(null);
    setIsExisting(false);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return setError("Key is required");
    
    // Basic Regex Validation
    if (!key.match(/^[0-9a-fA-F]{24}$/)) {
      return setError(lang === 'en' ? "Invalid key format" : "صيغة المفتاح غير صحيحة");
    }

    setLoading(true);
    setError("");

    try {
      // 1. Check Local Storage First
      const storedClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const existing = storedClasses.find((c: any) => c.id === key);

      if (existing) {
        setFoundClass({ id: existing.id, name: existing.class });
        setIsExisting(true);
        setLoading(false);
        return;
      }

      // 2. Fetch from API if not local
      const res = await fetch(`/api/getTranscriptName?className=${key}`);
      const data = await res.json();

      if (!res.ok || !data.transcriptName) {
        throw new Error("Invalid Key or Class not found");
      }

      setFoundClass({ id: data.transcriptName._id, name: data.transcriptName.class });
      setIsExisting(false);

    } catch (err: any) {
      setError(err.message || "Failed to validate key");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!foundClass) return;

    if (!isExisting) {
      // Save new class to local storage
      const storedClasses = JSON.parse(localStorage.getItem("classes") || "[]");
      const newEntry = { class: foundClass.name, id: foundClass.id };
      localStorage.setItem("classes", JSON.stringify([...storedClasses, newEntry]));
    }

    // Set as active and navigate
    localStorage.setItem("className", foundClass.name);
    setClassName(foundClass.name); // Update Context
    router.push(`/theday/q/${foundClass.id}`);
    handleReset();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleReset}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKey color="primary" />
          <Typography fontWeight={700}>
            {foundClass 
              ? (isExisting ? t.existsTitle : t.confirmTitle)
              : t.title}
          </Typography>
        </Box>
        <IconButton onClick={() => setLang(prev => prev === 'en' ? 'ar' : 'en')} size="small">
          <Translate fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Step 1: Input Form */}
        {!foundClass && (
          <Box component="form" onSubmit={handleSubmit}>
            <DialogContentText sx={{ mb: 2, textAlign: lang === 'ar' ? 'right' : 'left' }}>
              {t.desc}
            </DialogContentText>
            
            <TextField
              autoFocus
              fullWidth
              label={t.label}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={loading}
              error={!!error}
              helperText={error}
              variant="outlined"
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            
            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={handleReset} color="inherit">Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !key}
                startIcon={loading ? <CircularProgress size={20} /> : <Check />}
              >
                {t.submit}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Confirmation */}
        {foundClass && (
          <Box textAlign="center" py={2}>
            <Typography variant="h6" color="primary" fontWeight={800} gutterBottom>
              {foundClass.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {isExisting ? t.existsDesc : t.confirmDesc(foundClass.name)}
            </Typography>

            <Box display="flex" flexDirection="column" gap={1.5} mt={3}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleConfirm}
                fullWidth
                sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
              >
                {isExisting ? t.switch : t.save}
              </Button>
              <Button 
                color="error" 
                onClick={() => setFoundClass(null)}
                startIcon={<Close />}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}