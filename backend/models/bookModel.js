import mongoose from 'mongoose';

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, unique: true, sparse: true },
    category: { type: String },
    status: { type: String, required: true, enum: ['Available', 'Issued'], default: 'Available' },
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
