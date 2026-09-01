"use client";

import React, { useState } from "react";
import { useMenuStore, MenuItemData } from "@/store/useMenuStore";
import { usePageStore } from "@/store/usePageStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Layers,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CornerDownRight,
  PlusCircle,
  FolderTree,
} from "lucide-react";

export default function AdminMenuPage() {
  const {
    menus,
    activeMenuId,
    getActiveMenu,
    setActiveMenuId,
    createMenu,
    deleteMenu,
    updateActiveMenu,
    setItems,
    addMultipleItems,
    updateItem,
    removeItem,
    indentItem,
    makeSubItemOf,
    saveMenus,
  } = useMenuStore();

  const currentMenu = getActiveMenu();
  const { pages } = usePageStore();

  // Multi-Menu Switcher State
  const [selectedMenuToEdit, setSelectedMenuToEdit] = useState(activeMenuId);
  const [isCreatingNewMenu, setIsCreatingNewMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");

  // Left Accordion Open/Closed State
  const [pagesAccordionOpen, setPagesAccordionOpen] = useState(true);
  const [linksAccordionOpen, setLinksAccordionOpen] = useState(false);
  const [categoriesAccordionOpen, setCategoriesAccordionOpen] = useState(false);

  // Pages Tab
  const [pagesTab, setPagesTab] = useState<"recent" | "all" | "search">("recent");
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  // Categories Tab
  const { categories } = useCategoryStore();
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([]);

  // Custom Links Inputs
  const [customUrl, setCustomUrl] = useState("https://");
  const [customText, setCustomText] = useState("");
  const [customTargetBlank, setCustomTargetBlank] = useState(false);

  // Right Side Menu Item Expanded Details
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Drag & Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dropDepth, setDropDepth] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectMenu = () => {
    setActiveMenuId(selectedMenuToEdit);
    showNotification(`Switched to "${menus.find((m) => m.id === selectedMenuToEdit)?.name}"!`);
  };

  const handleCreateNewMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;
    const created = createMenu(newMenuName);
    setSelectedMenuToEdit(created.id);
    setNewMenuName("");
    setIsCreatingNewMenu(false);
    showNotification(`Created menu "${created.name}"!`);
  };

  // Helper: Calculate item depth (0 = Level 1, 1 = Level 2, 2 = Level 3)
  const getItemDepth = (itemId: string): number => {
    const item = currentMenu.items.find((i) => i.id === itemId);
    if (!item || !item.parentId) return 0;
    const parent = currentMenu.items.find((i) => i.id === item.parentId);
    if (!parent || !parent.parentId) return 1;
    return 2;
  };

  // Drag & Drop Handlers with multi-depth detection
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;

    let targetDepth = 0;
    if (index > 0) {
      if (relativeX > 140) targetDepth = 2;
      else if (relativeX > 70) targetDepth = 1;
    }

    setDropDepth(targetDepth);
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      setDropDepth(0);
      return;
    }

    const copy = [...currentMenu.items];
    const [draggedItem] = copy.splice(draggedIdx, 1);

    if (dropDepth > 0 && targetIndex > 0) {
      const prevCandidateIdx = targetIndex <= draggedIdx ? targetIndex - 1 : targetIndex - 1;
      const prevCandidate = copy[prevCandidateIdx] || copy[0];

      if (dropDepth === 2) {
        // Drop as Level 3 (child of prevCandidate)
        draggedItem.parentId = prevCandidate.id;
        showNotification(`"${draggedItem.label}" nested as Level 3 child under "${prevCandidate.label}"!`);
      } else {
        // Drop as Level 2 (child of parentCandidate or prevCandidate's parent)
        draggedItem.parentId = prevCandidate.parentId || prevCandidate.id;
        showNotification(`"${draggedItem.label}" nested as Level 2 sub-item!`);
      }
      copy.splice(targetIndex, 0, draggedItem);
      setItems(copy);
    } else {
      draggedItem.parentId = null;
      copy.splice(targetIndex, 0, draggedItem);
      setItems(copy);
      showNotification("Menu item reordered!");
    }

    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropDepth(0);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropDepth(0);
  };

  // Add Pages to Menu
  const handleAddPagesToMenu = () => {
    if (selectedPageIds.length === 0) return;
    const selectedPages = pages.filter((p) => selectedPageIds.includes(p.id));
    const newMenuItems: Omit<MenuItemData, "id">[] = selectedPages.map((p) => ({
      label: p.title,
      url: `/pages/${p.slug}`,
      type: "PAGE",
    }));

    addMultipleItems(newMenuItems);
    setSelectedPageIds([]);
    showNotification(`Added ${newMenuItems.length} page(s) to menu!`);
  };

  // Add Custom Link to Menu
  const handleAddCustomLinkToMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || !customUrl.trim()) return;

    addMultipleItems([
      {
        label: customText.trim(),
        url: customUrl.trim(),
        type: "CUSTOM",
        targetBlank: customTargetBlank,
      },
    ]);

    setCustomText("");
    setCustomUrl("https://");
    setCustomTargetBlank(false);
    showNotification(`Added custom link "${customText}" to menu!`);
  };

  // Add Categories to Menu
  const handleAddCategoriesToMenu = () => {
    if (selectedCategorySlugs.length === 0) return;
    const selectedCats = categories.filter((c) => selectedCategorySlugs.includes(c.slug));
    const newMenuItems: Omit<MenuItemData, "id">[] = selectedCats.map((c) => ({
      label: c.name,
      url: `/category/${c.slug}`,
      type: "CATEGORY",
    }));

    addMultipleItems(newMenuItems);
    setSelectedCategorySlugs([]);
    showNotification(`Added ${newMenuItems.length} category link(s) to menu!`);
  };

  // Save Menu
  const handleSaveMenu = async () => {
    try {
      await saveMenus();
      showNotification(`Menu "${currentMenu?.name || 'menu'}" saved to store!`);
    } catch {
      showNotification("Failed to save menu. Please try again.");
    }
  };

  // Filtered pages
  const filteredPages = pages.filter((p) => {
    if (pagesTab === "search") {
      return p.title.toLowerCase().includes(pageSearchQuery.toLowerCase());
    }
    return true;
  });

  if (!currentMenu) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <FolderTree className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 text-sm font-medium">No menus yet.</p>
        <button
          type="button"
          onClick={() => setIsCreatingNewMenu(true)}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black"
        >
          Create Your First Menu
        </button>
        {isCreatingNewMenu && (
          <form onSubmit={handleCreateNewMenuSubmit} className="flex gap-2 mt-2">
            <input
              value={newMenuName}
              onChange={e => setNewMenuName(e.target.value)}
              placeholder="Menu name"
              className="border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Create</button>
            <button type="button" onClick={() => setIsCreatingNewMenu(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs">Cancel</button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-emerald-600" />
            <span>Navigation Menu Builder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create 3-level hierarchical menus (Top-level → Sub-heading → Child links) with drag-and-drop indenting.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveMenu}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm self-start sm:self-auto"
        >
          Save Menu
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 0. MULTI-MENU SELECTOR BAR (Exact Match to Screenshot)         */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-700">Select a menu to edit:</span>

          <select
            value={selectedMenuToEdit}
            onChange={(e) => setSelectedMenuToEdit(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-blue-500 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none ring-2 ring-blue-500/20"
          >
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSelectMenu}
            className="px-4 py-1.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition"
          >
            Select
          </button>

          <span className="text-slate-500">
            or{" "}
            <button
              type="button"
              onClick={() => setIsCreatingNewMenu(true)}
              className="text-blue-600 hover:underline font-bold"
            >
              create a new menu
            </button>
            . Do not forget to save your changes!
          </span>
        </div>

        {/* Current Menu Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Currently Editing:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
            {currentMenu.name}
          </span>
        </div>
      </div>

      {/* Create New Menu Inline Modal / Form */}
      {isCreatingNewMenu && (
        <form
          onSubmit={handleCreateNewMenuSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3 animate-in fade-in text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Create a New Menu</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingNewMenu(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. Categories Mega Menu, Sidebar Nav, Promo Menu"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              required
              className="flex-1 w-full px-3.5 py-2 rounded-xl bg-white border border-blue-300 text-slate-900 font-bold focus:outline-none"
            />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs transition"
              >
                Create Menu
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingNewMenu(false)}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* LEFT COLUMN: Add Menu Items (4 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm">Add menu items</h2>

          {/* 1. Pages Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => setPagesAccordionOpen(!pagesAccordionOpen)}
              className="w-full p-4 flex items-center justify-between font-bold text-slate-900 text-xs hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Pages</span>
              </div>
              {pagesAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {pagesAccordionOpen && (
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2 text-[11px] font-bold">
                  <button
                    onClick={() => setPagesTab("recent")}
                    className={pagesTab === "recent" ? "text-emerald-600 underline" : "text-slate-500 hover:text-slate-900"}
                  >
                    Most Recent
                  </button>
                  <button
                    onClick={() => setPagesTab("all")}
                    className={pagesTab === "all" ? "text-emerald-600 underline" : "text-slate-500 hover:text-slate-900"}
                  >
                    View All
                  </button>
                  <button
                    onClick={() => setPagesTab("search")}
                    className={pagesTab === "search" ? "text-emerald-600 underline" : "text-slate-500 hover:text-slate-900"}
                  >
                    Search
                  </button>
                </div>

                {pagesTab === "search" && (
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                )}

                <div className="max-h-48 overflow-y-auto space-y-2 py-1 pr-1">
                  {filteredPages.map((page) => {
                    const isChecked = selectedPageIds.includes(page.id);
                    return (
                      <label
                        key={page.id}
                        className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedPageIds((prev) =>
                              isChecked ? prev.filter((id) => id !== page.id) : [...prev, page.id]
                            )
                          }
                          className="w-3.5 h-3.5 rounded text-emerald-600"
                        />
                        <span className="truncate">{page.title}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPageIds.length === filteredPages.length) {
                        setSelectedPageIds([]);
                      } else {
                        setSelectedPageIds(filteredPages.map((p) => p.id));
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {selectedPageIds.length === filteredPages.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPagesToMenu}
                    disabled={selectedPageIds.length === 0}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-30 text-white font-bold text-xs transition"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Custom Links Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => setLinksAccordionOpen(!linksAccordionOpen)}
              className="w-full p-4 flex items-center justify-between font-bold text-slate-900 text-xs hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                <span>Custom Links</span>
              </div>
              {linksAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {linksAccordionOpen && (
              <form onSubmit={handleAddCustomLinkToMenu} className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Link Text</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. Special Discount Page"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                  <input
                    type="checkbox"
                    checked={customTargetBlank}
                    onChange={(e) => setCustomTargetBlank(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600"
                  />
                  <span>Open link in a new tab</span>
                </label>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition"
                  >
                    Add to Menu
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3. Categories Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => setCategoriesAccordionOpen(!categoriesAccordionOpen)}
              className="w-full p-4 flex items-center justify-between font-bold text-slate-900 text-xs hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Product Categories</span>
              </div>
              {categoriesAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {categoriesAccordionOpen && (
              <div className="p-4 space-y-3 text-xs">
                <div className="max-h-48 overflow-y-auto space-y-2 py-1 pr-1">
                  {categories.map((cat) => {
                    const isChecked = selectedCategorySlugs.includes(cat.slug);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2.5 text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedCategorySlugs((prev) =>
                              isChecked
                                ? prev.filter((s) => s !== cat.slug)
                                : [...prev, cat.slug]
                            )
                          }
                          className="w-3.5 h-3.5 rounded text-emerald-600"
                        />
                        <span className="truncate">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategorySlugs.length === categories.length) {
                        setSelectedCategorySlugs([]);
                      } else {
                        setSelectedCategorySlugs(categories.map((c) => c.slug));
                      }
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {selectedCategorySlugs.length === categories.length ? "Deselect All" : "Select All"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategoriesToMenu}
                    disabled={selectedCategorySlugs.length === 0}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-30 text-white font-bold text-xs transition"
                  >
                    Add to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: 3-Level Hierarchical Structure (8 cols)          */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <label className="font-bold text-slate-800 text-xs shrink-0">Menu Name:</label>
                <input
                  type="text"
                  value={currentMenu.name}
                  onChange={(e) => updateActiveMenu({ name: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                {currentMenu.items.length} items configured
              </div>
            </div>

            {/* Visual Hierarchy Diagram / Instructions */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>3-Level Hierarchy Visual System:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="bg-white p-2 rounded-xl border border-slate-200 font-medium">
                  <span className="font-bold text-slate-900 block">Level 1 (No Indent)</span>
                  Top Category / Main Menu Item
                </div>
                <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-200 font-medium text-emerald-950">
                  <span className="font-bold block">Level 2 (Indent 1)</span>
                  ↳ Column Heading (e.g. Smartphones)
                </div>
                <div className="bg-blue-50/60 p-2 rounded-xl border border-blue-200 font-medium text-blue-950">
                  <span className="font-bold block">Level 3 (Indent 2)</span>
                  └── Child Link (e.g. Apple, Samsung)
                </div>
              </div>
            </div>

            {/* Menu Items List with 3-Level Drag & Drop & Indent */}
            <div className="space-y-2 pt-1">
              {currentMenu.items.map((item, idx) => {
                const isExpanded = expandedItemId === item.id;
                const depth = getItemDepth(item.id);
                const isDragging = draggedIdx === idx;
                const isDragOver = dragOverIdx === idx && draggedIdx !== idx;
                const parentItem = item.parentId ? currentMenu.items.find((i) => i.id === item.parentId) : null;
                const grandParentItem = parentItem?.parentId ? currentMenu.items.find((i) => i.id === parentItem.parentId) : null;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-2xl border transition-all duration-200 relative ${
                      depth === 2
                        ? "ml-12 sm:ml-20 border-blue-200 bg-blue-50/30"
                        : depth === 1
                        ? "ml-6 sm:ml-10 border-emerald-200 bg-emerald-50/40"
                        : "bg-white border-slate-200"
                    } ${
                      isDragging
                        ? "opacity-30 scale-[0.98] border-emerald-500"
                        : isDragOver
                        ? dropDepth === 2
                          ? "border-blue-500 border-2 bg-blue-50/60 shadow-md translate-x-6"
                          : dropDepth === 1
                          ? "border-emerald-500 border-2 bg-emerald-50/60 shadow-md translate-x-3"
                          : "border-emerald-500 border-2 shadow-md"
                        : "shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    {/* Visual Connector Lines */}
                    {depth === 1 && (
                      <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-mono text-sm select-none">
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {depth === 2 && (
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-blue-500 font-mono text-sm select-none flex items-center">
                        <span className="text-[10px] text-blue-400">└─</span>
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Item Row */}
                    <div className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          title="Drag up/down to reorder, or drag right to nest"
                          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 truncate">{item.label}</span>

                        {depth === 2 ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                            child link {parentItem ? `of ${parentItem.label}` : ""}
                          </span>
                        ) : depth === 1 ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            sub-heading {parentItem ? `of ${parentItem.label}` : ""}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase font-mono">
                            {item.type} (Level 1)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Indent / Outdent Multi-Level Buttons */}
                        {depth < 2 && idx > 0 && (
                          <button
                            type="button"
                            onClick={() => indentItem(item.id, "indent")}
                            className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-200"
                            title={depth === 0 ? "Nest as Level 2 Sub-Heading" : "Nest as Level 3 Child Link"}
                          >
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                            <span className="hidden sm:inline">
                              {depth === 0 ? "Nest Level 2" : "Nest Level 3"}
                            </span>
                          </button>
                        )}

                        {depth > 0 && (
                          <button
                            type="button"
                            onClick={() => indentItem(item.id, "outdent")}
                            className="px-2 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-200"
                            title={depth === 2 ? "Outdent to Level 2" : "Outdent to Main Menu"}
                          >
                            <ArrowLeft className="w-3 h-3 text-emerald-600" />
                            <span className="hidden sm:inline">
                              {depth === 2 ? "Level 2" : "Main Menu"}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Item Details Form */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl space-y-3 text-xs animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700">Navigation Label</label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => updateItem(item.id, { label: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-slate-700">Parent Menu Item / Group</label>
                            <select
                              value={item.parentId || "none"}
                              onChange={(e) => makeSubItemOf(item.id, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none"
                            >
                              <option value="none">— None (Top-level Main Item) —</option>
                              {currentMenu.items
                                .filter((i) => i.id !== item.id)
                                .map((parent) => {
                                  const pDepth = getItemDepth(parent.id);
                                  const prefix = pDepth === 0 ? "📁 [Level 1] " : "↳ 📑 [Level 2] ";
                                  return (
                                    <option key={parent.id} value={parent.id}>
                                      {prefix} {parent.label}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">URL Destination</label>
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => updateItem(item.id, { url: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none"
                          />
                        </div>

                        {/* Optional Mega Menu Promo Banner Settings (for Top-Level Categories) */}
                        {depth === 0 && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2 mt-2">
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Mega Menu Right Promo Card (Optional)</span>
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <input
                                type="text"
                                placeholder="Promo Title (e.g. Magnetic Desk Lamp)"
                                value={item.promoTitle || ""}
                                onChange={(e) => updateItem(item.id, { promoTitle: e.target.value })}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                              />
                              <input
                                type="text"
                                placeholder="Promo Tag (e.g. Trending Deal)"
                                value={item.promoTag || ""}
                                onChange={(e) => updateItem(item.id, { promoTag: e.target.value })}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="Promo Image URL (https://...)"
                              value={item.promoImage || ""}
                              onChange={(e) => updateItem(item.id, { promoImage: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[11px] font-mono"
                            />
                          </div>
                        )}

                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 pt-1">
                          <input
                            type="checkbox"
                            checked={!!item.targetBlank}
                            onChange={(e) => updateItem(item.id, { targetBlank: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-emerald-600"
                          />
                          <span>Open link in a new tab</span>
                        </label>

                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-rose-600 hover:underline font-bold"
                          >
                            Remove Item
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(null)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ========================================================== */}
            {/* Menu Settings & Display Locations                         */}
            {/* ========================================================== */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Menu Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3.5 gap-x-6 text-xs">
                {/* Row 1: Auto add pages */}
                <div className="text-slate-600 font-bold">Auto add pages</div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!currentMenu.autoAddPages}
                      onChange={(e) => updateActiveMenu({ autoAddPages: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Automatically add new top-level pages to this menu</span>
                  </label>
                </div>

                {/* Row 2: Menu Location with Categories Menu Role */}
                <div className="text-slate-600 font-bold pt-1">Menu location</div>
                <div className="sm:col-span-2 space-y-2.5">
                  {/* Header Location */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-900 font-semibold">
                    <input
                      type="checkbox"
                      checked={!!currentMenu.locations?.header}
                      onChange={(e) =>
                        updateActiveMenu({ locations: { ...currentMenu.locations, header: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Header Navigation Menu</span>
                  </label>

                  {/* Categories Menu Role */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-emerald-900 font-semibold bg-emerald-50/60 p-2 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={!!currentMenu.locations?.categories}
                      onChange={(e) =>
                        updateActiveMenu({ locations: { ...currentMenu.locations, categories: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-emerald-600 border-emerald-400 focus:ring-emerald-500"
                    />
                    <div>
                      <span>Categories Menu (Sidebar &amp; Mega Menu)</span>
                      <span className="block text-[11px] text-emerald-700 font-normal">
                        Powers the &apos;All Categories&apos; hover dropdown and vertical categories sidebar on the storefront.
                      </span>
                    </div>
                  </label>

                  {/* Footer Location */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!currentMenu.locations?.footer}
                      onChange={(e) =>
                        updateActiveMenu({ locations: { ...currentMenu.locations, footer: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span>
                      Footer Links{" "}
                      <span className="text-slate-400 text-[11px]">
                        (Currently set to: {menus.find((m) => m.locations?.footer)?.name || "Other Menu"})
                      </span>
                    </span>
                  </label>

                  {/* Top Announcement Bar */}
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!currentMenu.locations?.topBar}
                      onChange={(e) =>
                        updateActiveMenu({ locations: { ...currentMenu.locations, topBar: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <span>Top Announcement Bar</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (menus.length <= 1) {
                    alert("You must keep at least one menu.");
                    return;
                  }
                  if (confirm(`Delete menu "${currentMenu.name}"?`)) {
                    deleteMenu(currentMenu.id);
                    setSelectedMenuToEdit(menus[0].id);
                    showNotification("Menu deleted.");
                  }
                }}
                className="text-xs text-rose-600 hover:underline font-semibold"
              >
                Delete Menu
              </button>

              <button
                type="button"
                onClick={handleSaveMenu}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition"
              >
                Save Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
