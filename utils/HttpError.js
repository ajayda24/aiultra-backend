class HttpError extends Error {
  constructor(message, errCode) {
    super(message.toString())
    this.code = errCode
  }
}

module.exports = HttpError
