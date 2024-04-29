import { RequestHandler } from 'express';
import moment from 'moment';
import { isValidObjectId, ObjectId, PipelineStage } from 'mongoose';
import { paginationQuery } from '../@types/misc';
import Audio, { AudioDocument } from '../models/audio';
import History from '../models/history';
import Playlist from '../models/playlist';
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
export const getPublicUploads: RequestHandler = async (req, res) => {
  const { page = '0', limit = '20' } = req.query as paginationQuery;
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ erorr: 'Invalid profile Id' });

  const data = await Audio.find({ owner: profileId })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort('-createdAt')
    .populate<AudioDocument<{ name: string; _id: ObjectId }>>('owner');

  const audios = data.map((item) => {
    return {
      id: item._id,
      title: item.title,
      about: item.about,
      file: item.file.url,
      poster: item.poster?.url,
      date: item.createdAt,
      owner: { name: item.owner.name, id: item.owner._id },
    };
  });

  res.json({ audios });
};
export const getPublicProfile: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ erorr: 'Invalid profile Id' });

  const user = await User.findById(profileId);
  if (!user) return res.status(404).json({ error: 'User not found!' });

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      followers: user.followers.length,
      avatar: user.avatar?.url,
    },
  });
};
export const getPublicPlaylist: RequestHandler = async (req, res) => {
  const { profileId } = req.params;
  const { page = '0', limit = '20' } = req.query as paginationQuery;

  if (!isValidObjectId(profileId))
    return res.status(422).json({ erorr: 'Invalid profile Id' });

  const playlist = await Playlist.find({
    owner: profileId,
    visibility: 'public',
  })
    .skip(parseInt(limit) * parseInt(page))
    .limit(parseInt(limit))
    .sort('-createdAt');

  if (!playlist) return res.json({ playlist: [] });

  res.json({
    playlist: playlist.map((item) => {
      return {
        id: item._id,
        title: item.title,
        itemsCount: item.items.length,
        visibility: item.visibility,
      };
    }),
  });
};

export const getRecommendedByProfile: RequestHandler = async (req, res) => {
  const user = req.user;

  let matchOptions: PipelineStage.Match = {
    $match: { _id: { $exists: true } },
  };

  if (user) {
    const usersPreviousHistory = await History.aggregate([
      { $match: { owner: user.id } },
      { $unwind: '$all' },
      {
        $match: {
          'all.date': {
            $gte: moment().subtract(30, 'days').toDate(),
          },
        },
      },
      { $group: { _id: '$all.audio' } },
      {
        $lookup: {
          from: 'audios',
          localField: '_id',
          foreignField: '_id',
          as: 'audioData',
        },
      },
      { $unwind: '$audioData' },
      { $group: { _id: null, category: { $addToSet: '$audioData.category' } } },
    ]);

    const categories = usersPreviousHistory[0]?.category;
    if (categories.length) {
      matchOptions = { $match: { category: { $in: categories } } };
    }
  }

  const audios = await Audio.aggregate([
    matchOptions,
    { $sort: { 'likes.count': -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'owner',
      },
    },
    { $unwind: '$owner' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: '$title',
        category: '$category',
        about: '$about',
        file: '$file.url',
        poster: '$poster.url',
        owner: { name: '$owner.name', id: '$owner._id' },
      },
    },
  ]);

  res.json({ audios });
};
