const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const buildAbsoluteUrl = (path) => {
    const normalized = path.replace(/\\/g, '/').trim();
    if (!API_BASE_URL) return normalized;
    if (normalized.startsWith('/')) return `${API_BASE_URL}${normalized}`;
    return `${API_BASE_URL}/${normalized.replace(/^\.\//, '')}`;
};

const buildDriveImageUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;

export const normalizePhotoUrl = (value) => {
    if (!value) return '';
    if (typeof value !== 'string') return '';

    const trimmed = value.trim();
    if (!trimmed) return '';

    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

    if (trimmed.includes('drive.google.com')) {
        const fileMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch?.[1]) {
            return buildDriveImageUrl(fileMatch[1]);
        }

        const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch?.[1]) {
            return buildDriveImageUrl(idMatch[1]);
        }

        try {
            const url = new URL(trimmed);
            const id = url.searchParams.get('id');
            if (id) {
                return buildDriveImageUrl(id);
            }
        } catch {
            return '';
        }
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    return buildAbsoluteUrl(trimmed);
};
