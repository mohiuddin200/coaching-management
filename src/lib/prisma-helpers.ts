import { prisma } from '@/lib/prisma';

/**
 * Helper function to create a where clause that excludes soft-deleted records
 */
export function excludeSoftDeleted() {
  return {
    isDeleted: false
  };
}

/**
 * Helper function to get only soft-deleted records
 */
export function onlySoftDeleted() {
  return {
    isDeleted: true
  };
}

/**
 * Enhanced student findMany with soft delete filtering
 */
export const studentFindMany = (args?: Parameters<typeof prisma.student.findMany>[0]) => {
  return prisma.student.findMany({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced student findUnique with soft delete filtering
 */
export const studentFindUnique = (args: Parameters<typeof prisma.student.findUnique>[0]) => {
  return prisma.student.findUnique({
    ...args,
    where: {
      ...args.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced student findFirst with soft delete filtering
 */
export const studentFindFirst = (args?: Parameters<typeof prisma.student.findFirst>[0]) => {
  return prisma.student.findFirst({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced teacher findMany with soft delete filtering
 */
export const teacherFindMany = (args?: Parameters<typeof prisma.teacher.findMany>[0]) => {
  return prisma.teacher.findMany({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced teacher findUnique with soft delete filtering
 */
export const teacherFindUnique = (args: Parameters<typeof prisma.teacher.findUnique>[0]) => {
  return prisma.teacher.findUnique({
    ...args,
    where: {
      ...args.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced teacher findFirst with soft delete filtering
 */
export const teacherFindFirst = (args?: Parameters<typeof prisma.teacher.findFirst>[0]) => {
  return prisma.teacher.findFirst({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced student count with soft delete filtering
 */
export const studentCount = (args?: Parameters<typeof prisma.student.count>[0]) => {
  return prisma.student.count({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};

/**
 * Enhanced teacher count with soft delete filtering
 */
export const teacherCount = (args?: Parameters<typeof prisma.teacher.count>[0]) => {
  return prisma.teacher.count({
    ...args,
    where: {
      ...args?.where,
      isDeleted: false
    }
  });
};