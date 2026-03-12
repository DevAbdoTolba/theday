import React, { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminGuard from "../../components/admin/AdminGuard";
import ContentUploader from "../../components/admin/ContentUploader";
import LinkForm from "../../components/admin/LinkForm";
import EasterEggForm from "../../components/admin/EasterEggForm";
import ContentList from "../../components/admin/ContentList";
import { useAuth } from "../../hooks/useAuth";

interface Subject {
  name: string;
  abbreviation: string;
}

interface DataEntry {
  index: number;
  subjects: Subject[];
}

interface ClassItem {
  _id: string;
  class: string;
  data: DataEntry[];
}

interface DriveFolder {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}

function AdminContent() {
  const { getIdToken } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load classes on mount
  useEffect(() => {
    const load = async () => {
      const token = await getIdToken();
      const res = await fetch("/api/admin/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { classes: ClassItem[] };
        setClasses(data.classes);
        setClassesError(null);
      } else {
        setClassesError("Failed to load classes");
      }
      setClassesLoading(false);
    };
    void load();
  }, [getIdToken]);

  // Load Drive folders when subject changes
  const loadFolders = useCallback(
    async (subject: Subject) => {
      setFoldersLoading(true);
      setFolders([]);
      setSelectedFolder(null);
      const token = await getIdToken();
      const res = await fetch(
        `/api/admin/drive-folders?subject=${encodeURIComponent(subject.abbreviation)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = (await res.json()) as { folders: DriveFolder[] };
        setFolders(data.folders);
      }
      setFoldersLoading(false);
    },
    [getIdToken]
  );

  const handleClassChange = (classId: string) => {
    const cls = classes.find((c) => c._id === classId) ?? null;
    setSelectedClass(cls);
    setSelectedSubject(null);
    setFolders([]);
    setSelectedFolder(null);
  };

  const handleSubjectChange = (subjectName: string) => {
    if (!selectedClass) return;
    let found: Subject | null = null;
    for (const entry of selectedClass.data) {
      const s = entry.subjects.find((sub) => sub.name === subjectName);
      if (s) {
        found = s;
        break;
      }
    }
    setSelectedSubject(found);
    setSelectedFolder(null);
    if (found) void loadFolders(found);
  };

  const handleFolderChange = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId) ?? null;
    setSelectedFolder(folder);
    setRefreshTrigger((n) => n + 1);
  };

  // All subjects from selected class
  const allSubjects: Subject[] = selectedClass
    ? selectedClass.data.flatMap((entry) => entry.subjects)
    : [];

  if (classesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {classesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {classesError}
        </Alert>
      )}

      {/* Class selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Class</InputLabel>
        <Select
          value={selectedClass?._id ?? ""}
          label="Select Class"
          onChange={(e) => handleClassChange(e.target.value as string)}
        >
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.class}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subject selector */}
      {selectedClass && allSubjects.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Subject</InputLabel>
          <Select
            value={selectedSubject?.name ?? ""}
            label="Select Subject"
            onChange={(e) => handleSubjectChange(e.target.value as string)}
          >
            {allSubjects.map((sub) => (
              <MenuItem key={sub.name} value={sub.name}>
                {sub.name} ({sub.abbreviation})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Category / folder selector */}
      {selectedSubject && (
        <>
          {foldersLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Category</InputLabel>
              <Select
                value={selectedFolder?.id ?? ""}
                label="Select Category"
                onChange={(e) => handleFolderChange(e.target.value as string)}
              >
                {folders.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </>
      )}

      {/* Content area */}
      {selectedFolder && selectedClass && selectedSubject && (
        <Box>
          <ContentList
            classId={selectedClass._id}
            category={selectedFolder.name}
            subject={selectedSubject.abbreviation}
            refreshTrigger={refreshTrigger}
            onUploadFirst={undefined}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Add Content
          </Typography>

          {/* Upload file */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Upload File</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ContentUploader
                folderId={selectedFolder.id}
                category={selectedFolder.name}
                subject={selectedSubject.abbreviation}
                onUploadComplete={() => setRefreshTrigger((n) => n + 1)}
              />
            </AccordionDetails>
          </Accordion>

          {/* Add link */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Add Link</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <LinkForm
                classId={selectedClass._id}
                category={selectedFolder.name}
                onSuccess={() => setRefreshTrigger((n) => n + 1)}
              />
            </AccordionDetails>
          </Accordion>

          {/* Add easter egg */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Add Easter Egg</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EasterEggForm
                classId={selectedClass._id}
                category={selectedFolder.name}
                onSuccess={() => setRefreshTrigger((n) => n + 1)}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
}
