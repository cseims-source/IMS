export const calculateAttendancePercentage = (present, total) => {
    if (!total || total <= 0) return 0;
    return Math.round(((present / total) * 100) * 10) / 10;
};

export const isPresentLikeStatus = (status) => {
    return status === 'present' || status === 'late';
};
