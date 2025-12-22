import Course from '../models/courseModel.js';

// --- Course Controllers ---
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCourseByName = async (req, res) => {
    try {
        const course = await Course.findOne({ name: req.params.name });
        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addCourse = async (req, res) => {
    try {
        const { name, duration, credits, description } = req.body;
        const course = new Course({ name, duration, credits, description, subjects: [] });
        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { name, duration, credits, description } = req.body;
        const course = await Course.findById(req.params.id);
        if (course) {
            course.name = name;
            course.duration = duration;
            course.credits = credits;
            course.description = description;
            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (course) {
            await course.deleteOne();
            res.json({ message: 'Course removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Subject Controllers ---
const addSubject = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (course) {
            const subject = { name: req.body.name, code: req.body.code, credits: req.body.credits };
            course.subjects.push(subject);
            await course.save();
            res.status(201).json(course.subjects[course.subjects.length - 1]);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateSubject = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (course) {
            const subject = course.subjects.id(req.params.subjectId);
            if(subject) {
                subject.name = req.body.name || subject.name;
                subject.code = req.body.code || subject.code;
                subject.credits = req.body.credits || subject.credits;
                await course.save();
                res.json(subject);
            } else {
                 res.status(404).json({ message: 'Subject not found' });
            }
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteSubject = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (course) {
            course.subjects.id(req.params.subjectId).deleteOne();
            await course.save();
            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllSubjects = async (req, res) => {
    try {
        const courses = await Course.find({}, 'subjects.name');
        const subjects = courses.flatMap(course => course.subjects.map(s => s.name));
        const uniqueSubjects = [...new Set(subjects)];
        res.json(uniqueSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getCourses, getCourseByName, addCourse, updateCourse, deleteCourse, addSubject, updateSubject, deleteSubject, getAllSubjects };