import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { motion } from "framer-motion";
import ClassCard from "./ClassCard";
import SkeletonGrid from "./SkeletonGrid";

interface ClassData {
  _id: string;
  class: string;
  data: Array<{
    index: number;
    subjects: Array<{ name: string; abbreviation: string }>;
  }>;
}

interface AdminInfo {
  firebaseUid: string;
  displayName: string;
  email: string;
  assignedClassId?: string | null;
}

interface ClassGridProps {
  classes: ClassData[];
  admins: AdminInfo[];
  loading: boolean;
  onAddClass: () => void;
  onEditClass: (classData: ClassData) => void;
  onDeleteClass: (classData: ClassData) => void;
  onAssignAdmin: (classData: ClassData) => void;
}

export default function ClassGrid({
  classes,
  admins,
  loading,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAssignAdmin,
}: ClassGridProps) {
  if (loading) {
    return <SkeletonGrid count={6} />;
  }

  return (
    <Box
      role="grid"
      aria-label="Classes"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 2,
      }}
    >
      {classes.map((cls, index) => {
        const assignedAdmin = admins.find(
          (a) => a.assignedClassId === cls._id
        );
        const subjectCount = cls.data.reduce(
          (sum, d) => sum + d.subjects.length,
          0
        );

        return (
          <motion.div
            key={cls._id}
            role="gridcell"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <ClassCard
              classId={cls._id}
              className={cls.class}
              subjectCount={subjectCount}
              adminName={assignedAdmin?.displayName}
              adminEmail={assignedAdmin?.email}
              onEdit={() => onEditClass(cls)}
              onDelete={() => onDeleteClass(cls)}
              onAssignAdmin={() => onAssignAdmin(cls)}
            />
          </motion.div>
        );
      })}

      <Card
        onClick={onAddClass}
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
          <Typography color="text.secondary">Add Class</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
