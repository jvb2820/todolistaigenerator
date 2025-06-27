
// Utility functions for the application

/**
 * Triggers a browser download for the given content or data URL.
 * @param dataUrlOrContent The string content of the file or a data URL.
 * @param fileName The desired name for the downloaded file.
 * @param contentTypeIfContent The MIME type of the file if `dataUrlOrContent` is string content (e.g., 'application/json'). Not used for data URLs.
 */
export const downloadFile = (dataUrlOrContent: string, fileName: string, contentTypeIfContent?: string): void => {
  const a = document.createElement("a");
  let objectUrl: string | null = null;

  if (dataUrlOrContent.startsWith('data:')) {
    a.href = dataUrlOrContent; // It's a data URL
  } else if (contentTypeIfContent) {
    const file = new Blob([dataUrlOrContent], { type: contentTypeIfContent });
    objectUrl = URL.createObjectURL(file);
    a.href = objectUrl;
  } else {
    console.error("downloadFile: contentTypeIfContent is required if dataUrlOrContent is not a data URL.");
    return;
  }
  
  a.download = fileName;
  document.body.appendChild(a); // Required for Firefox
  a.click();
  
  if (objectUrl) { // Only revoke if it was a blob URL
    URL.revokeObjectURL(objectUrl);
  }
  document.body.removeChild(a); // Clean up
};

/**
 * Sanitizes a string to be used as a filename by removing or replacing invalid characters.
 * @param name The original string.
 * @returns A sanitized string suitable for filenames.
 */
export const sanitizeFilename = (name: string): string => {
  // Replace characters not allowed in filenames (you can extend this regex)
  // Replaces: / \ : * ? " < > | and multiple spaces
  let saneName = name.replace(/[/\\:*?"<>|]/g, '_').replace(/\s+/g, ' ');
  // Trim leading/trailing spaces/underscores that might result
  saneName = saneName.replace(/^[_ ]+|[_ ]+$/g, '');
  // Ensure it's not empty, default to 'download'
  return saneName || 'download';
};