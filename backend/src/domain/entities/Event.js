class Event {
  constructor(data) {
    Object.assign(this, data);
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Event;
