import { Model, model, ObjectId, Schema } from 'mongoose';

interface FavoriteDocument {
  owner: ObjectId;
  items: ObjectId[];
}

const favoriteSchema = new Schema<FavoriteDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    items: [{ type: Schema.Types.ObjectId, ref: 'Audio' }],
  },
  { timestamps: true }
);

export default model('Favorite', favoriteSchema) as Model<FavoriteDocument>;
