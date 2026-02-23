import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createProductSchema } from "../validations/product.validation.js";

//Create Product (Shopkeeper Only)
export const createProduct = asyncHandler(async (req, res) => {
  const { error } = createProductSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { name, description, price, stock } = req.body;

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    shopkeeper: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Get All Products
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    isDelete: false,
  }).populate("shopkeeper", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get Single Product
export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
    isDelete: false,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

//update product
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.shopkeeper.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can update only your own products");
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
});

// Delete Product (Shopkeeper Only + Ownership Check)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.shopkeeper.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can delete only your own products");
  }

  product.isActive = false;
  product.isDelete = true;

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, null, "Product deleted successfully")
  );
});

//add stock
export const addStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    throw new ApiError(400, "Stock quantity must be greater than 0");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Ownership check
  if (product.shopkeeper.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can modify only your own products");
  }

  product.stock += quantity;

  await product.save();

  return res.status(200).json(
    new ApiResponse(200, product, "Stock updated successfully")
  );
});

