class Category {
  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Category;
