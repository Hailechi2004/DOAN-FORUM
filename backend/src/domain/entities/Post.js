class Post {
  constructor({
    id,
    author_id,
    title,
    content,
    visibility,
    category_id,
    department_id,
    team_id,
    allowed_group_id,
    pinned,
    pinned_by,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    // Aggregated fields
    author_name,
    author_full_name,
    author_avatar,
    category_name,
    total_reactions,
    total_comments,
    total_shares,
    total_views,
    user_reaction,
    is_saved,
  }) {
    this.id = id;
    this.author_id = author_id;
    this.title = title;
    this.content = content;
    this.visibility = visibility || "company";
    this.category_id = category_id;
    this.department_id = department_id;
    this.team_id = team_id;
    this.allowed_group_id = allowed_group_id;
    this.pinned = pinned || false;
    this.pinned_by = pinned_by;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    this.deleted_by = deleted_by;

    // Aggregated fields
    this.author_name = author_name;
    this.author_full_name = author_full_name;
    this.author_avatar = author_avatar;
    this.category_name = category_name;
    this.total_reactions = total_reactions || 0;
    this.total_comments = total_comments || 0;
    this.total_shares = total_shares || 0;
    this.total_views = total_views || 0;
    this.user_reaction = user_reaction;
    this.is_saved = is_saved || false;
  }

  // Business logic methods
  isDeleted() {
    return this.deleted_at !== null && this.deleted_at !== undefined;
  }

  isOwnedBy(userId) {
    return this.author_id === userId;
  }

  isPinned() {
    return this.pinned === true || this.pinned === 1;
  }

  isPublic() {
    return this.visibility === "company";
  }

  isDepartmentOnly() {
    return this.visibility === "department";
  }

  isTeamOnly() {
    return this.visibility === "team";
  }

  isPrivate() {
    return this.visibility === "private";
  }

  canBeViewedBy(user) {
    if (this.isDeleted()) return false;

    // Author can always view
    if (this.isOwnedBy(user.id)) return true;

    // Admin can always view
    if (user.role === "admin") return true;

    // Public posts
    if (this.isPublic()) return true;

    // Department posts
    if (this.isDepartmentOnly() && user.department_id === this.department_id) {
      return true;
    }

    // Team posts
    if (this.isTeamOnly() && user.team_id === this.team_id) {
      return true;
    }

    // Private posts
    if (this.isPrivate()) return false;

    return false;
  }

  canBeEditedBy(user) {
    if (this.isDeleted()) return false;

    // Only author and admin can edit
    return this.isOwnedBy(user.id) || user.role === "admin";
  }

  canBeDeletedBy(user) {
    if (this.isDeleted()) return false;

    // Author, admin, or manager can delete
    return (
      this.isOwnedBy(user.id) ||
      user.role === "admin" ||
      user.role === "manager"
    );
  }

  canBePinnedBy(user) {
    // Only admin and manager can pin
    return user.role === "admin" || user.role === "manager";
  }

  hasUserReacted(userId) {
    return this.user_reaction !== null && this.user_reaction !== undefined;
  }

  isSavedByUser() {
    return this.is_saved === true || this.is_saved === 1;
  }

  getEngagementScore() {
    // Simple engagement score calculation
    return (
      this.total_reactions * 2 +
      this.total_comments * 3 +
      this.total_shares * 5 +
      this.total_views * 0.1
    );
  }

  isPopular() {
    return this.getEngagementScore() > 100;
  }

  isTrending() {
    // Post is trending if created in last 24 hours and has high engagement
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const createdAt = new Date(this.created_at);
    return createdAt > oneDayAgo && this.getEngagementScore() > 50;
  }

  toJSON() {
    return {
      id: this.id,
      author_id: this.author_id,
      title: this.title,
      content: this.content,
      visibility: this.visibility,
      category_id: this.category_id,
      department_id: this.department_id,
      team_id: this.team_id,
      allowed_group_id: this.allowed_group_id,
      pinned: this.pinned,
      pinned_by: this.pinned_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      deleted_by: this.deleted_by,
      author_name: this.author_name,
      author_full_name: this.author_full_name,
      author_avatar: this.author_avatar,
      category_name: this.category_name,
      total_reactions: this.total_reactions,
      total_comments: this.total_comments,
      total_shares: this.total_shares,
      total_views: this.total_views,
      user_reaction: this.user_reaction,
      is_saved: this.is_saved,
    };
  }
}

module.exports = Post;
