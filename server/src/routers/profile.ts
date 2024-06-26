import { Router } from 'express';
import {
  getAutoGeneratedPlaylist,
  getFollowersProfile,
  getFollowersProfilePublic,
  getFollowingsProfile,
  getIsFollowing,
  getPlaylistAudios,
  getPrivatePlaylistAudios,
  getPublicPlaylist,
  getPublicProfile,
  getPublicUploads,
  getRecommendedByProfile,
  getUploads,
  updateFollower,
} from '../controllers/profile';
import { authenticateUser, isAuth } from '../middleware/auth';

const router = Router();

router.post('/update-profile/:profileId', authenticateUser, updateFollower);
router.get('/uploads', authenticateUser, getUploads);
router.get('/uploads/:profileId', getPublicUploads);
router.get('/info/:profileId', getPublicProfile);
router.get('/playlist/:profileId', getPublicPlaylist);
router.get('/recommended', isAuth, getRecommendedByProfile);
router.get(
  '/auto-generated-playlist',
  authenticateUser,
  getAutoGeneratedPlaylist
);
router.get('/followers', authenticateUser, getFollowersProfile);
router.get(
  '/followers/:profileId',
  authenticateUser,
  getFollowersProfilePublic
);
router.get('/followings', authenticateUser, getFollowingsProfile);
router.get('/playlist-audios/:playlistId', getPlaylistAudios);
router.get(
  '/private-playlist-audios/:playlistId',
  authenticateUser,
  getPrivatePlaylistAudios
);
router.get('/is-following/:profileId', authenticateUser, getIsFollowing);

export default router;
