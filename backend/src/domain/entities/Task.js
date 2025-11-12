class Task {
  constructor({
    id,
    title,
    description,
    project_id,
    assigned_to,
    created_by,
    priority,
    status,
    due_date,
    is_deleted,
    created_at,
    updated_at,
    // Related fields
    assigned_to_name,
    created_by_name,
    project_name,
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.project_id = project_id;
    this.assigned_to = assigned_to;
    this.created_by = created_by;
    this.priority = priority || "medium";
    this.status = status || "pending";
    this.due_date = due_date;
    this.is_deleted = is_deleted || false;
    this.created_at = created_at;
    this.updated_at = updated_at;
    // Related
    this.assigned_to_name = assigned_to_name;
    this.created_by_name = created_by_name;
    this.project_name = project_name;
  }

  isDeleted() {
    return this.is_deleted === true;
  }

  isCompleted() {
    return this.status === "completed";
  }

  isPending() {
    return this.status === "pending";
  }

  isOverdue() {
    if (!this.due_date) return false;
    return new Date(this.due_date) < new Date() && !this.isCompleted();
  }

  isHighPriority() {
    return this.priority === "high" || this.priority === "urgent";
  }
}

module.exports = Task;
