import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { PopulatedFavList } from '../@types/audio';
import { paginationQuery } from '../@types/misc';
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

  if (status === 'added') {
    await Audio.findByIdAndUpdate(
      audioId,
      { $addToSet: { likes: req.user.id } },
      { new: true }
    );
  }
  if (status === 'removed') {
    await Audio.findByIdAndUpdate(
      audioId,
      { $pull: { likes: req.user.id } },
      { new: true }
    );
  }

  res.json({ status });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  const { limit = '20', page = '0' } = req.query as paginationQuery;

  const favorites = await Favorite.aggregate([
    { $match: { owner: userId } },
    {
      $project: {
        audioIds: {
          $slice: ['$items', parseInt(limit) * parseInt(page), parseInt(limit)],
        },
      },
    },
    { $unwind: '$audioIds' },
    {
      $lookup: {
        from: 'audios',
        localField: 'audioIds',
        foreignField: '_id',
        as: 'audioInfo',
      },
    },
    { $unwind: '$audioInfo' },
    {
      $lookup: {
        from: 'users',
        localField: 'audioInfo.owner',
        foreignField: '_id',
        as: 'ownerInfo',
      },
    },
    { $unwind: '$ownerInfo' },
    {
      $project: {
        _id: 0,
        id: '$audioInfo._id',
        title: '$audioInfo.title',
        about: '$audioInfo.about',
        category: '$audioInfo.category',
        file: '$audioInfo.file.url',
        poster: '$audioInfo.poster.url',
        owner: { name: '$ownerInfo.name', id: '$ownerInfo._id' },
      },
    },
  ]);

  return res.json({ audios: favorites });
};
export const getIsFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;

  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: 'Invalid audio id!' });

  const favorite = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.json({ result: favorite ? true : false });
};
