import { Box, Card, CardActions, CardContent, Skeleton, Stack } from "@mui/material";

interface SkeletonGridProps {
  count?: number;
  variant?: "class" | "subject" | "approval";
}

function ClassCardSkeleton() {
  return (
    <Card elevation={1}>
      <CardContent>
        {/* Class name */}
        <Skeleton variant="text" width="55%" height={28} sx={{ mb: 0.5 }} />
        {/* Subject count */}
        <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
        {/* Admin row: icon + name/email */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1, py: 0.5 }}>
          <Skeleton variant="circular" width={20} height={20} sx={{ flexShrink: 0 }} />
          <Box flex={1}>
            <Skeleton variant="text" width="50%" height={18} />
            <Skeleton variant="text" width="65%" height={16} />
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="circular" width={28} height={28} />
      </CardActions>
    </Card>
  );
}

function SubjectCardSkeleton() {
  return (
    <Card elevation={2}>
      <CardContent>
        {/* Abbreviation box + name row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ flexShrink: 0 }} />
          <Skeleton variant="text" width="60%" height={28} />
        </Box>
        {/* Semester text */}
        <Skeleton variant="text" width="35%" height={18} />
        {/* Chip */}
        <Box sx={{ mt: 1 }}>
          <Skeleton variant="rounded" width={56} height={22} />
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <Skeleton variant="circular" width={28} height={28} />
        <Skeleton variant="circular" width={28} height={28} />
      </CardActions>
    </Card>
  );
}

function ApprovalCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent>
        {/* Chip + timestamp row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Skeleton variant="rounded" width={88} height={22} />
          <Skeleton variant="text" width={60} height={16} />
        </Box>
        {/* Subject name */}
        <Skeleton variant="text" width="65%" height={28} sx={{ mb: 1 }} />
        {/* Class · Semester */}
        <Skeleton variant="text" width="55%" height={18} sx={{ mb: 0.5 }} />
        {/* Requested by */}
        <Skeleton variant="text" width="75%" height={18} />
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
        <Skeleton variant="rounded" width={64} height={30} />
        <Skeleton variant="rounded" width={76} height={30} />
      </CardActions>
    </Card>
  );
}

export default function SkeletonGrid({
  count = 6,
  variant = "class",
}: SkeletonGridProps) {
  const items = Array.from({ length: count });

  if (variant === "approval") {
    return (
      <Stack spacing={2}>
        {items.map((_, i) => (
          <ApprovalCardSkeleton key={i} />
        ))}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 2,
      }}
    >
      {items.map((_, i) =>
        variant === "subject" ? (
          <SubjectCardSkeleton key={i} />
        ) : (
          <ClassCardSkeleton key={i} />
        )
      )}
    </Box>
  );
}
