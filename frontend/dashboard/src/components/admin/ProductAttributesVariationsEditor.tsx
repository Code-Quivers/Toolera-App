"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ProductType, 
  ProductAttributeConfig, 
  ProductVariationItem, 
  GlobalAttribute, 
  AttributeType,
  VariationStatus 
} from "@/types";
import { useAttributeStore } from "@/store/useAttributeStore";
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  Sliders, 
  Image as ImageIcon, 
  Zap, 
  Star, 
  Eye, 
  X, 
  Sparkles, 
  ArrowRight,
  PackageCheck,
  Palette,
  Square,
  ListFilter,
  Type as TypeIcon,
  HelpCircle,
  UploadCloud
} from "lucide-react";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<AttributeType, any> = {
  COLOR: Palette,
  BUTTON: Square,
  SELECT: ListFilter,
  IMAGE: ImageIcon,
  TEXT: TypeIcon,
};

interface EditorProps {
  productType: ProductType;
  setProductType: (t: ProductType) => void;
  basePrice: number;
  baseComparePrice?: number;
  baseStock: number;
  baseSku: string;
  attributes: ProductAttributeConfig[];
  setAttributes: React.Dispatch<React.SetStateAction<ProductAttributeConfig[]>>;
  variations: ProductVariationItem[];
  setVariations: React.Dispatch<React.SetStateAction<ProductVariationItem[]>>;
  defaultVariationId?: string;
  setDefaultVariationId: (id: string | undefined) => void;
}

const PRESETS = [
  {
    name: "Lighting Preset",
    desc: "Color, Size, Wattage, Light Color, Material",
    attrs: ["Color", "Size", "Wattage", "Light Color", "Material"],
  },
  {
    name: "Fashion Preset",
    desc: "Color, Size, Material",
    attrs: ["Color", "Size", "Material"],
  },
  {
    name: "Electronics Preset",
    desc: "Color, Wattage, Voltage, Storage",
    attrs: ["Color", "Wattage", "Voltage", "Storage"],
  },
  {
    name: "Mobile Accessories Preset",
    desc: "Color, Model, Storage, Material",
    attrs: ["Color", "Model", "Storage", "Material"],
  },
  {
    name: "Kitchen Preset",
    desc: "Color, Capacity, Material, Size",
    attrs: ["Color", "Capacity", "Material", "Size"],
  },
];

function CustomValueInput({ onAdd }: { onAdd: (val: string) => void }) {
  const [val, setVal] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Add value (e.g. Small, Red, 500mAh)..."
        className="flex-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#008B47] placeholder:text-slate-400 transition"
      />
      <button
        type="submit"
        disabled={!val.trim()}
        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition disabled:opacity-40 flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
    </form>
  );
}

