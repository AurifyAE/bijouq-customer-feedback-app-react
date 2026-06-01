import React, { useState, useEffect } from "react";
import ProductApiService from "../services/productApi";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Eye,
  Filter,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    DIVISION: "",
    PREFIX: "",
    CATEGORY: "",
    TYPE: "",
    BRAND: "",
    DECRIPTION: "",
  });

  const [formData, setFormData] = useState({
    PREFIX: "",
    DIVISION: "",
    CATEGORY: "",
    TYPE: "",
    BRAND: "",
    DECRIPTION: "",
    PRICE: "",
    STOCK: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        search: searchTerm,
        ...filters,
      };

      const response = await ProductApiService.getProducts(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, limit, searchTerm, filters]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    try {
      setIsSaving(true);
      const productData = {
        ...formData,
        PRICE: parseFloat(formData.PRICE),
        STOCK: parseInt(formData.STOCK),
      };

      if (editingProduct) {
        await ProductApiService.updateProduct(
          editingProduct._id,
          productData,
          imageFile,
        );
      } else {
        await ProductApiService.createProduct(productData, imageFile);
      }

      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductApiService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} products?`,
      )
    ) {
      try {
        await ProductApiService.deleteMultipleProducts(selectedProducts);
        setSelectedProducts([]);
        loadProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      PREFIX: "",
      DIVISION: "",
      CATEGORY: "",
      TYPE: "",
      BRAND: "",
      DECRIPTION: "",
      PRICE: "",
      STOCK: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
    setIsViewOnly(false);
  };

  // Open modal for editing or viewing
  const openModal = (product = null, viewOnly = false) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        PREFIX: product.PREFIX || "",
        DIVISION: product.DIVISION || "",
        CATEGORY: product.CATEGORY || "",
        TYPE: product.TYPE || "",
        BRAND: product.BRAND || "",
        DECRIPTION: product.DECRIPTION || "",
        PRICE: product.PRICE || "",
        STOCK: product.STOCK || "",
      });
      setImagePreview(product.IMAGE_URL);
    } else {
      resetForm();
    }
    setIsViewOnly(viewOnly);
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      DIVISION: "",
      PREFIX: "",
      CATEGORY: "",
      TYPE: "",
      BRAND: "",
      DECRIPTION: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <div className="flex justify-between items-center text-white">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Product Inventory
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Manage your catalog, stock, and pricing
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-white text-blue-700 px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${
                  showFilters
                    ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter size={18} />
                Filters
                {Object.values(filters).some((v) => v !== "") && (
                  <span className="bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {Object.values(filters).filter((v) => v !== "").length}
                  </span>
                )}
              </button>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>

              {selectedProducts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 shadow-md transition-all active:scale-95"
                >
                  <Trash2 size={18} />
                  Delete ({selectedProducts.length})
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-gray-200 mt-4 animate-in fade-in slide-in-from-top-2">
              {Object.keys(filters).map((key) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    name={key}
                    placeholder={`Filter by ${key.toLowerCase()}`}
                    value={filters[key]}
                    onChange={handleFilterChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              ))}
              <div className="lg:col-span-6 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(products.map((p) => p._id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    checked={
                      selectedProducts.length > 0 &&
                      selectedProducts.length === products.length
                    }
                  />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Details
                </th>
                <th className="p-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Brand / Category
                </th>
                <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="p-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="p-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-gray-500 font-medium">
                        Loading products...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500 font-medium">
                        No products found matching your criteria
                      </p>
                      <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedProducts.includes(product._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([
                              ...selectedProducts,
                              product._id,
                            ]);
                          } else {
                            setSelectedProducts(
                              selectedProducts.filter(
                                (id) => id !== product._id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {product.IMAGE_URL ? (
                            <img
                              src={product.IMAGE_URL}
                              alt={product.PREFIX}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/150?text=No+Image";
                              }}
                            />
                          ) : (
                            <ImageIcon className="text-gray-400 w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {product.PREFIX}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 w-48">
                            {product.DECRIPTION}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-700">
                          {product.DIVISION}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {product.TYPE}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {product.CATEGORY}
                        </div>
                        <div className="text-xs text-gray-600 ml-1">
                          {product.BRAND}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-gray-900">
                        $
                        {parseFloat(product.PRICE).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none ${
                          product.STOCK > 10
                            ? "bg-green-100 text-green-700"
                            : product.STOCK > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.STOCK}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(product, true)}
                          title="View Details"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => openModal(product, false)}
                          title="Edit Product"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          title="Delete Product"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-white border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * limit + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * limit, products.length === 0 ? 0 : 1000)}
            </span>{" "}
            of page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Simple logic for visible page numbers
                let pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit/View Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isViewOnly
                    ? "Product Details"
                    : editingProduct
                      ? "Edit Product"
                      : "Add New Product"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isViewOnly
                    ? "View all product information"
                    : "Fill in the details below to save the product"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <form id="product-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload Section */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Product Image
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            {!isViewOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                }}
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 hover:bg-white"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </>
                        ) : (
                          <ImageIcon className="text-gray-300 w-10 h-10" />
                        )}
                      </div>
                      {!isViewOnly && (
                        <div className="flex-1 space-y-2 mt-2">
                          <p className="text-xs text-gray-500">
                            Pick a high-quality JPG or PNG image (max 5MB).
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-xs text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Prefix
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.PREFIX}
                      onChange={(e) =>
                        setFormData({ ...formData, PREFIX: e.target.value })
                      }
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="e.g. BD-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Division
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.DIVISION}
                      onChange={(e) =>
                        setFormData({ ...formData, DIVISION: e.target.value })
                      }
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="e.g. Jewelry"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.CATEGORY}
                      onChange={(e) =>
                        setFormData({ ...formData, CATEGORY: e.target.value })
                      }
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="e.g. Rings"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Type
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.TYPE}
                      onChange={(e) =>
                        setFormData({ ...formData, TYPE: e.target.value })
                      }
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="e.g. Diamond Ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Brand
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isViewOnly}
                      value={formData.BRAND}
                      onChange={(e) =>
                        setFormData({ ...formData, BRAND: e.target.value })
                      }
                      className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                      placeholder="e.g. Blue Diamond"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        readOnly={isViewOnly}
                        value={formData.PRICE}
                        onChange={(e) =>
                          setFormData({ ...formData, PRICE: e.target.value })
                        }
                        className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Stock
                      </label>
                      <input
                        type="number"
                        required
                        readOnly={isViewOnly}
                        value={formData.STOCK}
                        onChange={(e) =>
                          setFormData({ ...formData, STOCK: e.target.value })
                        }
                        className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Description (note: backend spelling DECRIPTION)
                  </label>
                  <textarea
                    required
                    readOnly={isViewOnly}
                    value={formData.DECRIPTION}
                    onChange={(e) =>
                      setFormData({ ...formData, DECRIPTION: e.target.value })
                    }
                    rows="4"
                    className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isViewOnly ? "bg-gray-50 border-gray-200" : "bg-white border-gray-300"}`}
                    placeholder="Enter full product description..."
                  />
                </div>
              </form>
            </div>

            <div className="flex justify-end items-center gap-3 p-6 bg-gray-50 border-t">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isViewOnly ? "Close" : "Cancel"}
              </button>
              {!isViewOnly && (
                <button
                  form="product-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 z-50">
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={() => setError("")}
            className="hover:bg-white/20 p-1 rounded-full text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
