class Project {
  constructor({
    id,
    name,
    description,
    department_id,
    team_id,
    manager_id,
    start_date,
    end_date,
    status,
    is_deleted,
    created_at,
    updated_at,
    // Related fields
    manager_name,
    department_name,
    member_count,
    task_count,
    completed_tasks,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.department_id = department_id;
    this.team_id = team_id;
    this.manager_id = manager_id;
    this.start_date = start_date;
    this.end_date = end_date;
    this.status = status || "planning";
    this.is_deleted = is_deleted || false;
    this.created_at = created_at;
    this.updated_at = updated_at;
    // Related
    this.manager_name = manager_name;
    this.department_name = department_name;
    this.member_count = member_count || 0;
    this.task_count = task_count || 0;
    this.completed_tasks = completed_tasks || 0;
  }

  isDeleted() {
    return this.is_deleted === true;
  }

  isActive() {
    return this.status === "active";
  }

  isCompleted() {
    return this.status === "completed";
  }

  getProgress() {
    if (this.task_count === 0) return 0;
    return Math.round((this.completed_tasks / this.task_count) * 100);
  }
}

module.exports = Project;
