import mongoose from 'mongoose';

const libraryTransactionSchema = mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Book' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, required: true, enum: ['Issue', 'Return'] },
    dueDate: { type: Date },
}, {
    timestamps: true // `createdAt` will be the issue/return date
});

const LibraryTransaction = mongoose.model('LibraryTransaction', libraryTransactionSchema);
export default LibraryTransaction;
