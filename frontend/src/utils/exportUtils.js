/**
 * Export Utility Functions
 * Handles authenticated file downloads from API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Download file from API endpoint with authentication
 * @param {string} endpoint - API endpoint (e.g., '/api/admission/export')
 * @param {string} filename - Name for the downloaded file
 * @param {Object} params - Query parameters (optional)
 * @param {string} format - File format (csv, xlsx, json) (default: csv)
 */
export const handleAuthenticatedExport = async (endpoint, filename, params = {}, format = 'csv') => {
    try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Not authenticated. Please login first.');
        }

        // Build query string
        const queryParams = new URLSearchParams({
            format,
            ...params,
        });

        // Fetch with token in headers
        const response = await fetch(`${API_BASE_URL}${endpoint}?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Handle errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Export failed: ${response.statusText}`);
        }

        // Get the blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};

/**
 * Export CSV with specific filename and extension
 */
export const exportAsCSV = (endpoint, filename, params = {}) => {
    return handleAuthenticatedExport(endpoint, `${filename}.csv`, params, 'csv');
};

/**
 * Export XLSX with specific filename and extension
 */
export const exportAsXLSX = (endpoint, filename, params = {}) => {
    return handleAuthenticatedExport(endpoint, `${filename}.xlsx`, params, 'xlsx');
};

/**
 * Export JSON with specific filename and extension
 */
export const exportAsJSON = (endpoint, filename, params = {}) => {
    return handleAuthenticatedExport(endpoint, `${filename}.json`, params, 'json');
};

/**
 * Helper to determine file extension based on format
 */
export const getFileExtension = (format) => {
    const extensions = {
        csv: 'csv',
        xlsx: 'xlsx',
        json: 'json',
    };
    return extensions[format] || 'csv';
};

/**
 * Export with error handling and toast notification
 * @param {Function} addToast - Toast notification function
 * @param {string} endpoint - API endpoint
 * @param {string} filename - Download filename
 * @param {Object} params - Query parameters
 * @param {string} format - File format
 */
export const handleExportWithNotification = async (addToast, endpoint, filename, params = {}, format = 'csv') => {
    try {
        await handleAuthenticatedExport(endpoint, `${filename}.${getFileExtension(format)}`, params, format);
        addToast(`${filename} exported successfully`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        addToast(error.message || 'Export failed. Please try again.', 'error');
    }
};
