import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface SubjectFormProps {
  mode: "create" | "edit";
  initialValues?: {
    subjectName: string;
    subjectAbbreviation: string;
    semesterIndex: number;
    shared?: boolean;
  };
  classId: string;
  onSubmit: (data: {
    subjectName: string;
    subjectAbbreviation: string;
    semesterIndex: number;
    shared: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

interface MatchingClass {
  className: string;
}

interface CheckNameResponse {
  existsInOtherClasses: boolean;
  matchingClasses: MatchingClass[];
}

export default function SubjectForm({
  mode,
  initialValues,
  classId,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const { getIdToken } = useAuth();

  const [subjectName, setSubjectName] = useState(initialValues?.subjectName ?? "");
  const [subjectAbbreviation, setSubjectAbbreviation] = useState(
    initialValues?.subjectAbbreviation ?? ""
  );
  const [semesterIndex, setSemesterIndex] = useState<number | null>(
    initialValues?.semesterIndex ?? null
  );
  const [shared, setShared] = useState(initialValues?.shared ?? false);

  const [submitting, setSubmitting] = useState(false);
  const [existsInOtherClasses, setExistsInOtherClasses] = useState(false);
  const [matchingClasses, setMatchingClasses] = useState<MatchingClass[]>([]);

  const [touched, setTouched] = useState({
    subjectName: false,
    subjectAbbreviation: false,
    semesterIndex: false,
  });

  // Debounced subject name uniqueness check
  useEffect(() => {
    if (!subjectName.trim()) {
      setExistsInOtherClasses(false);
      setMatchingClasses([]);
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const token = await getIdToken();
          const params = new URLSearchParams({ classId, name: subjectName.trim() });
          const res = await fetch(`/api/admin/subjects/check-name?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = (await res.json()) as CheckNameResponse;
            setExistsInOtherClasses(data.existsInOtherClasses);
            setMatchingClasses(data.matchingClasses);
            if (!data.existsInOtherClasses) {
              setShared(false);
            }
          }
        } catch {
          // Silently ignore check-name errors; form remains usable
        }
      })();
    }, 500);

    return () => clearTimeout(timer);
  }, [subjectName, classId, getIdToken]);

  const nameError = touched.subjectName && !subjectName.trim() ? "Subject name is required" : "";
  const abbreviationError =
    touched.subjectAbbreviation && !subjectAbbreviation.trim() ? "Abbreviation is required" : "";
  const semesterError =
    touched.semesterIndex && semesterIndex === null ? "Semester is required" : "";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setTouched({ subjectName: true, subjectAbbreviation: true, semesterIndex: true });

      if (!subjectName.trim() || !subjectAbbreviation.trim() || semesterIndex === null) {
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit({
          subjectName: subjectName.trim(),
          subjectAbbreviation: subjectAbbreviation.trim(),
          semesterIndex,
          shared,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [subjectName, subjectAbbreviation, semesterIndex, shared, onSubmit]
  );

  return (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => void handleSubmit(e)}
      sx={{ pt: 1 }}
    >
      <Stack spacing={2}>

        <TextField
          label="Subject Name"
          size="small"
          fullWidth
          required
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, subjectName: true }))}
          error={!!nameError}
          helperText={nameError}
        />

        {existsInOtherClasses && (
          <Stack spacing={1}>
            <Alert severity="info">
              This subject name exists in {matchingClasses.map((c) => c.className).join(", ")}.
              Enable sharing to see shared content.
            </Alert>
            <FormControlLabel
              control={
                <Switch
                  checked={shared}
                  onChange={(e) => setShared(e.target.checked)}
                  size="small"
                />
              }
              label="Create as shared"
            />
          </Stack>
        )}

        <TextField
          label="Abbreviation"
          size="small"
          fullWidth
          required
          value={subjectAbbreviation}
          onChange={(e) => setSubjectAbbreviation(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, subjectAbbreviation: true }))}
          inputProps={{ maxLength: 10 }}
          error={!!abbreviationError}
          helperText={abbreviationError}
        />

        <Stack spacing={0.5}>
          <Typography variant="body2" color={semesterError ? "error" : "text.secondary"}>
            Semester {semesterError ? `— ${semesterError}` : ""}
          </Typography>
          <ToggleButtonGroup
            value={semesterIndex}
            exclusive
            onChange={(_, value: number | null) => {
              if (value !== null) {
                setSemesterIndex(value);
                setTouched((t) => ({ ...t, semesterIndex: true }));
              }
            }}
            size="small"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <ToggleButton key={sem} value={sem}>
                {sem}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
