class Reaction {
  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Reaction;
