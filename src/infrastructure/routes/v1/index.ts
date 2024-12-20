// src/infrastructure/routes/v1/index.ts

import express from 'express';
import { userRouter } from './userRoutes';
import { authRouter } from './authRoutes';
import { protectedRouter } from './protectedRoutes';
import { villageRouter } from './villageRoutes';
import { pengumumanRouter } from './pengumumanRoutes';
import { kategoriRouter } from './kategoriRoutes';
import { tamuWajibLaporRouter } from './tamuWajibLaporRoutes';
import { suratRouter } from './suratRoutes';
import { financeRouter } from './financeRoutes';
import { beritaRouter } from './beritaRoutes';
import { beritaKategoriRouter } from './beritaKategoriRoutes';
import { heroBannerRouter } from './heroBannerRoutes';
import { tourismRouter } from './tourismRoutes';
import { submissionRouter } from './submissionRoutes';

const router = express.Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/village', villageRouter);
router.use('/pengumuman', pengumumanRouter);
router.use('/kategori', kategoriRouter);
router.use('/tamu-wajib-lapor', tamuWajibLaporRouter);
router.use('/surat', suratRouter);
router.use('/finance', financeRouter)
router.use('/berita', beritaRouter);
router.use('/berita-kategori', beritaKategoriRouter);
router.use('/hero-banner', heroBannerRouter);
router.use('/tourism', tourismRouter);
router.use('/submissions', submissionRouter);

export { router as apiV1Router };