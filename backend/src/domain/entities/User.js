class User {
  constructor({
    id,
    email,
    username,
    password_hash,
    is_online,
    last_seen,
    role,
    is_verified,
    created_at,
    updated_at,
    deleted_at,
    // Profile fields
    full_name,
    phone,
    avatar_url,
    bio,
    birth_date,
    address,
    gender,
    // Employee fields
    employee_id,
    position,
    hire_date,
    department_id,
    team_id,
    // Related fields
    department_name,
    team_name,
    roles,
  }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.password_hash = password_hash;
    this.is_online = is_online || false;
    this.last_seen = last_seen;
    this.role = role || "user";
    this.is_verified = is_verified || false;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    // Profile
    this.full_name = full_name;
    this.phone = phone;
    this.avatar_url = avatar_url;
    this.bio = bio;
    this.birth_date = birth_date;
    this.address = address;
    this.gender = gender;
    // Employee
    this.employee_id = employee_id;
    this.position = position;
    this.hire_date = hire_date;
    this.department_id = department_id;
    this.team_id = team_id;
    // Related
    this.department_name = department_name;
    this.team_name = team_name;
    this.roles = roles;
  }

  isDeleted() {
    return this.deleted_at !== null;
  }

  isOnline() {
    return this.is_online === true;
  }

  isAdmin() {
    return this.role === "admin";
  }

  toJSON() {
    const data = { ...this };
    delete data.password_hash;
    return data;
  }
}

module.exports = User;
