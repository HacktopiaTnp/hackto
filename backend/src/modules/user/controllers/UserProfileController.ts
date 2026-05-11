import { Router, Request, Response } from 'express';
import { authMiddleware, tenantMiddleware } from '@api/middleware/auth.middleware';
import { handleValidationErrors } from '@api/middleware/validation.middleware';
import { asyncHandler } from '@api/middleware/error.middleware';
import UserProfileService from '../services/UserProfileService';
import { logger } from '@core/logger/logger';
import { body, query } from 'express-validator';

const router = Router();
const profileService = new UserProfileService();

/**
 * @route GET /user/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get(
  '/profile',
  authMiddleware,
  tenantMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenant_id;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await profileService.getProfile(userId, tenantId);

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({
      success: true,
      data: profile,
    });
  })
);

/**
 * @route POST /user/profile
 * @desc Create or update user profile
 * @access Private
 */
router.post(
  '/profile',
  authMiddleware,
  tenantMiddleware,
  [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('bio').optional().trim(),
    body('avatar_url').optional().isURL().withMessage('Invalid URL'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenant_id;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await profileService.upsertProfile(userId, tenantId, {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      avatar_url: req.body.avatar_url,
      metadata: req.body.metadata,
    });

    logger.info('Profile updated via API', { userId, tenantId });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  })
);

/**
 * @route PUT /user/profile
 * @desc Fully update user profile
 * @access Private
 */
router.put(
  '/profile',
  authMiddleware,
  tenantMiddleware,
  [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('bio').optional().trim(),
    body('avatar_url').optional().isURL().withMessage('Invalid URL'),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenant_id;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await profileService.upsertProfile(userId, tenantId, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  })
);

/**
 * @route PATCH /user/profile/avatar
 * @desc Update user avatar
 * @access Private
 */
router.patch(
  '/profile/avatar',
  authMiddleware,
  tenantMiddleware,
  [body('avatar_url').isURL().withMessage('Invalid avatar URL')],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenant_id;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await profileService.updateAvatar(userId, tenantId, req.body.avatar_url);

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: profile,
    });
  })
);

/**
 * @route GET /user/profiles
 * @desc Get all tenant profiles (admin/recruiter only)
 * @access Private - Admin/Recruiter only
 */
router.get(
  '/profiles',
  authMiddleware,
  tenantMiddleware,
  [
    query('skip').optional().isInt({ min: 0 }).toInt(),
    query('take').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenant_id;
    const userRole = req.user?.role;
    const skip = (req.query.skip as any) || 0;
    const take = (req.query.take as any) || 10;

    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check role: only admin and recruiter can list all profiles
    if (userRole !== 'admin' && userRole !== 'recruiter') {
      res.status(403).json({ error: 'Forbidden: Only admin and recruiter can list profiles' });
      return;
    }

    const result = await profileService.getProfilesByTenant(tenantId, skip, take);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
      skip,
      take,
    });
  })
);

/**
 * @route GET /user/profiles/search
 * @desc Search profiles by name
 * @access Private
 */
router.get(
  '/profiles/search',
  authMiddleware,
  tenantMiddleware,
  [query('q').trim().notEmpty().withMessage('Search query is required')],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.user?.tenant_id;
    const searchQuery = req.query.q as string;

    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profiles = await profileService.searchProfiles(searchQuery, tenantId);

    res.json({
      success: true,
      data: profiles,
    });
  })
);

/**
 * @route DELETE /user/profile
 * @desc Delete user profile (soft delete)
 * @access Private
 */
router.delete(
  '/profile',
  authMiddleware,
  tenantMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const tenantId = req.user?.tenant_id;

    if (!userId || !tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await profileService.deleteProfile(userId, tenantId);

    res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  })
);

export default router;
