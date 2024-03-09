import { ObjectId } from 'mongoose';
import { AudioDocument } from '../models/audio';

export type PopulatedFavList = AudioDocument<{ _id: ObjectId; name: string }>;
