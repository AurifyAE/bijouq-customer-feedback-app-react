const API_BASE_URL = "http://localhost:3000/api/crud";

class ProductApiService {
  // Get all products with pagination and filtering
  static async getProducts(params = {}) {
    // Filter out undefined, null, or empty string values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== "" && value !== null && value !== undefined,
      ),
    );

    const queryString = new URLSearchParams(filteredParams).toString();
    const response = await fetch(`${API_BASE_URL}/products?${queryString}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch products");
    }

    return await response.json();
  }

  // Get single product
  static async getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    return await response.json();
  }

  // Create product
  static async createProduct(productData, imageFile) {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create product");
    }

    return await response.json();
  }

  // Update product
  static async updateProduct(id, productData, imageFile) {
    const formData = new FormData();
    formData.append("productData", JSON.stringify(productData));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update product");
    }

    return await response.json();
  }

  // Delete product
  static async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    return await response.json();
  }

  // Delete multiple products
  static async deleteMultipleProducts(ids) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete products");
    }

    return await response.json();
  }
}

export default ProductApiService;
