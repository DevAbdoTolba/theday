import React, { useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { motion } from "framer-motion";
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

// Group subjects by semesterIndex
function groupBySemester(subjects: ActiveSubject[]) {
  const groups = new Map<number, ActiveSubject[]>();
  for (const s of subjects) {
    const existing = groups.get(s.semesterIndex) ?? [];
    existing.push(s);
    groups.set(s.semesterIndex, existing);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a - b);
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

  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  const pendingCreates = pendingChanges.filter(
    (c) => c.changeType === "create"
  );

  const getPendingForSubject = (subjectName: string) =>
    pendingChanges.find(
      (c) =>
        (c.changeType === "edit" || c.changeType === "delete") &&
        c.originalSubjectName === subjectName
    );

  const groupedSubjects = groupBySemester(subjects);

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

  return (
    <Box>
      {/* Pending creates section */}
      {pendingCreates.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Pending New Subjects
          </Typography>
          <Box
            role="grid"
            aria-label="Pending new subjects"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
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

      {/* Grouped active subjects by semester */}
      {groupedSubjects.map(([semester, semSubjects]) => (
        <Box key={semester} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Semester {semester}
          </Typography>
          <Box
            role="grid"
            aria-label={`Semester ${semester} subjects`}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 2,
            }}
          >
            {semSubjects.map((subject, index) => {
              const pending = getPendingForSubject(subject.name);
              return (
                <motion.div
                  key={subject.name}
                  role="gridcell"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
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
          </Box>
        </Box>
      ))}

      {/* Add Subject card */}
      {formState.type === "closed" && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          <Card
            onClick={() => setFormState({ type: "create" })}
            sx={{
              cursor: "pointer",
              border: "2px dashed",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
              "&:hover": { borderColor: "primary.main" },
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
        </Box>
      )}

      {/* Inline forms */}
      {formState.type === "create" && (
        <Box sx={{ mt: 2 }}>
          <SubjectForm
            mode="create"
            classId={classId}
            onSubmit={handleCreateSubmit}
            onCancel={() => setFormState({ type: "closed" })}
          />
        </Box>
      )}

      {formState.type === "edit" && (
        <Box sx={{ mt: 2 }}>
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
            onCancel={() => setFormState({ type: "closed" })}
          />
        </Box>
      )}

      {formState.type === "editPending" && (
        <Box sx={{ mt: 2 }}>
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
            onCancel={() => setFormState({ type: "closed" })}
          />
        </Box>
      )}
    </Box>
  );
}
