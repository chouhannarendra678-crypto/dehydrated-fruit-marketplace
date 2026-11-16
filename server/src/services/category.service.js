const Category = require('../models/category.model');

class CategoryService {
  async getAllCategories() {
    return await Category.find({ isActive: true }).sort({ name: 1 });
  }

  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async createCategory(data) {
    const existing = await Category.findOne({ name: data.name.trim() });
    if (existing) {
      const error = new Error('A category with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    const slug = await Category.generateSlug(data.name.trim());
    return await Category.create({
      name: data.name.trim(),
      slug,
      description: data.description || '',
      image: data.image || { url: '', publicId: '' },
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  }

  async updateCategory(id, data) {
    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.name && data.name.trim() !== category.name) {
      const existing = await Category.findOne({
        name: data.name.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        const error = new Error('Category name already in use');
        error.statusCode = 409;
        throw error;
      }
      category.name = data.name.trim();
      category.slug = await Category.generateSlug(category.name);
    }

    if (data.description !== undefined) category.description = data.description;
    if (data.image) category.image = data.image;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await category.save();
    return category;
  }

  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    await category.deleteOne();
    return { message: 'Category removed successfully' };
  }
}

module.exports = new CategoryService();
