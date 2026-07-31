import crypto from 'crypto';

/**
 * Computes SHA256 hash of file content.
 * Used for deduplication of uploaded XML files.
 */
export function computeFileHash(content: string): string {
  return crypto
    .createHash('sha256')
    .update(content, 'utf-8')
    .digest('hex');
}
