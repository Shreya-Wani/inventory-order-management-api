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
  const products = await Product.find().populate("shopkeeper", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get Single Product
export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});