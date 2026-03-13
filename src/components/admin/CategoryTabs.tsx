import React, { useRef, useState } from "react";
import {
  Box,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  name: string;
  folderId: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onChange: (folderId: string) => void;
  onAdd: (name: string) => Promise<void>;
  onRename: (folderId: string, newName: string) => Promise<void>;
  onDelete: (folderId: string) => Promise<void>;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onChange,
  onAdd,
  onRename,
  onDelete,
}: CategoryTabsProps) {
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const addInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleAddConfirm = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddingCategory(false);
      setNewCategoryName("");
      return;
    }
    await onAdd(trimmed);
    setNewCategoryName("");
    setAddingCategory(false);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleAddConfirm();
    } else if (e.key === "Escape") {
      setAddingCategory(false);
      setNewCategoryName("");
    }
  };

  const startRename = (folderId: string, currentName: string) => {
    setEditingTab(folderId);
    setEditName(currentName);
  };

  const handleRenameConfirm = async () => {
    if (editingTab === null) return;
    const trimmed = editName.trim();
    if (trimmed) {
      await onRename(editingTab, trimmed);
    }
    setEditingTab(null);
    setEditName("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleRenameConfirm();
    } else if (e.key === "Escape") {
      setEditingTab(null);
      setEditName("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === folderId) {
      setConfirmDeleteId(null);
      void onDelete(folderId);
    } else {
      setConfirmDeleteId(folderId);
    }
  };

  const activeIndex = categories.findIndex((c) => c.folderId === activeCategory);
  const tabValue = activeIndex >= 0 ? activeIndex : false;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue: number) => {
            const cat = categories[newValue];
            if (cat) {
              onChange(cat.folderId);
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Category tabs"
          sx={{ flex: 1, minHeight: 48 }}
        >
          <AnimatePresence initial={false}>
            {categories.map((cat) => (
              <Tab
                key={cat.folderId}
                component={motion.div}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                label={
                  editingTab === cat.folderId ? (
                    <TextField
                      inputRef={renameInputRef}
                      size="small"
                      variant="standard"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      onBlur={() => void handleRenameConfirm()}
                      autoFocus
                      sx={{ minWidth: 80 }}
                      slotProps={{
                        input: {
                          sx: { fontSize: "0.875rem" },
                        },
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        "&:hover .category-delete-btn": {
                          opacity: 1,
                        },
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startRename(cat.folderId, cat.name);
                      }}
                    >
                      {cat.name}
                      <Tooltip
                        title={
                          confirmDeleteId === cat.folderId
                            ? "Click again to delete"
                            : "Delete category"
                        }
                      >
                        <IconButton
                          className="category-delete-btn"
                          size="small"
                          aria-label={`Delete category ${cat.name}`}
                          onClick={(e) => handleDeleteClick(e, cat.folderId)}
                          onMouseLeave={() => setConfirmDeleteId(null)}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.15s",
                            p: 0.25,
                            color:
                              confirmDeleteId === cat.folderId
                                ? "error.main"
                                : "action.active",
                          }}
                        >
                          <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                }
                sx={{
                  textTransform: "none",
                  minHeight: 48,
                  px: 2,
                }}
              />
            ))}
          </AnimatePresence>
        </Tabs>

        <Tooltip title="Add category">
          <IconButton
            size="small"
            aria-label="Add category"
            onClick={() => {
              setAddingCategory(true);
              setTimeout(() => addInputRef.current?.focus(), 0);
            }}
            sx={{ ml: 0.5, flexShrink: 0 }}
          >
            <AddOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <AnimatePresence>
        {addingCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box sx={{ pt: 1.5, pb: 0.5, px: 1 }}>
              <TextField
                inputRef={addInputRef}
                size="small"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleAddKeyDown}
                onBlur={() => void handleAddConfirm()}
                autoFocus
                fullWidth
                sx={{ maxWidth: 300 }}
                slotProps={{
                  input: {
                    sx: { fontSize: "0.875rem" },
                  },
                }}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
