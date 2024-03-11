import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { AudioDocument } from '../models/audio';

export type PopulatedFavList = AudioDocument<{ _id: ObjectId; name: string }>;

export interface CreatePlaylistRequest extends Request {
  body: { title: string; resId: string; visibility: 'public' | 'private' };
}
