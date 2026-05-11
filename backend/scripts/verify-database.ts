/**
 * Database Verification Script
 * Monitors and verifies all admin changes are correctly stored in database
 * 
 * Usage: npx ts-node scripts/verify-database.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  module: string;
  totalRecords: number;
  recentChanges: number;
  lastUpdated?: Date;
  status: 'OK' | 'WARNING' | 'ERROR';
  details?: string;
}

async function verifyDatabase(): Promise<void> {
  console.log('\n📊 DATABASE VERIFICATION REPORT');
  console.log('================================\n');

  const results: VerificationResult[] = [];

  try {
    // 1. Check Job Posts
    const jobsCount = (await prisma.$queryRaw`SELECT COUNT(*) as count FROM public."Job"`) as any[];
    const jobCount = jobsCount[0]?.count || 0;
    const recentJobs = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."Job" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
    `) as any[];
    
    results.push({
      module: '💼 Job Posts',
      totalRecords: jobCount,
      recentChanges: recentJobs[0]?.count || 0,
      status: jobCount > 0 ? 'OK' : 'WARNING',
    });

    // 2. Check Companies
    const companiesCount = (await prisma.$queryRaw`SELECT COUNT(*) as count FROM public."Company"`) as any[];
    const companyCount = companiesCount[0]?.count || 0;
    const recentCompanies = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."Company" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
    `) as any[];
    
    results.push({
      module: '🏢 Companies',
      totalRecords: companyCount,
      recentChanges: recentCompanies[0]?.count || 0,
      status: companyCount > 0 ? 'OK' : 'WARNING',
    });

    // 3. Check Students
    const studentsCount = (await prisma.$queryRaw`SELECT COUNT(*) as count FROM public."User"`) as any[];
    const studentCount = studentsCount[0]?.count || 0;
    const recentStudents = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."User" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
    `) as any[];
    
    results.push({
      module: '👥 Students/Users',
      totalRecords: studentCount,
      recentChanges: recentStudents[0]?.count || 0,
      status: studentCount > 0 ? 'OK' : 'WARNING',
    });

    // 4. Check Offers
    const offersCount = (await prisma.$queryRaw`SELECT COUNT(*) as count FROM public."Offer"`) as any[];
    const offerCount = offersCount[0]?.count || 0;
    const recentOffers = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."Offer" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
    `) as any[];
    
    results.push({
      module: '📋 Offers',
      totalRecords: offerCount,
      recentChanges: recentOffers[0]?.count || 0,
      status: offerCount > 0 ? 'OK' : 'WARNING',
    });

    // 5. Check Announcements
    const announcementsCount = (await prisma.$queryRaw`SELECT COUNT(*) as count FROM public."Announcement"`) as any[];
    const announcementCount = announcementsCount[0]?.count || 0;
    const recentAnnouncements = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."Announcement" 
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
    `) as any[];
    
    results.push({
      module: '📢 Announcements',
      totalRecords: announcementCount,
      recentChanges: recentAnnouncements[0]?.count || 0,
      status: announcementCount > 0 ? 'OK' : 'WARNING',
    });

    // Print results table
    console.table(results);

    // 6. Show Recent Changes in Detail
    console.log('\n🔄 RECENT CHANGES (Last 24 Hours)');
    console.log('==================================\n');

    console.log('📝 Updated Job Posts:');
    const recentJobsDetail = (await prisma.$queryRaw`
      SELECT id, title, company, "updatedAt" FROM public."Job" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
      ORDER BY "updatedAt" DESC 
      LIMIT 5
    `) as any[];
    
    if (recentJobsDetail.length > 0) {
      recentJobsDetail.forEach((job: any, i: number) => {
        console.log(`  ${i + 1}. ${job.title} @ ${job.company} (${job.updatedAt})`);
      });
    } else {
      console.log('  ✅ No new job posts in last 24 hours');
    }

    console.log('\n📝 Updated Users/Students:');
    const recentUsersDetail = (await prisma.$queryRaw`
      SELECT id, email, name, "updatedAt" FROM public."User" 
      WHERE "updatedAt" > NOW() - INTERVAL '24 hours'
      ORDER BY "updatedAt" DESC 
      LIMIT 5
    `) as any[];
    
    if (recentUsersDetail.length > 0) {
      recentUsersDetail.forEach((user: any, i: number) => {
        console.log(`  ${i + 1}. ${user.name} (${user.email}) - ${user.updatedAt}`);
      });
    } else {
      console.log('  ✅ No user updates in last 24 hours');
    }

    console.log('\n📝 New Announcements:');
    const recentAnnouncementsDetail = (await prisma.$queryRaw`
      SELECT id, title, "createdAt" FROM public."Announcement" 
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `) as any[];
    
    if (recentAnnouncementsDetail.length > 0) {
      recentAnnouncementsDetail.forEach((ann: any, i: number) => {
        console.log(`  ${i + 1}. ${ann.title} - ${ann.createdAt}`);
      });
    } else {
      console.log('  ✅ No announcements in last 24 hours');
    }

    // 7. Data Integrity Checks
    console.log('\n🔍 DATA INTEGRITY CHECKS');
    console.log('========================\n');

    // Check for orphaned records
    const orphanedJobs = (await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM public."Job" j
      LEFT JOIN public."Company" c ON j."companyId" = c.id
      WHERE c.id IS NULL AND j."companyId" IS NOT NULL
    `) as any[];
    
    console.log(`✅ Orphaned Jobs: ${orphanedJobs[0]?.count || 0} (should be 0)`);

    // Check for duplicate emails
    const duplicateEmails = (await prisma.$queryRaw`
      SELECT email, COUNT(*) as count FROM public."User"
      GROUP BY email HAVING COUNT(*) > 1
    `) as any[];
    
    console.log(`✅ Duplicate Emails: ${duplicateEmails.length} (should be 0)`);

    console.log('\n✅ Database verification complete!\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyDatabase();
