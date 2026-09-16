/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, Edit, Trash2, Search, Filter, Calendar, X, Upload, CheckCircle, HelpCircle, 
  Layers, Package as PackageIcon, ArrowRight
} from "lucide-react";
import { Service, Category, Package } from "../types";

interface AdminServicesPageProps {
  services: (Service & { packages: Package[] })[];
  categories: Category[];
  onCreateService: (serviceData: any) => Promise<void>;
  onUpdateService: (id: string, serviceData: any) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export function AdminServicesPage({
  services,
  categories,
  onCreateService,
  onUpdateService,
  onDeleteService,
}: AdminServicesPageProps) {
  
  // State for search and filter controls
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Create/Edit modal/sub-form controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAgeGroup, setFormAgeGroup] = useState("All Ages");
  const [formGender, setFormGender] = useState("All");
  const [formImage, setFormImage] = useState("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formLongDesc, setFormLongDesc] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  
  // Repeatable "Packages" section state
  const [formPackages, setFormPackages] = useState<{
    id?: string;
    title: string;
    mrp: number;
    sellingPrice: number;
    serviceType: "In-person" | "Online";
  }[]>([
    { title: "Standard Package", mrp: 499, sellingPrice: 249, serviceType: "In-person" }
  ]);

  // Handle opening form for Create New
  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setFormName("");
    setFormCategoryId(categories[0]?.id || "cat-1");
    setFormAgeGroup("All Ages");
    setFormGender("All");
    setFormImage("https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&q=80&w=600");
    setFormShortDesc("");
    setFormLongDesc("");
    setFormStatus("active");
    setFormPackages([
      { title: "Standard Option", mrp: 500, sellingPrice: 250, serviceType: "In-person" }
    ]);
    setIsFormOpen(true);
  };

  // Handle opening form for Edit
  const handleOpenEdit = (srv: Service & { packages: Package[] }) => {
    setEditingServiceId(srv.id);
    setFormName(srv.name);
    setFormCategoryId(srv.categoryId);
    setFormAgeGroup(srv.ageGroup);
    setFormGender(srv.gender);
    setFormImage(srv.image);
    setFormShortDesc(srv.shortDescription);
    setFormLongDesc(srv.longDescription);
    setFormStatus(srv.status);
    setFormPackages(srv.packages.map(p => ({
      id: p.id,
      title: p.title,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice,
      serviceType: p.serviceType
    })));
    setIsFormOpen(true);
  };

  // Repeatable Packages functions
  const addPackageBlock = () => {
    setFormPackages([
      ...formPackages,
      { title: `Option ${formPackages.length + 1}`, mrp: 400, sellingPrice: 200, serviceType: "In-person" }
    ]);
  };

  const removePackageBlock = (index: number) => {
    if (formPackages.length === 1) {
      alert("At least one diagnostic package option must remain active.");
      return;
    }
    setFormPackages(formPackages.filter((_, idx) => idx !== index));
  };

  const updatePackageField = (index: number, field: string, value: any) => {
    setFormPackages(prev => prev.map((pkg, idx) => {
      if (idx === index) {
        return { ...pkg, [field]: value };
      }
      return pkg;
    }));
  };

