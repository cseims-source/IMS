import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/userModel.js';
import Stream from './models/streamModel.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const buildSemesters = (count) => (
  Array.from({ length: count }, (_, i) => ({
    semesterNumber: i + 1,
    subjects: []
  }))
);

const defaultCurriculum = [
  // B.TECH STREAMS
  {
    name: "B.Tech Computer Science",
    level: "Bachelors",
    duration: "4 Years",
    description: "Core computing, algorithms, and AI systems.",
    semesters: [
      { semesterNumber: 1, subjects: [{ name: "Engineering Mathematics-I", code: "MAT101", credits: 4 }, { name: "Programming in C", code: "CSE101", credits: 4 }, { name: "Basic Electronics", code: "ECE101", credits: 3 }] },
      { semesterNumber: 2, subjects: [{ name: "Engineering Mathematics-II", code: "MAT201", credits: 4 }, { name: "Data Structures", code: "CSE201", credits: 4 }, { name: "Physics-I", code: "PHY101", credits: 3 }] },
      { semesterNumber: 3, subjects: [{ name: "Object Oriented Programming", code: "CSE301", credits: 4 }, { name: "Computer Organization", code: "CSE302", credits: 4 }, { name: "Discrete Mathematics", code: "MAT301", credits: 4 }] },
      { semesterNumber: 4, subjects: [{ name: "Operating Systems", code: "CSE401", credits: 4 }, { name: "Design & Analysis of Algorithms", code: "CSE402", credits: 4 }, { name: "Database Management", code: "CSE403", credits: 4 }] },
      { semesterNumber: 5, subjects: [{ name: "Computer Networks", code: "CSE501", credits: 4 }, { name: "Software Engineering", code: "CSE502", credits: 3 }, { name: "Formal Language & Automata", code: "CSE503", credits: 4 }] },
      { semesterNumber: 6, subjects: [{ name: "Compiler Design", code: "CSE601", credits: 4 }, { name: "Artificial Intelligence", code: "CSE602", credits: 4 }, { name: "Machine Learning", code: "CSE603", credits: 4 }] },
      { semesterNumber: 7, subjects: [{ name: "Cloud Computing", code: "CSE701", credits: 3 }, { name: "Cryptography", code: "CSE702", credits: 3 }, { name: "Industrial Project-I", code: "PRJ701", credits: 6 }] },
      { semesterNumber: 8, subjects: [{ name: "Internet of Things", code: "CSE801", credits: 3 }, { name: "Professional Ethics", code: "MGT801", credits: 2 }, { name: "Major Project", code: "PRJ801", credits: 10 }] }
    ]
  },
  {
    name: "B.Tech Computer Science (AI & ML)",
    level: "Bachelors",
    duration: "4 Years",
    description: "Artificial Intelligence and Machine Learning specialization.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Information Technology",
    level: "Bachelors",
    duration: "4 Years",
    description: "Information systems, networks, and software engineering.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Electronics & Communication Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Electronics, communication systems, and embedded design.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Electrical Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Power systems, control, and electrical machines.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Mechanical Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Thermal systems, manufacturing, and mechanics.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Civil Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Infrastructure, structural design, and urban planning.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Chemical Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Process engineering and chemical systems.",
    semesters: buildSemesters(8)
  },
  {
    name: "B.Tech Automobile Engineering",
    level: "Bachelors",
    duration: "4 Years",
    description: "Automotive systems, design, and manufacturing.",
    semesters: buildSemesters(8)
  },

  // MCA
  {
    name: "MCA",
    level: "Masters",
    duration: "2 Years",
    description: "Advanced computer applications and software development.",
    semesters: [
      { semesterNumber: 1, subjects: [{ name: "Adv. Data Structures", code: "MCA101", credits: 4 }, { name: "Computer Networks", code: "MCA102", credits: 4 }] },
      { semesterNumber: 2, subjects: [{ name: "Java Technologies", code: "MCA201", credits: 4 }, { name: "Software Testing", code: "MCA202", credits: 3 }] },
      { semesterNumber: 3, subjects: [{ name: "Cloud Computing", code: "MCA301", credits: 4 }, { name: "Big Data Analytics", code: "MCA302", credits: 4 }] },
      { semesterNumber: 4, subjects: [{ name: "System Project", code: "MCA401", credits: 12 }] }
    ]
  },

  // DIPLOMA
  {
    name: "Diploma Mechanical Engineering",
    level: "Diploma",
    duration: "3 Years",
    description: "Technical foundation in mechanical systems.",
    semesters: buildSemesters(6)
  },
  {
    name: "Diploma Civil Engineering",
    level: "Diploma",
    duration: "3 Years",
    description: "Foundational civil and construction engineering.",
    semesters: buildSemesters(6)
  },
  {
    name: "Diploma Electrical Engineering",
    level: "Diploma",
    duration: "3 Years",
    description: "Electrical systems, power, and machines.",
    semesters: buildSemesters(6)
  },
  {
    name: "Diploma Computer Science",
    level: "Diploma",
    duration: "3 Years",
    description: "Programming fundamentals and applied computing.",
    semesters: buildSemesters(6)
  },
  {
    name: "Diploma Electronics & Communication",
    level: "Diploma",
    duration: "3 Years",
    description: "Electronics fundamentals and communication basics.",
    semesters: buildSemesters(6)
  }
];

const seedSystem = async () => {
  await connectDB();

  try {
    // 1. Seed Admin
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log('--- Initializing Admin Node ---');
      await User.create({
        name: process.env.INITIAL_ADMIN_NAME || 'Super Admin',
        email: process.env.INITIAL_ADMIN_EMAIL || 'admin@aiet.ac.in',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'admin123',
        role: 'Admin',
      });
      console.log('✅ Admin user created.');
    }

    // 2. Seed Curriculum
    console.log('--- Syncing Institutional Curriculum ---');
    await Stream.deleteMany({}); // Wipe old curriculum logic
    await Stream.insertMany(defaultCurriculum);
    console.log(`✅ ${defaultCurriculum.length} Streams synchronized with semesters and subjects.`);

    console.log('🚀 SYSTEM SEED COMPLETE.');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedSystem();