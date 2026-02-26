import Faculty from '../models/facultyModel.js';
import User from '../models/userModel.js';
import Stream from '../models/streamModel.js';

const resolveStreamIdByName = async (name) => {
    if (!name) return null;
    const stream = await Stream.findOne({ name }).select('_id').lean();
    return stream?._id || null;
};

const normalizeWorkload = async (workload = []) => {
    const mapped = await Promise.all(workload.map(async (work) => {
        if (work.streamId) return work;
        const streamId = await resolveStreamIdByName(work.stream);
        return streamId ? { ...work, streamId } : work;
    }));
    return mapped;
};

const deriveAssignments = (workload = []) => {
    const assignedStreams = [...new Set(workload.map(w => w.stream).filter(Boolean))];
    const assignedStreamIds = [...new Set(workload.map(w => w.streamId).filter(Boolean))];
    const assignedSubjects = [...new Set(workload.map(w => w.subject).filter(Boolean))];
    return { assignedStreams, assignedStreamIds, assignedSubjects };
};

export const getFaculty = async (req, res) => {
    try {
        const { status, excludeStatus } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        } else if (excludeStatus) {
            filter.status = { $ne: excludeStatus };
        } else {
            filter.status = { $ne: 'Discontinued' };
        }
        const faculty = await Faculty.find(filter).sort({ name: 1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Registry synchronization failed.' });
    }
};

export const getFacultyStats = async (req, res) => {
    try {
        const total = await Faculty.countDocuments({ status: { $ne: 'Discontinued' } });
        const activeNodes = await Faculty.countDocuments({ status: 'Active' });
        const departments = await Faculty.distinct('department', { status: { $ne: 'Discontinued' } });
        const seniorAssets = await Faculty.countDocuments({ status: { $ne: 'Discontinued' }, experienceYears: { $gte: 5 } });

        res.json({
            total,
            activeNodes,
            deptClusters: departments.length,
            seniorAssets,
            syncStatus: 'Optimal'
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats aggregation failure.' });
    }
};

export const discontinueFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Node not found.' });

        const { dateOfLeave, caste, serialNo } = req.body || {};
        faculty.status = 'Discontinued';
        if (dateOfLeave) faculty.dateOfLeave = dateOfLeave;
        if (caste) faculty.caste = caste;
        if (serialNo) faculty.serialNo = serialNo;

        const updated = await faculty.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Discontinue sequence failed.' });
    }
};

export const addFaculty = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase();
        const exists = await Faculty.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Identity Node already exists.' });

        const workload = await normalizeWorkload(req.body.workload || []);
        const assignments = deriveAssignments(workload);
        const faculty = await Faculty.create({ ...req.body, email, workload, ...assignments });
        res.status(201).json(faculty);
    } catch (error) {
        res.status(400).json({ message: 'Transmission error: ' + error.message });
    }
};

export const updateFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (faculty) {
            if (req.body.email) req.body.email = req.body.email.toLowerCase();
            const workload = await normalizeWorkload(req.body.workload || faculty.workload || []);
            const assignments = deriveAssignments(workload);
            Object.assign(faculty, { ...req.body, workload, ...assignments });
            const updated = await faculty.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'Node not found.' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Update sequence failed.' });
    }
};

export const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (faculty) {
            await User.deleteOne({ email: faculty.email });
            await faculty.deleteOne();
            res.json({ message: 'Node purged from registry.' });
        } else {
            res.status(404).json({ message: 'Node not identified.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Purge protocol error.' });
    }
};

export const bulkDeleteFaculty = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid ID sequence provided.' });
        }

        const facultyMembers = await Faculty.find({ _id: { $in: ids } });
        const emails = facultyMembers.map(f => f.email).filter(Boolean);

        if (emails.length > 0) {
            await User.deleteMany({ email: { $in: emails } });
        }
        await Faculty.deleteMany({ _id: { $in: ids } });

        res.json({ message: `${ids.length} nodes successfully purged from registry.` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk purge protocol failed.' });
    }
};

export const bulkDiscontinueFaculty = async (req, res) => {
    try {
        const { ids, dateOfLeave } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid ID sequence provided.' });
        }

        await Faculty.updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'Discontinued', ...(dateOfLeave ? { dateOfLeave } : {}) } }
        );

        res.json({ message: `${ids.length} nodes moved to discontinued registry.` });
    } catch (error) {
        res.status(500).json({ message: 'Bulk discontinue protocol failed.' });
    }
};

export const importFaculty = async (req, res) => {
    const { facultyMembers } = req.body;
    if (!Array.isArray(facultyMembers)) return res.status(400).json({ message: 'Invalid data stream.' });

    try {
        const results = { imported: 0, failed: 0, errors: [] };
        
        // Fetch all existing emails to prevent duplicates in memory first
        const existingEmails = new Set(
            (await Faculty.find({}, 'email')).map(f => f.email.toLowerCase())
        );

        const newNodes = [];

        for (const f of facultyMembers) {
            try {
                const email = f.email?.toLowerCase().trim();
                if (!email) throw new Error('Missing Identity Email');
                
                if (existingEmails.has(email)) {
                    throw new Error('Duplicate Identity Logged');
                }

                const workload = await normalizeWorkload(f.workload || []);
                const assignments = deriveAssignments(workload);
                newNodes.push({
                    ...f,
                    email,
                    status: f.status || 'Active',
                    workload,
                    ...assignments
                });
                
                existingEmails.add(email);
                results.imported++;
            } catch (err) {
                results.failed++;
                results.errors.push({ node: f.name || 'Unknown', reason: err.message });
            }
        }

        if (newNodes.length > 0) {
            await Faculty.insertMany(newNodes, { ordered: false });
        }

        res.status(201).json(results);
    } catch (error) {
        console.error("Bulk Import Error:", error);
        res.status(500).json({ message: 'Bulk injection failed.', details: error.message });
    }
};

export const exportFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find({ status: { $ne: 'Discontinued' } }).lean();
        const rows = faculty.map(f => ({
            name: f.name,
            email: f.email,
            department: f.department,
            subject: f.subject,
            phone: f.phone,
            experienceYears: f.experienceYears,
            status: f.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="faculty.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};