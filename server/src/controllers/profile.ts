import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { paginationQuery } from '../@types/misc';
import Audio from '../models/audio';
import User from '../models/user';

export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  let status: 'added' | 'removed';

  if (!isValidObjectId(profileId))
    return res.status(422).json({ error: 'Invalid Profile Id!' });

  const profile = await User.findById(profileId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const alreadyAFollower = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });
  if (alreadyAFollower) {
    await User.updateOne(
      {
        _id: profileId,
      },
      { $pull: { followers: req.user.id } }
    );
    status = 'removed';
  } else {
    await User.updateOne(
      {
        _id: profileId,
      },
      { $addToSet: { followers: req.user.id } }
    );
    status = 'added';
  }
  if (status === 'added') {
    await User.updateOne(
      {
        _id: req.user.id,
      },
      { $addToSet: { followings: profileId } }
    );
  }

  if (status === 'removed') {
    await User.updateOne(
      {
        _id: req.user.id,
      },
      { $pull: { followings: profileId } }
    );
  }
  return res.json({ status });
};

export const getUploads: RequestHandler = async (req, res) => {
  const { page = '0', limit = '20' } = req.query as paginationQuery;

  const data = await Audio.find({ owner: req.user.id })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort('-createdAt');

  const audios = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      file: item.file.url,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: { name: req.user.name, id: req.user.id },
    };
  });

  res.json({ audios });
};
