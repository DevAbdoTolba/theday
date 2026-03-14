import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { AnimatePresence, motion } from "framer-motion";
import SubjectCard from "./SubjectCard";
import SubjectForm from "./SubjectForm";
import SkeletonGrid from "./SkeletonGrid";
import type { ISubjectChangeRequest, ChangeType } from "../../utils/types";

interface ActiveSubject {
  name: string;
  abbreviation: string;
  shared: boolean;
  semesterIndex: number;
}

interface SubjectGridProps {
  subjects: ActiveSubject[];
  pendingChanges: ISubjectChangeRequest[];
  loading: boolean;
  classId: string;
  onCreateChange: (data: {
    changeType: ChangeType;
    subjectName: string;
    subjectAbbreviation: string;
    shared?: boolean;
    semesterIndex: number;
    originalSubjectName?: string;
  }) => Promise<void>;
  onUpdateChange: (
    id: string,
    data: {
      subjectName?: string;
      subjectAbbreviation?: string;
      shared?: boolean;
      semesterIndex?: number;
    }
  ) => Promise<void>;
  onCancelChange: (id: string) => Promise<void>;
  onDismissRejection: (id: string) => void;
  onSubjectClick: (subject: ActiveSubject) => void;
}

type FormState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; subject: ActiveSubject }
  | { type: "editPending"; change: ISubjectChangeRequest };

function collectSemesters(subjects: ActiveSubject[]): number[] {
  const set = new Set<number>();
  for (const s of subjects) set.add(s.semesterIndex);
  return Array.from(set).sort((a, b) => a - b);
}

