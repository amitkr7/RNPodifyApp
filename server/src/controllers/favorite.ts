import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import Audio from '../models/audio';
import Favorite from '../models/favorite';

export const toggleFavorite: RequestHandler = async (req, res) => {
  let status: 'removed' | 'added';

  const audioId = req.query.audioId as string;
  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: 'Audio Id is invalid' });

  const audio = await Audio.findById(audioId);
  if (!audio) return res.status(404).json({ error: 'Resources not found' });

  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });
  if (alreadyExists) {
    await Favorite.updateOne(
      {
        owner: req.user.id,
      },
      { $pull: { items: audioId } }
    );
    status = 'removed';
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });
    if (favorite) {
      await Favorite.updateOne(
        { owner: req.user.id },
        { $addToSet: { items: audioId } }
      );
    } else {
      await Favorite.create({ owner: req.user.id, items: [audioId] });
    }
    status = 'added';
  }
  res.json({ status });
};