  // Handle form submission
  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCategoryId) {
      alert("Please provide the Service Name and select a Category.");
      return;
    }

    const payload = {
      name: formName,
      categoryId: formCategoryId,
      ageGroup: formAgeGroup,
      gender: formGender,
      image: formImage,
      shortDescription: formShortDesc,
      longDescription: formLongDesc,
      status: formStatus,
      packages: formPackages
    };

    try {
      if (editingServiceId) {
        await onUpdateService(editingServiceId, payload);
      } else {
        await onCreateService(payload);
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving service entry.");
    }
  };

  // Status quick toggle function
  const handleQuickToggleStatus = async (srv: Service & { packages: Package[] }) => {
    const newStatus = srv.status === "active" ? "inactive" : "active";
    await onUpdateService(srv.id, {
      ...srv,
      status: newStatus,
      packages: srv.packages
    });
  };

  // Delete handler
  const handleDeleteClick = async (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to completely delete the service "${name}"? This will also remove associated packages.`)) {
      await onDeleteService(id);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Filter service items
  const filteredServices = services.filter((srv) => {
    const matchesSearch = srv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          srv.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || srv.status === statusFilter;
    
    // Simulating date match if populated
    let matchesDate = true;
    if (dateFrom || dateTo) {
      // For diagnostic demo we match loosely
      matchesDate = true;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display">Services Management</h2>
          <p className="text-xs text-gray-500">Configure catalog options, packages, and doorstep practitioner assignments.</p>
        </div>

        <button 
          id="admin-create-srv-btn"
          onClick={handleOpenCreate}
          className="bg-[#2C422F] hover:bg-[#1E2D20] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Service</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-wrap items-center gap-4">
        
        {/* Keyword Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            id="admin-srv-search"
            type="text"
            placeholder="Search catalog services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-40">
          <select 
            id="admin-srv-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F] appearance-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Date From */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-500">From:</span>
          <input 
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none text-gray-600"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-500">To:</span>
          <input 
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none text-gray-600"
          />
        </div>

        {/* Clear Filters Button */}
        <button 
          id="admin-srv-clear-filters"
          onClick={handleClearFilters}
          className="text-xs text-gray-500 hover:text-black hover:underline focus:outline-none font-medium"
        >
          Clear Filters
        </button>

      </div>

      {/* SERVICES TABLE GRID */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="admin-services-table" className="w-full text-left border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 font-bold">S.No</th>
                <th className="py-3 px-4 font-bold">Media</th>
                <th className="py-3 px-4 font-bold">Service Name</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Age Group</th>
                <th className="py-3 px-4 font-bold">Gender</th>
                <th className="py-3 px-4 font-bold">Price range (AED)</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100 text-gray-600">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-400">
                    No services found matching current search criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv, index) => {
                  const catName = categories.find(c => c.id === srv.categoryId)?.name || "Other";
                  const sPrices = srv.packages.map(p => p.sellingPrice);
                  const minPrice = sPrices.length > 0 ? Math.min(...sPrices) : 0;
                  const maxPrice = sPrices.length > 0 ? Math.max(...sPrices) : 0;
                  const priceStr = minPrice === maxPrice ? `AED ${minPrice.toFixed(0)}` : `AED ${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)}`;

                  return (
                    <tr key={srv.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-semibold text-gray-400">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <img 
                          src={srv.image} 
                          alt={srv.name} 
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-950">{srv.name}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-xs">{srv.shortDescription}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-900 font-medium">{catName}</td>
                      <td className="py-3.5 px-4">{srv.ageGroup}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 font-medium text-[10px]">
                          {srv.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-800">{priceStr}</td>
                      <td className="py-3.5 px-4">
                        {/* Interactive Status toggle switch */}
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={srv.status === "active"}
                            onChange={() => handleQuickToggleStatus(srv)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {srv.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button 
                          onClick={() => handleOpenEdit(srv)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors inline-block"
                          title="Edit Service details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(srv.id, srv.name)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors inline-block"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DIALOG MODAL PANEL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-[#FAF7F2] rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">
                  {editingServiceId ? "Modify Clinical Service Entry" : "Register New Clinical Service"}
                </h3>
                <p className="text-[10px] text-gray-500">Configure core diagnostic specifications, age group constraints, and billing items</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAndPublish} className="p-6 space-y-5 flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Service Name *</label>
                  <input 
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. PCR Food Intolerance Assay"
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-[#2C422F] text-xs focus:outline-none"
                  />
                </div>

                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Select Category *</label>
                  <select 
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:ring-1 focus:ring-[#2C422F] text-xs focus:outline-none appearance-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Age Group */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Age Group *</label>
                  <select 
                    value={formAgeGroup}
                    onChange={(e) => setFormAgeGroup(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none appearance-none"
                  >
                    <option value="All Ages">All Ages</option>
                    <option value="Adults">Adults</option>
                    <option value="Seniors">Seniors (Geriatric)</option>
                    <option value="Pediatrics">Pediatrics (Kids)</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Gender Match *</label>
                  <select 
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none appearance-none"
                  >
                    <option value="All">All</option>
                    <option value="Male">Male only</option>
                    <option value="Female">Female only</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Publishing Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none appearance-none"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Media input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Media URL / Graphic Path</label>
                <input 
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Paste Unsplash address or local media thumbnail resource URL"
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs focus:outline-none"
                />
              </div>

              {/* REPEATABLE "PACKAGES" SECTION */}
              <div className="p-4 rounded-xl border border-[#2C422F]/10 bg-[#FAF7F2]/50 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200/80 pb-2">
                  <span className="text-[11px] font-bold text-[#2C422F] flex items-center">
                    <PackageIcon className="w-4 h-4 mr-1 text-[#D46A43]" />
                    Dynamic Packages Selection
                  </span>
                  
                  {/* green "+ Add Package" button */}
                  <button 
                    type="button"
                    onClick={addPackageBlock}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-md flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Package</span>
                  </button>
                </div>

                <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                  {formPackages.map((pkg, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Package #{idx + 1}</span>
                        
                        {/* red "Remove" button */}
                        <button 
                          type="button"
                          onClick={() => removePackageBlock(idx)}
                          className="text-red-600 hover:text-red-800 hover:underline font-bold text-[10px] uppercase flex items-center"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-2 space-y-0.5">
                          <span className="text-[10px] text-gray-400">Package Title *</span>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Elite DNA Sequence"
                            value={pkg.title}
                            onChange={(e) => updatePackageField(idx, "title", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400">Original MRP (AED)</span>
                          <input 
                            type="number"
                            required
                            min="0"
                            placeholder="598"
                            value={pkg.mrp}
                            onChange={(e) => updatePackageField(idx, "mrp", parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded focus:outline-none"
                          />
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400">Selling Price (AED)</span>
                          <input 
                            type="number"
                            required
                            min="0"
                            placeholder="234"
                            value={pkg.sellingPrice}
                            onChange={(e) => updatePackageField(idx, "sellingPrice", parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400">Service Type</span>
                          <select 
                            value={pkg.serviceType}
                            onChange={(e) => updatePackageField(idx, "serviceType", e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-2 py-1.5 rounded focus:outline-none appearance-none"
                          >
                            <option value="In-person">In-person (Doorstep visits)</option>
                            <option value="Online">Online / Telehealth</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Short Description *</label>
                <textarea 
                  required
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="Display brief summary shown on listing cards..."
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">Long Description (Clinical details)</label>
                <textarea 
                  rows={4}
                  value={formLongDesc}
                  onChange={(e) => setFormLongDesc(e.target.value)}
                  placeholder="Paste in clinical scope, pre-requisites, laboratory assay detail guidelines, and documentation limits..."
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Buttons: Cancel and Save & Publish */}
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#2C422F] hover:bg-[#1E2D20] text-white font-bold px-5 py-2.5 rounded-lg shadow-sm"
                >
                  Save & Publish
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
