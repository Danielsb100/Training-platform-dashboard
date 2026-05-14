const prisma = require('./config/db');

async function createTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CourseEditor" (
          "id" SERIAL NOT NULL,
          "courseId" INTEGER NOT NULL,
          "userId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "CourseEditor_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CourseEditor" DROP CONSTRAINT IF EXISTS "CourseEditor_courseId_fkey";
      ALTER TABLE "CourseEditor" ADD CONSTRAINT "CourseEditor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CourseEditor" DROP CONSTRAINT IF EXISTS "CourseEditor_userId_fkey";
      ALTER TABLE "CourseEditor" ADD CONSTRAINT "CourseEditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "CourseEditor_courseId_userId_key" ON "CourseEditor"("courseId", "userId");
    `);

    console.log('Table CourseEditor created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    process.exit(0);
  }
}

createTable();
