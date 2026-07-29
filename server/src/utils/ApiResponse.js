/**
 * ApiResponse — the single success envelope shape. ARCHITECTURE.md §10.1.
 *
 *   { success, message, data, meta }
 *
 * Guarantees one predictable shape across all endpoints so the frontend Axios
 * interceptor can parse every response identically (§5.2).
 */
export class ApiResponse {
  /**
   * @param {number} statusCode  HTTP status (200/201/…)
   * @param {*} data             Payload
   * @param {string} [message]   Human-readable message
   * @param {object|null} [meta] Pagination / extra metadata
   */
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  /** Serialise and send with the correct status. */
  send(res) {
    const body = {
      success: this.success,
      message: this.message,
      data: this.data,
    };
    if (this.meta) body.meta = this.meta;
    return res.status(this.statusCode).json(body);
  }
}

export default ApiResponse;