export default function SubjectGrid({
  subjects,
  pendingChanges,
  loading,
  classId,
  onCreateChange,
  onUpdateChange,
  onCancelChange,
  onDismissRejection,
  onSubjectClick,
}: SubjectGridProps) {
  const [formState, setFormState] = useState<FormState>({ type: "closed" });
  const [search, setSearch] = useState("");
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  const semesters = useMemo(() => collectSemesters(subjects), [subjects]);

  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase().trim();
    return subjects.filter((s) => {
      if (activeSemester !== null && s.semesterIndex !== activeSemester)
        return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.abbreviation.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [subjects, search, activeSemester]);

  const pendingCreates = pendingChanges.filter(
    (c) => c.changeType === "create"
  );

  const getPendingForSubject = (subjectName: string) =>
    pendingChanges.find(
      (c) =>
        (c.changeType === "edit" || c.changeType === "delete") &&
        c.originalSubjectName === subjectName
    );

  const handleCreateSubmit = async (data: {
    subjectName: string;
    subjectAbbreviation: string;
    semesterIndex: number;
    shared: boolean;
  }) => {
    await onCreateChange({
      changeType: "create",
      subjectName: data.subjectName,
      subjectAbbreviation: data.subjectAbbreviation,
      shared: data.shared,
      semesterIndex: data.semesterIndex,
    });
    setFormState({ type: "closed" });
  };

  const handleEditSubmit = async (data: {
    subjectName: string;
    subjectAbbreviation: string;
    semesterIndex: number;
    shared: boolean;
  }) => {
    if (formState.type === "edit") {
      await onCreateChange({
        changeType: "edit",
        subjectName: data.subjectName,
        subjectAbbreviation: data.subjectAbbreviation,
        shared: data.shared,
        semesterIndex: data.semesterIndex,
        originalSubjectName: formState.subject.name,
      });
    }
    setFormState({ type: "closed" });
  };

  const handleEditPendingSubmit = async (data: {
    subjectName: string;
    subjectAbbreviation: string;
    semesterIndex: number;
    shared: boolean;
  }) => {
    if (formState.type === "editPending") {
      await onUpdateChange(formState.change._id, {
        subjectName: data.subjectName,
        subjectAbbreviation: data.subjectAbbreviation,
        shared: data.shared,
        semesterIndex: data.semesterIndex,
      });
    }
    setFormState({ type: "closed" });
  };

  const closeForm = () => setFormState({ type: "closed" });

  const dialogTitle =
    formState.type === "create"
      ? "Add New Subject"
      : formState.type === "edit"
        ? `Edit — ${formState.subject.name}`
        : formState.type === "editPending"
          ? `Edit Pending — ${formState.change.subjectName}`
          : "";

  const dialogOpen = formState.type !== "closed";

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  return (
    <Box>
      {/* Search + semester filter toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          placeholder="Search subjects..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search subjects"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    edge="end"
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{ minWidth: 240, flexShrink: 0 }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            label="All"
            size="small"
            variant={activeSemester === null ? "filled" : "outlined"}
            color={activeSemester === null ? "primary" : "default"}
            onClick={() => setActiveSemester(null)}
            aria-label="Show all semesters"
          />
          {semesters.map((sem) => (
            <Chip
              key={sem}
              label={`Sem ${sem}`}
              size="small"
              variant={activeSemester === sem ? "filled" : "outlined"}
              color={activeSemester === sem ? "primary" : "default"}
              onClick={() =>
                setActiveSemester(activeSemester === sem ? null : sem)
              }
              aria-label={`Filter semester ${sem}`}
            />
          ))}
        </Box>
      </Box>

      {/* Pending creates section */}
      {pendingCreates.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Pending New Subjects
          </Typography>
          <Box
            role="grid"
            aria-label="Pending new subjects"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2,
            }}
          >
            {pendingCreates.map((change, index) => (
              <motion.div
                key={change._id}
                role="gridcell"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <SubjectCard
                  name={change.subjectName}
                  abbreviation={change.subjectAbbreviation}
                  shared={change.shared}
                  semesterIndex={change.semesterIndex}
                  pendingChange={change}
                  disabled
                  onRequestEdit={() => {}}
                  onRequestDelete={() => {}}
                  onEditPending={() =>
                    setFormState({ type: "editPending", change })
                  }
                  onCancelPending={() => onCancelChange(change._id)}
                  onDismissRejection={
                    change.status === "rejected"
                      ? () => onDismissRejection(change._id)
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Subject grid */}
      <Box
        role="grid"
        aria-label="Subjects"
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 2,
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredSubjects.map((subject, index) => {
            const pending = getPendingForSubject(subject.name);
            return (
              <motion.div
                key={subject.name}
                role="gridcell"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, delay: index * 0.02 }}
              >
                <SubjectCard
                  name={subject.name}
                  abbreviation={subject.abbreviation}
                  shared={subject.shared}
                  semesterIndex={subject.semesterIndex}
                  pendingChange={pending}
                  onClick={() => onSubjectClick(subject)}
                  onRequestEdit={() =>
                    setFormState({ type: "edit", subject })
                  }
                  onRequestDelete={() =>
                    onCreateChange({
                      changeType: "delete",
                      subjectName: subject.name,
                      subjectAbbreviation: subject.abbreviation,
                      semesterIndex: subject.semesterIndex,
                      originalSubjectName: subject.name,
                    })
                  }
                  onEditPending={() =>
                    pending
                      ? setFormState({ type: "editPending", change: pending })
                      : undefined
                  }
                  onCancelPending={() =>
                    pending ? onCancelChange(pending._id) : undefined
                  }
                  onDismissRejection={
                    pending?.status === "rejected"
                      ? () => onDismissRejection(pending._id)
                      : undefined
                  }
                />
              </motion.div>
            );
          })}

          {/* Add Subject card — always visible at the end */}
          <motion.div
            key="add-subject"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Card
              onClick={() => setFormState({ type: "create" })}
              aria-label="Add new subject"
              sx={{
                cursor: "pointer",
                border: "2px dashed",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 140,
                transition: "border-color 0.2s, background-color 0.2s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AddOutlinedIcon color="action" sx={{ fontSize: 40 }} />
                <Typography color="text.secondary">Add Subject</Typography>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Empty state for filtered results */}
      {filteredSubjects.length === 0 && subjects.length > 0 && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">
            No subjects match &ldquo;{search || `Semester ${activeSemester}`}
            &rdquo;
          </Typography>
        </Box>
      )}

      {/* Subject form Dialog — always on top, never lost at the bottom */}
      <Dialog
        open={dialogOpen}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        aria-labelledby="subject-form-title"
      >
        <DialogTitle
          id="subject-form-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 0,
          }}
        >
          <Typography variant="h6" component="span" fontWeight="bold">
            {dialogTitle}
          </Typography>
          <IconButton
            size="small"
            onClick={closeForm}
            aria-label="Close form"
            edge="end"
          >
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {formState.type === "create" && (
            <SubjectForm
              mode="create"
              classId={classId}
              onSubmit={handleCreateSubmit}
              onCancel={closeForm}
            />
          )}
          {formState.type === "edit" && (
            <SubjectForm
              mode="edit"
              classId={classId}
              initialValues={{
                subjectName: formState.subject.name,
                subjectAbbreviation: formState.subject.abbreviation,
                semesterIndex: formState.subject.semesterIndex,
                shared: formState.subject.shared,
              }}
              onSubmit={handleEditSubmit}
              onCancel={closeForm}
            />
          )}
          {formState.type === "editPending" && (
            <SubjectForm
              mode="edit"
              classId={classId}
              initialValues={{
                subjectName: formState.change.subjectName,
                subjectAbbreviation: formState.change.subjectAbbreviation,
                semesterIndex: formState.change.semesterIndex,
                shared: formState.change.shared,
              }}
              onSubmit={handleEditPendingSubmit}
              onCancel={closeForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
