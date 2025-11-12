class Department {
  constructor(data) {
    Object.assign(this, data);
  }

  isDeleted() {
    return this.deleted_at !== null && this.deleted_at !== undefined;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Department;