export function ProductAttributesVariationsEditor({
  productType,
  setProductType,
  basePrice,
  baseComparePrice,
  baseStock,
  baseSku,
  attributes,
  setAttributes,
  variations,
  setVariations,
  defaultVariationId,
  setDefaultVariationId,
}: EditorProps) {
  const { attributes: globalAttributes, fetchAttributes } = useAttributeStore();

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  // Modals & Drawers state
  const [isAddAttrDropdownOpen, setIsAddAttrDropdownOpen] = useState(false);
  const [isCustomAttrModalOpen, setIsCustomAttrModalOpen] = useState(false);
  const [customAttrName, setCustomAttrName] = useState("");
  const [customAttrType, setCustomAttrType] = useState<AttributeType>("BUTTON");
  const [customAttrValuesStr, setCustomAttrValuesStr] = useState("");
  
  // Type conversion warning modal
  const [conversionModal, setConversionModal] = useState<"SIMPLE_TO_VAR" | "VAR_TO_SIMPLE" | null>(null);

  // Variation explosion warning modal
  const [explosionModal, setExplosionModal] = useState<{ total: number } | null>(null);

  // Variation Edit Drawer
  const [editingVariation, setEditingVariation] = useState<ProductVariationItem | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState<"DRAWER" | { varId: string } | null>(null);

  // Direct Variation Image Upload
  const directVarImageRef = useRef<HTMLInputElement>(null);
  const [directVarTargetId, setDirectVarTargetId] = useState<string | "DRAWER" | null>(null);

  const handleDirectVarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url) return;
      if (directVarTargetId === "DRAWER" && editingVariation) {
        setEditingVariation((prev) => (prev ? { ...prev, image: url } : null));
      } else if (typeof directVarTargetId === "string") {
        setVariations((prev) =>
          prev.map((v) => (v.id === directVarTargetId ? { ...v, image: url } : v))
        );
      }
    };
    reader.readAsDataURL(file);
    if (directVarImageRef.current) directVarImageRef.current.value = "";
  };

  // Bulk Edit State
  const [selectedVarIds, setSelectedVarIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkValue, setBulkValue] = useState<string>("");

  // Calculate potential Cartesian variations count
  const variationAttributes = attributes.filter((a) => a.usedForVariations && a.values.length > 0);
  const potentialCount = variationAttributes.length > 0
    ? variationAttributes.reduce((acc, a) => acc * Math.max(1, a.values.length), 1)
    : 0;

  // Handle Adding an Existing Global Attribute
  const handleAddGlobalAttribute = (globalAttr: GlobalAttribute) => {
    if (attributes.some((a) => a.attributeId === globalAttr.id || a.name.toLowerCase() === globalAttr.name.toLowerCase())) {
      setIsAddAttrDropdownOpen(false);
      return;
    }

    const newAttr: ProductAttributeConfig = {
      id: `pa-${Date.now()}-${globalAttr.id}`,
      attributeId: globalAttr.id,
      name: globalAttr.name,
      slug: globalAttr.slug,
      type: globalAttr.type,
      isCustom: false,
      visible: true,
      usedForVariations: true,
      position: attributes.length,
      values: globalAttr.values.map((v) => ({
        id: `pav-${Date.now()}-${v.id}`,
        attributeValueId: v.id,
        name: v.name,
        slug: v.slug,
        colorHex: v.colorHex,
        imageUrl: v.imageUrl,
        position: v.position,
      })),
    };

    setAttributes([...attributes, newAttr]);
    setIsAddAttrDropdownOpen(false);
  };

  // Handle Adding a Custom Attribute
  const handleCreateCustomAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAttrName.trim()) return;

    const rawValues = customAttrValuesStr
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const values = rawValues.map((vStr, i) => ({
      id: `pav-cust-${Date.now()}-${i}`,
      name: vStr,
      slug: vStr.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      position: i,
    }));

    const newAttr: ProductAttributeConfig = {
      id: `pa-cust-${Date.now()}`,
      name: customAttrName.trim(),
      slug: customAttrName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      type: customAttrType,
      isCustom: true,
      visible: true,
      usedForVariations: customAttrType !== "TEXT",
      position: attributes.length,
      values,
    };

    setAttributes([...attributes, newAttr]);
    setCustomAttrName("");
    setCustomAttrValuesStr("");
    setIsCustomAttrModalOpen(false);
  };

  // Apply Industry Preset
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    const newAttrsList: ProductAttributeConfig[] = [...attributes];

    preset.attrs.forEach((attrName) => {
      const globalAttr = globalAttributes.find((g) => g.name.toLowerCase() === attrName.toLowerCase());
      if (globalAttr && !newAttrsList.some((a) => a.attributeId === globalAttr.id || a.name.toLowerCase() === globalAttr.name.toLowerCase())) {
        newAttrsList.push({
          id: `pa-${Date.now()}-${globalAttr.id}`,
          attributeId: globalAttr.id,
          name: globalAttr.name,
          slug: globalAttr.slug,
          type: globalAttr.type,
          isCustom: false,
          visible: true,
          usedForVariations: globalAttr.type !== "TEXT" && globalAttr.type !== "SELECT",
          position: newAttrsList.length,
          values: globalAttr.values.slice(0, 3).map((v) => ({
            id: `pav-${Date.now()}-${v.id}`,
            attributeValueId: v.id,
            name: v.name,
            slug: v.slug,
            colorHex: v.colorHex,
            imageUrl: v.imageUrl,
            position: v.position,
          })),
        });
      }
    });

    setAttributes(newAttrsList);
  };

  // Add a custom value inline to a custom attribute
  const handleAddCustomValue = (attrIndex: number, valueName: string) => {
    const trimmed = valueName.trim();
    if (!trimmed) return;
    const target = attributes[attrIndex];
    if (target.values.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())) return;
    const newVal = {
      id: `pav-cust-${Date.now()}-${attrIndex}`,
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      position: target.values.length,
    };
    const updated = [...attributes];
    updated[attrIndex] = { ...target, values: [...target.values, newVal] };
    setAttributes(updated);
  };

  // Remove a single custom value from a custom attribute
  const handleRemoveCustomValue = (attrIndex: number, valueId: string) => {
    const target = attributes[attrIndex];
    const updated = [...attributes];
    updated[attrIndex] = { ...target, values: target.values.filter((v) => v.id !== valueId) };
    setAttributes(updated);
  };

  // Toggle single value for an attribute
  const handleToggleValueSelection = (attrIndex: number, globalVal: any) => {
    const target = attributes[attrIndex];
    const isSelected = target.values.some((v) => v.attributeValueId === globalVal.id || v.name === globalVal.name);

    let updatedValues;
    if (isSelected) {
      updatedValues = target.values.filter((v) => v.attributeValueId !== globalVal.id && v.name !== globalVal.name);
    } else {
      updatedValues = [
        ...target.values,
        {
          id: `pav-${Date.now()}-${globalVal.id}`,
          attributeValueId: globalVal.id,
          name: globalVal.name,
          slug: globalVal.slug,
          colorHex: globalVal.colorHex,
          imageUrl: globalVal.imageUrl,
          position: target.values.length,
        },
      ];
    }

    const updated = [...attributes];
    updated[attrIndex] = { ...target, values: updatedValues };
    setAttributes(updated);
  };

  // Select all / Clear all values for an attribute
  const handleSelectAllValues = (attrIndex: number) => {
    const target = attributes[attrIndex];
    const globalAttr = globalAttributes.find((g) => g.id === target.attributeId);
    if (!globalAttr) return;

    const allValues = globalAttr.values.map((v) => ({
      id: `pav-${Date.now()}-${v.id}`,
      attributeValueId: v.id,
      name: v.name,
      slug: v.slug,
      colorHex: v.colorHex,
      imageUrl: v.imageUrl,
      position: v.position,
    }));

    const updated = [...attributes];
    updated[attrIndex] = { ...target, values: allValues };
    setAttributes(updated);
  };

  const handleClearAllValues = (attrIndex: number) => {
    const updated = [...attributes];
    updated[attrIndex] = { ...updated[attrIndex], values: [] };
    setAttributes(updated);
  };

  const handleRemoveAttribute = (attrIndex: number) => {
    const updated = attributes.filter((_, i) => i !== attrIndex);
    setAttributes(updated);
  };

  const handleToggleAttributeFlag = (attrIndex: number, flag: "visible" | "usedForVariations") => {
    const updated = [...attributes];
    updated[attrIndex] = { ...updated[attrIndex], [flag]: !updated[attrIndex][flag] };
    setAttributes(updated);
  };

  // ==========================================
  // CARTESIAN PRODUCT VARIATION GENERATOR
  // ==========================================
  const handleGenerateVariations = () => {
    const activeAttrs = attributes.filter((a) => a.usedForVariations && a.values.length > 0);
    if (activeAttrs.length === 0) return;

    const totalCombos = activeAttrs.reduce((acc, a) => acc * a.values.length, 1);
    if (totalCombos > 50) {
      setExplosionModal({ total: totalCombos });
      return;
    }

    executeCartesianGeneration(activeAttrs);
  };

  const executeCartesianGeneration = (activeAttrs: ProductAttributeConfig[]) => {
    // Cartesian combination helper
    const cartesian = (arrays: any[][]): any[][] => {
      return arrays.reduce((acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])), [[]]);
    };

    const attributeValuesArrays = activeAttrs.map((attr) =>
      attr.values.map((v) => ({
        attributeId: attr.attributeId,
        attributeName: attr.name,
        attributeValueId: v.attributeValueId,
        valueName: v.name,
        valueSlug: v.slug,
        colorHex: v.colorHex,
        imageUrl: v.imageUrl,
      }))
    );

    const rawCombos = cartesian(attributeValuesArrays);

    const generated: ProductVariationItem[] = rawCombos.map((combo, idx) => {
      const canonicalKey = combo
        .map((c) => `${c.attributeName.toLowerCase()}:${c.valueName.toLowerCase()}`)
        .sort()
        .join("|");

      // Check if existing variation already matches this canonical combination
      const existing = variations.find((v) => v.canonicalKey === canonicalKey);
      if (existing) return existing;

      const skuSuffix = combo
        .map((c) => c.valueName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase())
        .join("-");

      return {
        id: `var-${Date.now()}-${idx}`,
        sku: `${baseSku || "RM"}-${skuSuffix}`,
        price: Number(basePrice) || 0,
        compareAtPrice: Number(baseComparePrice) || Number(basePrice) || 0,
        stock: Math.max(5, Math.floor((Number(baseStock) || 20) / Math.max(1, rawCombos.length))),
        lowStockThreshold: 5,
        status: "ACTIVE",
        isDefault: idx === 0,
        useBasePrice: true,
        attributes: combo,
        canonicalKey,
      };
    });

    setVariations(generated);
    if (generated.length > 0 && !defaultVariationId) {
      setDefaultVariationId(generated[0].id);
    }
  };

  // Bulk Edit Actions
  const handleApplyBulkEdit = () => {
    if (!bulkAction) return;
    // If nothing selected, apply to all
    const targetIds = selectedVarIds.length > 0 ? selectedVarIds : variations.map((v) => v.id);

    const updated = variations.map((v) => {
      if (!targetIds.includes(v.id)) return v;

      switch (bulkAction) {
        case "SET_PRICE":
          return { ...v, price: Number(bulkValue) || v.price, useBasePrice: false };
        case "INC_PRICE":
          return { ...v, price: v.price + (Number(bulkValue) || 0), useBasePrice: false };
        case "DEC_PRICE":
          return { ...v, price: Math.max(0, v.price - (Number(bulkValue) || 0)), useBasePrice: false };
        case "SET_STOCK":
          return { ...v, stock: Number(bulkValue) || 0 };
        case "INC_STOCK":
          return { ...v, stock: v.stock + (Number(bulkValue) || 0) };
        case "SET_SKU_PREFIX":
          return { ...v, sku: `${bulkValue.trim()}-${v.sku}` };
        case "SET_STATUS_ACTIVE":
          return { ...v, status: "ACTIVE" as VariationStatus };
        case "SET_STATUS_INACTIVE":
          return { ...v, status: "INACTIVE" as VariationStatus };
        case "SET_STATUS_ARCHIVED":
          return { ...v, status: "ARCHIVED" as VariationStatus };
        default:
          return v;
      }
    });

    setVariations(updated);
    setBulkAction("");
    setBulkValue("");
    setSelectedVarIds([]);
  };

  // Duplicate single variation
  const handleDuplicateVariation = (varItem: ProductVariationItem) => {
    const copy: ProductVariationItem = {
      ...varItem,
      id: `var-copy-${Date.now()}`,
      sku: `${varItem.sku || "RM"}-COPY`,
      isDefault: false,
      canonicalKey: `${varItem.canonicalKey || ""}|copy-${Date.now()}`,
    };
    setVariations([...variations, copy]);
  };

  // Delete / Archive single variation
  const handleDeleteVariation = (varId: string) => {
    setVariations(variations.filter((v) => v.id !== varId));
    if (defaultVariationId === varId) {
      setDefaultVariationId(variations.find((v) => v.id !== varId)?.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. PRODUCT TYPE TOGGLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-[#008B47]" />
              <span>Product Type</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose whether this is a single standalone item or a product with multiple attributes &amp; variations.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (productType === "VARIABLE" && variations.length > 0) {
                  setConversionModal("VAR_TO_SIMPLE");
                } else {
                  setProductType("SIMPLE");
                }
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                productType === "SIMPLE"
                  ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              ● Simple Product
            </button>
            <button
              type="button"
              onClick={() => {
                if (productType === "SIMPLE") {
                  setProductType("VARIABLE");
                }
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                productType === "VARIABLE"
                  ? "bg-[#008B47] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Variable Product</span>
            </button>
          </div>
        </div>

        {productType === "SIMPLE" && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Simple products use base price (৳{basePrice || 0}), base stock ({baseStock || 0}), and base SKU. If you want sizes, colors, wattage, or custom options, switch to <strong>Variable Product</strong>.
            </span>
          </div>
        )}
      </div>

      {/* 2. ATTRIBUTES SECTION (FOR VARIABLE PRODUCTS) */}
      {productType === "VARIABLE" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          {/* Header & Presets */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Product Attributes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select reusable global attributes and choose only the values relevant for this product.
              </p>
            </div>

            {/* Quick Presets & Add Attribute Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Presets Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Apply Preset</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 hidden group-hover:block z-30 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Industry Presets
                  </div>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 transition text-xs font-bold text-slate-800 flex flex-col"
                    >
                      <span>{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Global Attribute Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAddAttrDropdownOpen(!isAddAttrDropdownOpen)}
                  className="px-4 py-2 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Attribute</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isAddAttrDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-30 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Select Global Attribute
                    </div>
                    {globalAttributes.map((ga) => {
                      const Icon = TYPE_ICONS[ga.type] || Square;
                      const isAdded = attributes.some((a) => a.attributeId === ga.id);

                      return (
                        <button
                          key={ga.id}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddGlobalAttribute(ga)}
                          className={cn(
                            "w-full text-left p-2 rounded-xl transition text-xs font-bold flex items-center justify-between",
                            isAdded
                              ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400"
                              : "hover:bg-emerald-50 hover:text-[#008B47] text-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ga.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">({ga.values.length})</span>
                        </button>
                      );
                    })}

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddAttrDropdownOpen(false);
                          setIsCustomAttrModalOpen(true);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span>+ Custom Product Attribute</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attributes Cards List */}
          {attributes.length === 0 ? (
            <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">No attributes attached</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click <strong>+ Add Attribute</strong> above or apply a preset (e.g. Lighting, Fashion, Electronics) to configure variations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr, attrIdx) => {
                const Icon = TYPE_ICONS[attr.type] || Square;
                const globalAttr = globalAttributes.find((g) => g.id === attr.attributeId);

                return (
                  <div
                    key={attr.id}
                    className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-4"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900">{attr.name}</span>
                            {attr.isCustom && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                                Custom
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-500">
                              ({attr.values.length} selected)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {globalAttr && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => handleSelectAllValues(attrIdx)}
                              className="px-2 py-1 text-slate-600 hover:text-[#008B47] font-semibold hover:bg-white rounded-lg transition"
                            >
                              Select All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleClearAllValues(attrIdx)}
                              className="px-2 py-1 text-slate-600 hover:text-rose-600 font-semibold hover:bg-white rounded-lg transition"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attrIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Values Selection Pills */}
                    {globalAttr ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {globalAttr.values.map((gv) => {
                          const isSelected = attr.values.some(
                            (v) => v.attributeValueId === gv.id || v.name === gv.name
                          );

                          return (
                            <button
                              key={gv.id}
                              type="button"
                              onClick={() => handleToggleValueSelection(attrIdx, gv)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shadow-2xs",
                                isSelected
                                  ? "bg-white border-[#008B47] text-[#008B47] ring-2 ring-[#008B47]/20"
                                  : "bg-white/60 border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                              )}
                            >
                              {attr.type === "COLOR" && gv.colorHex && (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-inner"
                                  style={{ backgroundColor: gv.colorHex }}
                                />
                              )}
                              {attr.type === "IMAGE" && gv.imageUrl && (
                                <img src={gv.imageUrl} alt={gv.name} className="w-4 h-4 rounded-md object-cover" />
                              )}
                              <span>{gv.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#008B47]" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map((v) => (
                            <span
                              key={v.id}
                              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                            >
                              {v.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomValue(attrIdx, v.id)}
                                className="text-slate-300 hover:text-rose-500 transition ml-0.5"
                                title="Remove value"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <CustomValueInput onAdd={(val) => handleAddCustomValue(attrIdx, val)} />
                        {attr.values.length === 0 && (
                          <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Add at least one value to enable variation generation.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Checkbox Options (Visible & Used for variations) */}
                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={attr.visible}
                          onChange={() => handleToggleAttributeFlag(attrIdx, "visible")}
                          className="w-4 h-4 rounded-md text-[#008B47] focus:ring-[#008B47] border-slate-300"
                        />
                        <span>Visible on product page (Specifications)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={attr.usedForVariations}
                          onChange={() => handleToggleAttributeFlag(attrIdx, "usedForVariations")}
                          className="w-4 h-4 rounded-md text-[#008B47] focus:ring-[#008B47] border-slate-300"
                        />
                        <span>Used for variations (Generates purchasable combinations)</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. VARIATIONS ENGINE (FOR VARIABLE PRODUCTS) */}
      {productType === "VARIABLE" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          {/* Header & Generation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#008B47]" />
                <span>Product Variations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create purchasable combinations from your selected variation attributes with custom prices, stock, and images.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {potentialCount > 0 && (
                <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {variationAttributes.map((a) => a.values.length).join(" × ")} = {potentialCount} possible {potentialCount === 1 ? "variation" : "variations"}
                </span>
              )}

              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={handleGenerateVariations}
                  disabled={potentialCount === 0}
                  className="px-4 py-2 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs transition shadow-xs flex items-center gap-2 disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Variations</span>
                </button>
                {potentialCount === 0 && attributes.length > 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Add values to your attributes first
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Variations Table & Bulk Editor */}
          {variations.length === 0 ? (
            <div className="p-10 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">No variations generated</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select your attribute values above and click <strong>Generate Variations</strong> to calculate all combinations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Edit Toolbar */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVarIds.length === variations.length && variations.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVarIds(variations.map((v) => v.id));
                        } else {
                          setSelectedVarIds([]);
                        }
                      }}
                      className="w-4 h-4 rounded text-[#008B47]"
                    />
                    <span>Select All ({selectedVarIds.length} of {variations.length})</span>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-xs"
                  >
                    <option value="">Bulk Edit Actions...</option>
                    <option value="SET_PRICE">Set Price (Tk)</option>
                    <option value="INC_PRICE">Increase Price (+Tk)</option>
                    <option value="DEC_PRICE">Decrease Price (-Tk)</option>
                    <option value="SET_STOCK">Set Stock Qty</option>
                    <option value="INC_STOCK">Increase Stock (+)</option>
                    <option value="SET_SKU_PREFIX">Set SKU Prefix</option>
                    <option value="SET_STATUS_ACTIVE">Set Status: Active</option>
                    <option value="SET_STATUS_INACTIVE">Set Status: Inactive</option>
                    <option value="SET_STATUS_ARCHIVED">Set Status: Archived</option>
                  </select>

                  {bulkAction && !bulkAction.startsWith("SET_STATUS") && (
                    <input
                      type="text"
                      placeholder="Value"
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-xs"
                    />
                  )}

                  {bulkAction && (
                    <button
                      type="button"
                      onClick={handleApplyBulkEdit}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
                    >
                      {selectedVarIds.length > 0 ? `Apply to ${selectedVarIds.length}` : "Apply to All"}
                    </button>
                  )}
                </div>
              </div>

              {/* Variations Table */}
              <div className="rounded-2xl border border-slate-200/90 overflow-x-auto bg-white shadow-2xs">
                <table className="w-full text-left min-w-[940px] text-xs">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <tr>
                      <th className="p-3 w-10 text-center"></th>
                      <th className="p-3 w-14 text-center">Image</th>
                      <th className="p-3 min-w-[200px]">Variation / Combination</th>
                      <th className="p-3 w-28">Price (Tk)</th>
                      <th className="p-3 w-28">Compare (Tk)</th>
                      <th className="p-3 w-24 text-center">Stock</th>
                      <th className="p-3 w-36">SKU</th>
                      <th className="p-3 w-28">Status</th>
                      <th className="p-3 w-32 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {variations.map((v) => {
                      const isDefault = defaultVariationId === v.id || v.isDefault;
                      const variationTitle = v.attributes.map((a) => a.valueName).join(" / ");

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition group">
                          {/* Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedVarIds.includes(v.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVarIds([...selectedVarIds, v.id]);
                                } else {
                                  setSelectedVarIds(selectedVarIds.filter((id) => id !== v.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-[#008B47] focus:ring-[#008B47]"
                            />
                          </td>

                          {/* Image Thumbnail */}
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMediaTarget({ varId: v.id });
                                setIsMediaModalOpen(true);
                              }}
                              className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center hover:opacity-80 transition relative shrink-0 mx-auto shadow-2xs group-hover:border-slate-300"
                            >
                              {v.image ? (
                                <img src={v.image} alt={variationTitle} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>

                          {/* Variation Name & Attribute Dots */}
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                <span>{variationTitle}</span>
                                {isDefault && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shadow-2xs border border-amber-200">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                                {v.attributes.map((a, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 bg-slate-100/90 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                                    {a.colorHex && (
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                                        style={{ backgroundColor: a.colorHex }}
                                      />
                                    )}
                                    <span>{a.attributeName}: <strong className="text-slate-800">{a.valueName}</strong></span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Price Inline Edit */}
                          <td className="p-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">৳</span>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => {
                                  const newPrice = Number(e.target.value);
                                  setVariations(
                                    variations.map((item) =>
                                      item.id === v.id ? { ...item, price: newPrice, useBasePrice: false } : item
                                    )
                                  );
                                }}
                                className="w-24 pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:border-[#008B47] transition shadow-2xs"
                              />
                            </div>
                          </td>

                          {/* Compare Price */}
                          <td className="p-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">৳</span>
                              <input
                                type="number"
                                value={v.compareAtPrice || ""}
                                placeholder="Compare"
                                onChange={(e) => {
                                  const newComp = Number(e.target.value);
                                  setVariations(
                                    variations.map((item) =>
                                      item.id === v.id ? { ...item, compareAtPrice: newComp } : item
                                    )
                                  );
                                }}
                                className="w-24 pl-6 pr-2 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:border-[#008B47] transition shadow-2xs"
                              />
                            </div>
                          </td>

                          {/* Stock Inline Edit */}
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const newStock = Number(e.target.value);
                                setVariations(
                                  variations.map((item) =>
                                    item.id === v.id ? { ...item, stock: newStock } : item
                                  )
                                );
                              }}
                              className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:border-[#008B47] text-center transition shadow-2xs"
                            />
                          </td>

                          {/* SKU Inline Edit */}
                          <td className="p-3">
                            <input
                              type="text"
                              value={v.sku || ""}
                              onChange={(e) => {
                                const newSku = e.target.value;
                                setVariations(
                                  variations.map((item) =>
                                    item.id === v.id ? { ...item, sku: newSku } : item
                                  )
                                );
                              }}
                              className="w-32 px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:border-[#008B47] transition shadow-2xs"
                            />
                          </td>

                          {/* Status Badge */}
                          <td className="p-3">
                            <select
                              value={v.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as VariationStatus;
                                setVariations(
                                  variations.map((item) =>
                                    item.id === v.id ? { ...item, status: newStatus } : item
                                  )
                                );
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-xl text-[10px] font-extrabold border cursor-pointer focus:outline-none shadow-2xs transition",
                                v.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : v.status === "INACTIVE"
                                  ? "bg-slate-100 text-slate-700 border-slate-200"
                                  : "bg-rose-50 text-rose-800 border-rose-200"
                              )}
                            >
                              <option value="ACTIVE">● Active</option>
                              <option value="INACTIVE">○ Inactive</option>
                              <option value="ARCHIVED">✕ Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDefaultVariationId(v.id)}
                                title={isDefault ? "Default Variation" : "Set as Default"}
                                className={cn(
                                  "p-1.5 rounded-lg transition",
                                  isDefault
                                    ? "text-amber-600 bg-amber-50 border border-amber-200 shadow-2xs"
                                    : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                                )}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingVariation(v)}
                                title="Edit in Drawer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateVariation(v)}
                                title="Duplicate Variation"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteVariation(v.id)}
                                title="Delete Variation"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. RIGHT-SIDE VARIATION EDIT DRAWER */}
      {editingVariation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Variation</h3>
                <p className="text-xs font-bold text-[#008B47]">
                  {editingVariation.attributes.map((a) => a.valueName).join(" / ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingVariation(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Fields */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Image Picker */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <label className="font-bold text-slate-700 block">Variation Photo</label>
                <div className="flex items-center gap-3.5">
                  <div className="relative w-20 h-20 rounded-2xl border-2 border-slate-200 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-2xs group">
                    {editingVariation.image ? (
                      <>
                        <img src={editingVariation.image} alt="Var" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditingVariation({ ...editingVariation, image: undefined })}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDirectVarTargetId("DRAWER");
                          directVarImageRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1.5 shadow-2xs text-[11px]"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMediaTarget("DRAWER");
                          setIsMediaModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center gap-1.5 text-[11px]"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#008B47]" />
                        <span>Media Library</span>
                      </button>
                    </div>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={editingVariation.image || ""}
                      onChange={(e) => setEditingVariation({ ...editingVariation, image: e.target.value })}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700 bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                </div>
              </div>

              {/* Price and Compare Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (৳)</label>
                  <input
                    type="number"
                    value={editingVariation.price}
                    onChange={(e) =>
                      setEditingVariation({ ...editingVariation, price: Number(e.target.value), useBasePrice: false })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Compare-at Price (৳)</label>
                  <input
                    type="number"
                    value={editingVariation.compareAtPrice || ""}
                    placeholder="Regular price"
                    onChange={(e) =>
                      setEditingVariation({ ...editingVariation, compareAtPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Stock and Low Stock Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingVariation.stock}
                    onChange={(e) => setEditingVariation({ ...editingVariation, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={editingVariation.lowStockThreshold || 5}
                    onChange={(e) =>
                      setEditingVariation({ ...editingVariation, lowStockThreshold: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* SKU and Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SKU</label>
                  <input
                    type="text"
                    value={editingVariation.sku || ""}
                    onChange={(e) => setEditingVariation({ ...editingVariation, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Weight (grams)</label>
                  <input
                    type="number"
                    placeholder="e.g. 250"
                    value={editingVariation.weight || ""}
                    onChange={(e) => setEditingVariation({ ...editingVariation, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              {/* Status and Default Variation */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={editingVariation.status}
                    onChange={(e) =>
                      setEditingVariation({ ...editingVariation, status: e.target.value as VariationStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold"
                  >
                    <option value="ACTIVE">● Active (Purchasable)</option>
                    <option value="INACTIVE">○ Inactive (Hidden)</option>
                    <option value="ARCHIVED">✕ Archived (Historical records only)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={defaultVariationId === editingVariation.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDefaultVariationId(editingVariation.id);
                      }
                    }}
                    className="w-4 h-4 rounded text-[#008B47]"
                  />
                  <span>Set as Default Variation (Preselected for customers)</span>
                </label>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingVariation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setVariations(variations.map((v) => (v.id === editingVariation.id ? editingVariation : v)));
                  setEditingVariation(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#008B47] text-white font-extrabold hover:bg-[#007a3e] transition shadow-xs"
              >
                Save Variation Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CUSTOM ATTRIBUTE CREATION MODAL */}
      {isCustomAttrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">+ Create Custom Product Attribute</h3>
              <button
                type="button"
                onClick={() => setIsCustomAttrModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomAttribute} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Attribute Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery Life, Special Edition, Plug Type"
                  value={customAttrName}
                  onChange={(e) => setCustomAttrName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Display Type</label>
                <select
                  value={customAttrType}
                  onChange={(e) => setCustomAttrType(e.target.value as AttributeType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  <option value="BUTTON">🔘 Button / Pill</option>
                  <option value="COLOR">🎨 Color Swatch</option>
                  <option value="SELECT">📋 Select Dropdown</option>
                  <option value="IMAGE">🖼️ Image Swatch</option>
                  <option value="TEXT">📝 Plain Text (Specifications only)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Values (separated by comma or new line)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 500mAh, 1000mAh, 2000mAh"
                  value={customAttrValuesStr}
                  onChange={(e) => setCustomAttrValuesStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomAttrModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customAttrName.trim()}
                  className="px-4 py-2 bg-[#008B47] text-white font-extrabold rounded-xl hover:bg-[#007a3e] transition"
                >
                  Add Custom Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. VARIATION EXPLOSION WARNING MODAL */}
      {explosionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">⚠ Large Number of Variations</h3>
              <p className="text-slate-600">
                You are about to create <strong>{explosionModal.total} variations</strong>. Large variation sets can make product management more difficult.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExplosionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplosionModal(null);
                  executeCartesianGeneration(attributes.filter((a) => a.usedForVariations && a.values.length > 0));
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
              >
                Generate Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONVERT PRODUCT TYPE WARNING MODAL */}
      {conversionModal === "VAR_TO_SIMPLE" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900">Convert to Simple Product?</h3>
              <p className="text-slate-600">
                This product currently has <strong>{variations.length} variations</strong>. Converting to Simple Product will disable variation-level pricing and inventory.
              </p>
              <p className="text-[11px] text-slate-400">
                Your variation records will be archived, not deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConversionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setProductType("SIMPLE");
                  setConversionModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
              >
                Convert to Simple
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Direct File Upload Input */}
      <input
        type="file"
        ref={directVarImageRef}
        accept="image/*"
        onChange={handleDirectVarImageUpload}
        className="hidden"
      />

      {/* Media Library Modal for Variation Photos */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => {
          setIsMediaModalOpen(false);
          setActiveMediaTarget(null);
        }}
        onSelect={(selectedUrl) => {
          const url = typeof selectedUrl === "string" ? selectedUrl : (selectedUrl as any)?.url || "";
          if (activeMediaTarget === "DRAWER" && editingVariation) {
            setEditingVariation((prev) => (prev ? { ...prev, image: url } : null));
          } else if (activeMediaTarget && typeof activeMediaTarget === "object" && "varId" in activeMediaTarget) {
            setVariations(
              variations.map((v) => (v.id === (activeMediaTarget as any).varId ? { ...v, image: url } : v))
            );
          }
          setIsMediaModalOpen(false);
          setActiveMediaTarget(null);
        }}
      />
    </div>
  );
}
