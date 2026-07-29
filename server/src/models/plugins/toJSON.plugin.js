/**
 * toJSON plugin — ARCHITECTURE.md §18.1 (toJSON strips __v & secrets).
 *
 * - Removes `__v`.
 * - Removes any path whose schema options set `private: true`.
 *   (Fields already using `select: false` never load, but this is a defence in
 *   depth so a secret can never leak through a serialised response.)
 * Keeps `_id` as-is to stay consistent with ObjectId references across the app.
 */
export function toJSONPlugin(schema) {
  // Collect paths explicitly marked private in the schema definition.
  const privatePaths = [];
  schema.eachPath((pathname, schemaType) => {
    if (schemaType.options && schemaType.options.private) privatePaths.push(pathname);
  });

  const existingTransform = schema.get('toJSON')?.transform;

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret, options) {
      for (const path of privatePaths) delete ret[path];
      delete ret.__v;
      if (typeof existingTransform === 'function') return existingTransform(doc, ret, options);
      return ret;
    },
  });
}

export default toJSONPlugin;
