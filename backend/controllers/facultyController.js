import Faculty from '../models/facultyModel.js';
import User from '../models/userModel.js';

export const getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find({}).sort({ name: 1 });
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Registry synchronization failed.' });
    }
};

export const getFacultyStats = async (req, res) => {
    try {
        const total = await Faculty.countDocuments();
        const activeNodes = await Faculty.countDocuments({ status: 'Active' });
        const departments = await Faculty.distinct('department');
        const seniorAssets = await Faculty.countDocuments({ experienceYears: { $gte: 5 } });

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

export const addFaculty = async (req, res) => {
    try {
        const email = req.body.email.toLowerCase();
        const exists = await Faculty.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Identity Node already exists.' });

        const faculty = await Faculty.create({ ...req.body, email });
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
            Object.assign(faculty, req.body);
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

                newNodes.push({
                    ...f,
                    email,
                    status: f.status || 'Active'
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