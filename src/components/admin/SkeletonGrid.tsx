import { Box, Skeleton } from "@mui/material";

interface SkeletonGridProps {
  count?: number;
  cardHeight?: number;
}

export default function SkeletonGrid({
  count = 6,
  cardHeight = 180,
}: SkeletonGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          height={cardHeight}
          animation="wave"
        />
      ))}
    </Box>
  );
}
