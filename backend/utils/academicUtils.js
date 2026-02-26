export const parseAcademicYear = (academicYear) => {
    if (!academicYear || typeof academicYear !== 'string') return null;
    const match = academicYear.match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    const startYear = parseInt(match[1], 10);
    const endSuffix = parseInt(match[2], 10);
    const century = Math.floor(startYear / 100) * 100;
    let endYear = century + endSuffix;
    if (endYear < startYear) endYear += 100;
    return { startYear, endYear };
};

export const getAcademicYearFromDate = (dateInput = new Date()) => {
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const startYear = month >= 6 ? year : year - 1; // July is month 6
    const endYear = startYear + 1;
    const endSuffix = String(endYear).slice(-2);
    return `${startYear}-${endSuffix}`;
};

export const getSemesterDateRange = (academicYear, semester) => {
    const parsed = parseAcademicYear(academicYear);
    if (!parsed) return null;
    const { startYear } = parsed;
    const sem = parseInt(semester, 10);
    if (!sem || sem < 1) return null;

    const blockIndex = Math.ceil(sem / 2); // 1 for sem1/2, 2 for sem3/4, etc.
    const isOddSemester = sem % 2 === 1;

    if (isOddSemester) {
        const year = startYear + (blockIndex - 1);
        const start = new Date(Date.UTC(year, 6, 1, 0, 0, 0, 0)); // Jul 1
        const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)); // Dec 31
        return { start, end };
    }

    const year = startYear + blockIndex;
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)); // Jan 1
    const end = new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999)); // Jun 30
    return { start, end };
};

export const isDateWithinSemester = (academicYear, semester, dateInput) => {
    const range = getSemesterDateRange(academicYear, semester);
    if (!range) return false;
    const date = new Date(`${dateInput}T00:00:00.000Z`);
    return date >= range.start && date <= range.end;
};

export const getCurrentSemester = (academicYear, dateInput = new Date()) => {
    const parsed = parseAcademicYear(academicYear);
    if (!parsed) return null;
    const { startYear } = parsed;
    const date = new Date(dateInput);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    const monthsDiff = (year - startYear) * 12 + (month - 6);
    if (monthsDiff < 0) return null;
    return Math.floor(monthsDiff / 6) + 1;
};
