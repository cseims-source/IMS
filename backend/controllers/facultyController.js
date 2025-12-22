import Faculty from '../models/facultyModel.js';

const getFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.find({});
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addFaculty = async (req, res) => {
    try {
        const { name, subject, email, phone, qualification, assignedStreams, assignedSubjects, photo } = req.body;
        const faculty = new Faculty({ name, subject, email, phone, qualification, assignedStreams, assignedSubjects, photo });
        const createdFaculty = await faculty.save();
        res.status(201).json(createdFaculty);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateFaculty = async (req, res) => {
    try {
        const { name, subject, email, phone, qualification, assignedStreams, assignedSubjects, photo } = req.body;
        const faculty = await Faculty.findById(req.params.id);

        if (faculty) {
            faculty.name = name || faculty.name;
            faculty.subject = subject || faculty.subject;
            faculty.email = email || faculty.email;
            faculty.phone = phone || faculty.phone;
            faculty.qualification = qualification || faculty.qualification;
            if (assignedStreams !== undefined) {
                faculty.assignedStreams = Array.isArray(assignedStreams) ? assignedStreams : [];
            }
            if (assignedSubjects !== undefined) {
                faculty.assignedSubjects = Array.isArray(assignedSubjects) ? assignedSubjects : [];
            }
            if (photo !== undefined) {
                faculty.photo = photo;
            }
            const updatedFaculty = await faculty.save();
            res.json(updatedFaculty);
        } else {
            res.status(404).json({ message: 'Faculty not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (faculty) {
            await faculty.deleteOne();
            res.json({ message: 'Faculty removed' });
        } else {
            res.status(404).json({ message: 'Faculty not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const importFaculty = async (req, res) => {
    const { facultyMembers } = req.body;

    if (!facultyMembers || !Array.isArray(facultyMembers) || facultyMembers.length === 0) {
        return res.status(400).json({ message: 'No faculty data provided.' });
    }

    const newFaculty = [];
    const failedImports = [];
    const incomingEmails = facultyMembers.map(f => f.email).filter(Boolean);

    try {
        const existingFaculty = await Faculty.find({ email: { $in: incomingEmails } });
        const existingEmails = new Set(existingFaculty.map(f => f.email));

        facultyMembers.forEach((member, index) => {
            if (!member.email || !member.name || !member.subject) {
                failedImports.push({ member, reason: `Missing required fields (name, email, subject) on row ${index + 2}.` });
            } else if (existingEmails.has(member.email)) {
                failedImports.push({ member, reason: `Email '${member.email}' already exists.` });
            } else {
                newFaculty.push(member);
                existingEmails.add(member.email);
            }
        });

        let insertedCount = 0;
        if (newFaculty.length > 0) {
            const result = await Faculty.insertMany(newFaculty, { ordered: false });
            insertedCount = result.length;
        }

        res.status(201).json({
            message: 'Import process completed.',
            importedCount: insertedCount,
            failedCount: failedImports.length,
            errors: failedImports,
        });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred during the import process.', error: error.message });
    }
};

export { getFaculty, addFaculty, updateFaculty, deleteFaculty, importFaculty };